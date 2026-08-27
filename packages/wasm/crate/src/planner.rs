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
    HostWithdrawal, Ics20Withdrawal, ShieldedHostWithdrawalPlan, ShieldedIcs20WithdrawalPlan,
    ShieldedInputPlan, ShieldedOutputPlan, TransferPlan, PADDED_TRANSFER_INPUTS,
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

const MAX_WITHDRAWAL_INPUTS: usize = 2;

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
    let nullifier_window = storage
        .get_nullifier_window()
        .await?
        .context("nullifier window is not synced")?;
    let recent_position_floor = nullifier_window.recent_position_floor;

    let plan = plan_transaction_inner(
        storage,
        tx_planner_req,
        full_viewing_key,
        grpc_url,
        nullifier_window,
        recent_position_floor,
    )
    .await?;
    Ok(plan.encode_to_vec())
}

pub async fn plan_transaction_inner<Db: Database>(
    storage: Storage<Db>,
    request: TransactionPlannerRequest,
    full_viewing_key: FullViewingKey,
    grpc_url: String,
    nullifier_window: shieldd_sct::nullifier_generation::NullifierWindow,
    recent_position_floor: u64,
) -> WasmResult<TransactionPlan> {
    if !request.host_withdrawals.is_empty() {
        if !request.outputs.is_empty()
            || !request.ics20_withdrawals.is_empty()
            || !request.ibc_relay_actions.is_empty()
        {
            return Err(anyhow!(
                "host withdrawals cannot be mixed with other transaction planner actions"
            )
            .into());
        }
        if request.host_withdrawals.len() != 1 {
            return Err(anyhow!(
                "browser planning supports exactly one host withdrawal per transaction"
            )
            .into());
        }
    }

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

        let action = plan_transfer(&storage, source, outputs, recent_position_floor).await?;
        actions.push(ActionPlan::Transfer(action));
    }

    for withdrawal in request.ics20_withdrawals {
        let withdrawal: Ics20Withdrawal = withdrawal.try_into()?;
        let action =
            plan_ics20_withdrawal(&storage, source, withdrawal, recent_position_floor).await?;
        actions.push(ActionPlan::ShieldedIcs20Withdrawal(action));
    }

    for withdrawal in request.host_withdrawals {
        let withdrawal: HostWithdrawal = withdrawal.try_into()?;
        let action =
            plan_host_withdrawal(&storage, source, withdrawal, recent_position_floor).await?;
        actions.push(ActionPlan::ShieldedHostWithdrawal(action));
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
        memo,
        nullifier_window: Some(nullifier_window),
    };

    if plan.num_outputs() > 0 && plan.memo.is_none() {
        let return_address = full_viewing_key.payment_address(source);
        plan.memo = Some(MemoPlan::new(
            &mut OsRng,
            MemoPlaintext::new(return_address, String::new())
                .context("could not create empty memo plaintext")?,
        ));
    }

    let discovery_parameters = storage
        .get_discovery_parameters()
        .await?
        .context("discovery parameters are not synced")?;
    plan.populate_routing_parameters(discovery_parameters);
    plan.sort_actions();
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
    recent_position_floor: u64,
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

    let selected = select_notes(storage, source, asset_id, required, recent_position_floor).await?;
    if selected.len() > PADDED_TRANSFER_INPUTS {
        return Err(anyhow!(
            "transfer requires note maintenance before browser planning: selected {} notes, maximum is {}",
            selected.len(),
            PADDED_TRANSFER_INPUTS
        )
        .into());
    }
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
    recent_position_floor: u64,
) -> WasmResult<ShieldedIcs20WithdrawalPlan> {
    let asset_id = withdrawal.denom.id();
    let selected = select_notes(
        storage,
        source,
        asset_id,
        withdrawal.amount,
        recent_position_floor,
    )
    .await?;
    ensure_withdrawal_input_limit(selected.len())?;
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
        spends,
        change_output,
        withdrawal,
        Fr::rand(&mut OsRng),
    )?)
}

async fn plan_host_withdrawal<Db: Database>(
    storage: &Storage<Db>,
    source: AddressIndex,
    withdrawal: HostWithdrawal,
    recent_position_floor: u64,
) -> WasmResult<ShieldedHostWithdrawalPlan> {
    let asset_id = withdrawal.value.asset_id;
    let selected = select_notes(
        storage,
        source,
        asset_id,
        withdrawal.value.amount,
        recent_position_floor,
    )
    .await?;
    ensure_withdrawal_input_limit(selected.len())?;

    let total = selected
        .iter()
        .map(|record| record.note.amount())
        .sum::<Amount>();
    let change = total - withdrawal.value.amount;
    let sender = selected
        .first()
        .map(|record| record.note.address())
        .ok_or_else(|| anyhow!("host withdrawal requires at least one spend"))?;

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

    Ok(ShieldedHostWithdrawalPlan::new(
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
    recent_position_floor: u64,
) -> WasmResult<Vec<SpendableNoteRecord>> {
    let mut notes = storage
        .get_notes(shieldd_proto::view::v1::NotesRequest {
            include_spent: false,
            asset_id: Some(asset_id.into()),
            address_index: Some(source.into()),
            amount_to_spend: None,
        })
        .await?;
    let total_available = notes
        .iter()
        .map(|record| record.note.amount())
        .sum::<Amount>();
    notes.retain(|record| u64::from(record.position) >= recent_position_floor);
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
        if total_available >= required {
            return Err(anyhow!(
                "spending these funds requires historical nullifier proofs, which browser planning does not yet support"
            )
            .into());
        }
        return Err(anyhow!("insufficient balance for requested transaction").into());
    }
    Ok(selected)
}

fn ensure_withdrawal_input_limit(selected: usize) -> WasmResult<()> {
    if selected > MAX_WITHDRAWAL_INPUTS {
        return Err(anyhow!(
            "withdrawal requires note maintenance before browser planning: selected {} notes, maximum is {}",
            selected,
            MAX_WITHDRAWAL_INPUTS
        )
        .into());
    }
    Ok(())
}

fn current_unix_timestamp() -> u64 {
    (js_sys::Date::now() / 1000.0) as u64
}
