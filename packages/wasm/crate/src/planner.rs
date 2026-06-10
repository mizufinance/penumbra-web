use anyhow::{anyhow, Context};
use decaf377::Fr;
use rand_core::OsRng;
use shieldd_asset::Value;
use shieldd_keys::keys::AddressIndex;
use shieldd_keys::{Address, FullViewingKey};
use shieldd_num::Amount;
use shieldd_proto::view::v1::TransactionPlannerRequest;
use shieldd_proto::{DomainType, Message};
use shieldd_shielded_pool::{
    Ics20Withdrawal, ShieldedIcs20WithdrawalFamilyId, ShieldedIcs20WithdrawalPlan,
    ShieldedInputPlan, ShieldedOutputPlan, TransferPlan,
};
use shieldd_transaction::memo::MemoPlaintext;
use shieldd_transaction::{plan::MemoPlan, ActionPlan, TransactionParameters, TransactionPlan};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;

use crate::database::interface::Database;
use crate::error::WasmResult;
use crate::note_record::SpendableNoteRecord;
use crate::storage::{init_idb_storage, DbConstants, Storage};
use crate::utils;

#[wasm_bindgen]
pub async fn plan_transaction(
    idb_constants: JsValue,
    request: &[u8],
    full_viewing_key: &[u8],
    _gas_fee_token: &[u8],
    grpc_url: String,
) -> WasmResult<Vec<u8>> {
    utils::set_panic_hook();

    let tx_planner_req = TransactionPlannerRequest::decode(request)
        .context("transaction planner request is malformed")?;
    let full_viewing_key = FullViewingKey::decode(full_viewing_key)?;
    let constants: DbConstants = serde_wasm_bindgen::from_value(idb_constants)?;
    let storage = init_idb_storage(constants).await?;

    let plan = plan_transaction_inner(storage, tx_planner_req, full_viewing_key, grpc_url).await?;
    Ok(plan.encode_to_vec())
}

pub async fn plan_transaction_inner<Db: Database>(
    storage: Storage<Db>,
    request: TransactionPlannerRequest,
    full_viewing_key: FullViewingKey,
    grpc_url: String,
) -> WasmResult<TransactionPlan> {
    let source: AddressIndex = request
        .source
        .clone()
        .map(TryInto::try_into)
        .transpose()?
        .unwrap_or_default();

    let mut actions = Vec::new();

    if !request.outputs.is_empty() {
        let outputs = request
            .outputs
            .iter()
            .map(|output| {
                let value: Value = output
                    .value
                    .clone()
                    .ok_or_else(|| anyhow!("transfer output missing value"))?
                    .try_into()?;
                let address: Address = output
                    .address
                    .clone()
                    .ok_or_else(|| anyhow!("transfer output missing address"))?
                    .try_into()?;
                Ok((value, address))
            })
            .collect::<Result<Vec<_>, anyhow::Error>>()?;

        let action = plan_transfer(&storage, source, outputs).await?;
        actions.push(ActionPlan::Transfer(action));
    }

    for withdrawal in request.ics20_withdrawals {
        let withdrawal: Ics20Withdrawal = withdrawal.try_into()?;
        let action = plan_ics20_withdrawal(&storage, source, withdrawal).await?;
        actions.push(ActionPlan::ShieldedIcs20Withdrawal(action));
    }

    if !request.ibc_relay_actions.is_empty() {
        return Err(anyhow!("IBC relay action planning is not supported in browser wasm").into());
    }

    if actions.is_empty() {
        return Err(anyhow!("transaction planner request contains no supported actions").into());
    }

    let memo = request
        .memo
        .map(|memo| -> Result<MemoPlan, anyhow::Error> {
            let plaintext: MemoPlaintext = memo.try_into()?;
            Ok(MemoPlan::new(&mut OsRng, plaintext))
        })
        .transpose()?;

    let app_params = storage
        .get_app_params()
        .await?
        .context("app parameters are not synced")?;

    let mut plan = TransactionPlan {
        actions,
        transaction_parameters: TransactionParameters {
            expiry_height: request.expiry_height,
            chain_id: app_params.chain_id,
            ..Default::default()
        },
        fee_funding: None,
        detection_data: None,
        memo,
    };

    if plan.num_outputs() > 0 && plan.memo.is_none() {
        let (return_address, _) = full_viewing_key.payment_address(source);
        plan.memo = Some(MemoPlan::new(
            &mut OsRng,
            MemoPlaintext::new(return_address, String::new())
                .context("could not create empty memo plaintext")?,
        ));
    }

    plan.sort_actions();

    let fmd_params = storage.get_fmd_params().await?.unwrap_or_default();
    plan.populate_detection_data(&mut OsRng, fmd_params.precision);
    crate::compliance::enrich_plan_with_compliance(
        &mut plan,
        &grpc_url,
        &mut OsRng,
        Some(current_unix_timestamp()),
    )
    .await?;

    Ok(plan)
}

async fn plan_transfer<Db: Database>(
    storage: &Storage<Db>,
    source: AddressIndex,
    outputs: Vec<(Value, Address)>,
) -> WasmResult<TransferPlan> {
    let first_value = outputs
        .first()
        .map(|(value, _)| *value)
        .ok_or_else(|| anyhow!("transfer requires at least one output"))?;
    let asset_id = first_value.asset_id;
    let required = outputs.iter().try_fold(Amount::zero(), |acc, (value, _)| {
        if value.asset_id != asset_id {
            anyhow::bail!("all transfer outputs must use the same asset")
        }
        acc.checked_add(&value.amount)
            .ok_or_else(|| anyhow!("transfer amount overflow"))
    })?;

    let selected = select_notes(storage, source, asset_id, required).await?;
    let total = selected
        .iter()
        .map(|record| record.note.amount())
        .sum::<Amount>();
    let change = total - required;
    let sender = selected
        .first()
        .map(|record| record.note.address())
        .ok_or_else(|| anyhow!("transfer requires at least one spend"))?;

    let target_timestamp = current_unix_timestamp();
    let spends = selected
        .iter()
        .map(|record| {
            let mut spend =
                ShieldedInputPlan::new(&mut OsRng, record.note.clone(), record.position);
            spend.target_timestamp = target_timestamp;
            spend
        })
        .collect::<Vec<_>>();
    let mut shielded_outputs = outputs
        .into_iter()
        .map(|(value, address)| {
            let mut output = ShieldedOutputPlan::new(&mut OsRng, value, address);
            output.target_timestamp = target_timestamp;
            output
        })
        .collect::<Vec<_>>();
    if change > Amount::zero() {
        let mut change_output = ShieldedOutputPlan::new(
            &mut OsRng,
            Value {
                amount: change,
                asset_id,
            },
            sender,
        );
        change_output.target_timestamp = target_timestamp;
        shielded_outputs.push(change_output);
    }

    Ok(TransferPlan::new(
        spends,
        shielded_outputs,
        Fr::rand(&mut OsRng),
    )?)
}

async fn plan_ics20_withdrawal<Db: Database>(
    storage: &Storage<Db>,
    source: AddressIndex,
    withdrawal: Ics20Withdrawal,
) -> WasmResult<ShieldedIcs20WithdrawalPlan> {
    let asset_id = withdrawal.denom.id();
    let selected = select_notes(storage, source, asset_id, withdrawal.amount).await?;
    let total = selected
        .iter()
        .map(|record| record.note.amount())
        .sum::<Amount>();
    let change = total - withdrawal.amount;
    let sender = selected
        .first()
        .map(|record| record.note.address())
        .ok_or_else(|| anyhow!("withdraw requires at least one spend"))?;

    let target_timestamp = current_unix_timestamp();
    let spends = selected
        .iter()
        .map(|record| {
            let mut spend =
                ShieldedInputPlan::new(&mut OsRng, record.note.clone(), record.position);
            spend.target_timestamp = target_timestamp;
            spend
        })
        .collect::<Vec<_>>();
    let change_output = (change > Amount::zero()).then(|| {
        let mut output = ShieldedOutputPlan::new(
            &mut OsRng,
            Value {
                amount: change,
                asset_id,
            },
            sender,
        );
        output.target_timestamp = target_timestamp;
        output
    });

    Ok(ShieldedIcs20WithdrawalPlan::new(
        ShieldedIcs20WithdrawalFamilyId::Canonical,
        spends,
        change_output,
        withdrawal,
        Fr::rand(&mut OsRng),
    )?)
}

async fn select_notes<Db: Database>(
    storage: &Storage<Db>,
    source: AddressIndex,
    asset_id: shieldd_asset::asset::Id,
    required: Amount,
) -> WasmResult<Vec<SpendableNoteRecord>> {
    let mut notes = storage
        .get_notes(shieldd_proto::view::v1::NotesRequest {
            include_spent: false,
            asset_id: Some(asset_id.into()),
            address_index: Some(source.into()),
            amount_to_spend: None,
        })
        .await?;
    notes.sort_by(|a, b| b.note.amount().cmp(&a.note.amount()));

    let mut total = Amount::zero();
    let mut selected = Vec::new();
    for note in notes {
        total += note.note.amount();
        selected.push(note);
        if total >= required {
            break;
        }
    }

    if total < required {
        return Err(anyhow!("insufficient balance for requested transaction").into());
    }
    Ok(selected)
}

fn current_unix_timestamp() -> u64 {
    (js_sys::Date::now() / 1000.0) as u64
}
