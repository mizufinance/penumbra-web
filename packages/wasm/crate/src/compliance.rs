use anyhow::{anyhow, Result};
use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine as _};
use decaf377::{Fq, Fr};
use penumbra_asset::asset;
use penumbra_compliance::{
    indexed_tree, AssetPolicy, ComplianceLeaf, IndexedLeaf, MerklePath, MerklePathLayer,
    OrbisEncryptedSeedUploadPackage, TransferOrbisUploadBundle,
};
use penumbra_keys::Address;
use penumbra_proto::core::component::compliance::v1 as pb;
use penumbra_proto::Message;
use penumbra_shielded_pool::ShieldedIcs20WithdrawalPlan;
use penumbra_tct::StateCommitment;
use penumbra_transaction::{ActionPlan, TransactionPlan};
use serde::Serialize;
use std::collections::{BTreeMap, BTreeSet};
use wasm_bindgen::JsCast;
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsValue;
use wasm_bindgen_futures::JsFuture;

#[derive(Debug, Clone)]
struct BatchComplianceData {
    compliance_anchor: StateCommitment,
    asset_anchor: StateCommitment,
    asset_proofs: BTreeMap<asset::Id, (MerklePath, u64, IndexedLeaf, bool)>,
    asset_policies: BTreeMap<asset::Id, AssetPolicy>,
    user_proofs: BTreeMap<(Address, asset::Id), (MerklePath, u64, ComplianceLeaf)>,
}

#[derive(Clone, Copy, Debug)]
enum TransferSpendLocation {
    Transfer {
        action_index: usize,
        spend_index: usize,
    },
}

#[derive(Clone, Copy, Debug)]
enum TransferOutputLocation {
    Transfer {
        action_index: usize,
        output_index: usize,
    },
}

#[derive(Clone, Copy, Debug)]
enum ShieldedIcs20WithdrawalSpendLocation {
    ShieldedIcs20Withdrawal {
        action_index: usize,
        spend_index: usize,
    },
}

pub async fn enrich_plan_with_compliance(
    plan: &mut TransactionPlan,
    grpc_url: &str,
    rng: &mut (impl rand_core::RngCore + rand_core::CryptoRng),
    target_timestamp_override: Option<u64>,
) -> Result<()> {
    let target_timestamp =
        target_timestamp_override.unwrap_or_else(|| (js_sys::Date::now() / 1000.0) as u64);

    let mut tx_blinding_nonce = None;
    enrich_transfer_family_with_compliance(
        plan,
        grpc_url,
        rng,
        target_timestamp,
        &mut tx_blinding_nonce,
    )
    .await?;
    enrich_shielded_ics20_withdrawals_with_compliance(
        plan,
        grpc_url,
        rng,
        target_timestamp,
        &mut tx_blinding_nonce,
    )
    .await?;

    Ok(())
}

async fn enrich_transfer_family_with_compliance(
    plan: &mut TransactionPlan,
    grpc_url: &str,
    rng: &mut (impl rand_core::RngCore + rand_core::CryptoRng),
    target_timestamp: u64,
    tx_blinding_nonce: &mut Option<Fr>,
) -> Result<()> {
    let mut spend_locations = Vec::new();
    let mut output_locations = Vec::new();

    for (action_index, action) in plan.actions.iter().enumerate() {
        if let ActionPlan::Transfer(transfer) = action {
            for spend_index in 0..transfer.spends.len() {
                spend_locations.push(TransferSpendLocation::Transfer {
                    action_index,
                    spend_index,
                });
            }
            for output_index in 0..transfer.outputs.len() {
                output_locations.push(TransferOutputLocation::Transfer {
                    action_index,
                    output_index,
                });
            }
        }
    }

    let spend_identities = spend_locations
        .iter()
        .map(|location| match *location {
            TransferSpendLocation::Transfer {
                action_index,
                spend_index,
            } => {
                let ActionPlan::Transfer(transfer) = &plan.actions[action_index] else {
                    unreachable!()
                };
                let spend = &transfer.spends[spend_index];
                (spend.note.asset_id(), spend.note.address())
            }
        })
        .collect::<Vec<_>>();
    let output_identities = output_locations
        .iter()
        .map(|location| match *location {
            TransferOutputLocation::Transfer {
                action_index,
                output_index,
            } => {
                let ActionPlan::Transfer(transfer) = &plan.actions[action_index] else {
                    unreachable!()
                };
                let output = &transfer.outputs[output_index];
                (output.value.asset_id, output.dest_address.clone())
            }
        })
        .collect::<Vec<_>>();

    let Some((batch_data, sender_address, spend_binding_asset_id)) =
        fetch_batch_compliance_data(grpc_url, &spend_identities, &output_identities).await?
    else {
        return Ok(());
    };

    let compliance_anchor = batch_data.compliance_anchor;
    let asset_anchor = batch_data.asset_anchor;

    for (spend_location, (spend_asset_id, spend_address)) in spend_locations
        .iter()
        .copied()
        .zip(spend_identities.iter().cloned())
    {
        let TransferSpendLocation::Transfer {
            action_index,
            spend_index,
        } = spend_location;

        let (asset_path, asset_position, asset_indexed_leaf, is_regulated) = batch_data
            .asset_proofs
            .get(&spend_asset_id)
            .cloned()
            .unwrap_or_else(default_unregulated_asset_proof);

        let (sender_compliance_path, sender_compliance_position, _) = batch_data
            .user_proofs
            .get(&(spend_address.clone(), spend_asset_id))
            .cloned()
            .ok_or_else(|| {
                anyhow!(
                    "missing user proof for transfer spend at action {} input {} for asset {}",
                    action_index,
                    spend_index,
                    spend_asset_id
                )
            })?;

        let ActionPlan::Transfer(transfer) = &mut plan.actions[action_index] else {
            unreachable!()
        };
        let spend = &mut transfer.spends[spend_index];
        spend.asset_indexed_leaf = asset_indexed_leaf;
        spend.asset_path = asset_path;
        spend.asset_position = asset_position;
        spend.asset_anchor = asset_anchor;
        spend.compliance_anchor = compliance_anchor;
        spend.compliance_path = sender_compliance_path;
        spend.compliance_position = sender_compliance_position;
        spend.is_regulated = is_regulated;
        spend.target_timestamp = target_timestamp;
        spend.asset_policy = if is_regulated {
            Some(
                batch_data
                    .asset_policies
                    .get(&spend_asset_id)
                    .cloned()
                    .ok_or_else(|| anyhow!("missing asset policy for {}", spend_asset_id))?,
            )
        } else {
            None
        };
        spend.set_compliance_details(rng)?;
        if let Some(nonce) = *tx_blinding_nonce {
            spend.tx_blinding_nonce = nonce;
        } else {
            *tx_blinding_nonce = Some(spend.tx_blinding_nonce);
        }
    }

    if !output_locations.is_empty() {
        let nonce = tx_blinding_nonce.unwrap_or_else(|| Fr::rand(rng));
        *tx_blinding_nonce = Some(nonce);

        for (output_location, (output_asset_id, recipient_address)) in output_locations
            .iter()
            .copied()
            .zip(output_identities.iter().cloned())
        {
            let TransferOutputLocation::Transfer {
                action_index,
                output_index,
            } = output_location;

            let (asset_path, asset_position, asset_indexed_leaf, is_regulated) = batch_data
                .asset_proofs
                .get(&output_asset_id)
                .cloned()
                .unwrap_or_else(default_unregulated_asset_proof);

            let (recipient_compliance_path, recipient_compliance_position, recipient_leaf) =
                batch_data
                    .user_proofs
                    .get(&(recipient_address.clone(), output_asset_id))
                    .cloned()
                    .ok_or_else(|| {
                        anyhow!(
                            "missing user proof for transfer output at action {} output {} for asset {}",
                            action_index,
                            output_index,
                            output_asset_id
                        )
                    })?;

            let (_, _, sender_leaf_for_output) = batch_data
                .user_proofs
                .get(&(sender_address.clone(), spend_binding_asset_id))
                .cloned()
                .ok_or_else(|| {
                    anyhow!(
                        "missing user proof for transfer sender binding for asset {}",
                        spend_binding_asset_id
                    )
                })?;

            let ActionPlan::Transfer(transfer) = &mut plan.actions[action_index] else {
                unreachable!()
            };
            let output = &mut transfer.outputs[output_index];
            output.asset_indexed_leaf = asset_indexed_leaf;
            output.asset_path = asset_path;
            output.asset_position = asset_position;
            output.asset_anchor = asset_anchor;
            output.compliance_anchor = compliance_anchor;
            output.compliance_path = recipient_compliance_path;
            output.compliance_position = recipient_compliance_position;
            output.is_regulated = is_regulated;
            output.target_timestamp = target_timestamp;
            output.asset_policy = if is_regulated {
                Some(
                    batch_data
                        .asset_policies
                        .get(&output_asset_id)
                        .cloned()
                        .ok_or_else(|| anyhow!("missing asset policy for {}", output_asset_id))?,
                )
            } else {
                None
            };
            output.set_compliance_details(rng, &recipient_leaf, sender_leaf_for_output, nonce)?;
        }
    }

    Ok(())
}

async fn enrich_shielded_ics20_withdrawals_with_compliance(
    plan: &mut TransactionPlan,
    grpc_url: &str,
    rng: &mut (impl rand_core::RngCore + rand_core::CryptoRng),
    target_timestamp: u64,
    tx_blinding_nonce: &mut Option<Fr>,
) -> Result<()> {
    let mut spend_locations = Vec::new();
    let mut action_indices = Vec::new();

    for (action_index, action) in plan.actions.iter().enumerate() {
        if let ActionPlan::ShieldedIcs20Withdrawal(withdrawal) = action {
            action_indices.push(action_index);
            for spend_index in 0..withdrawal.spends.len() {
                spend_locations.push(
                    ShieldedIcs20WithdrawalSpendLocation::ShieldedIcs20Withdrawal {
                        action_index,
                        spend_index,
                    },
                );
            }
        }
    }

    let spend_identities = spend_locations
        .iter()
        .map(|location| match *location {
            ShieldedIcs20WithdrawalSpendLocation::ShieldedIcs20Withdrawal {
                action_index,
                spend_index,
            } => {
                let ActionPlan::ShieldedIcs20Withdrawal(withdrawal) = &plan.actions[action_index]
                else {
                    unreachable!()
                };
                let spend = &withdrawal.spends[spend_index];
                (spend.note.asset_id(), spend.note.address())
            }
        })
        .collect::<Vec<_>>();

    let Some((batch_data, _, _)) =
        fetch_batch_compliance_data(grpc_url, &spend_identities, &[]).await?
    else {
        return Ok(());
    };

    let compliance_anchor = batch_data.compliance_anchor;
    let asset_anchor = batch_data.asset_anchor;

    for (spend_location, (spend_asset_id, spend_address)) in spend_locations
        .iter()
        .copied()
        .zip(spend_identities.iter().cloned())
    {
        let ShieldedIcs20WithdrawalSpendLocation::ShieldedIcs20Withdrawal {
            action_index,
            spend_index,
        } = spend_location;

        let (asset_path, asset_position, asset_indexed_leaf, is_regulated) = batch_data
            .asset_proofs
            .get(&spend_asset_id)
            .cloned()
            .unwrap_or_else(default_unregulated_asset_proof);

        let (sender_compliance_path, sender_compliance_position, _) = batch_data
            .user_proofs
            .get(&(spend_address.clone(), spend_asset_id))
            .cloned()
            .ok_or_else(|| {
                anyhow!(
                    "missing user proof for shielded ICS-20 withdrawal spend at action {} input {} for asset {}",
                    action_index,
                    spend_index,
                    spend_asset_id
                )
            })?;

        let ActionPlan::ShieldedIcs20Withdrawal(withdrawal) = &mut plan.actions[action_index]
        else {
            unreachable!()
        };
        let spend = &mut withdrawal.spends[spend_index];
        spend.asset_indexed_leaf = asset_indexed_leaf;
        spend.asset_path = asset_path;
        spend.asset_position = asset_position;
        spend.asset_anchor = asset_anchor;
        spend.compliance_anchor = compliance_anchor;
        spend.compliance_path = sender_compliance_path;
        spend.compliance_position = sender_compliance_position;
        spend.is_regulated = is_regulated;
        spend.target_timestamp = target_timestamp;
        spend.asset_policy = if is_regulated {
            Some(
                batch_data
                    .asset_policies
                    .get(&spend_asset_id)
                    .cloned()
                    .ok_or_else(|| anyhow!("missing asset policy for {}", spend_asset_id))?,
            )
        } else {
            None
        };
        spend.set_compliance_details(rng)?;
        if let Some(nonce) = *tx_blinding_nonce {
            spend.tx_blinding_nonce = nonce;
        } else {
            *tx_blinding_nonce = Some(spend.tx_blinding_nonce);
        }
    }

    for action_index in action_indices {
        let ActionPlan::ShieldedIcs20Withdrawal(withdrawal) = &mut plan.actions[action_index]
        else {
            unreachable!()
        };
        apply_withdrawal_compliance_body(withdrawal)?;
    }

    Ok(())
}

fn apply_withdrawal_compliance_body(withdrawal: &mut ShieldedIcs20WithdrawalPlan) -> Result<()> {
    let Some(first_spend) = withdrawal.spends.first() else {
        return Ok(());
    };

    withdrawal.body.target_timestamp = first_spend.target_timestamp;
    withdrawal.body.compliance_anchor = first_spend.compliance_anchor;
    withdrawal.body.asset_anchor = first_spend.asset_anchor;

    if first_spend.is_regulated
        && !first_spend.compliance_ciphertext.is_empty()
        && !penumbra_compliance::IbcComplianceMetadata::is_compliance_memo(
            &withdrawal.withdrawal.ics20_memo,
        )
    {
        let metadata = penumbra_compliance::IbcComplianceMetadata {
            compliance_ciphertext: first_spend.compliance_ciphertext.clone(),
            asset_id: first_spend.note.asset_id(),
        };
        withdrawal.withdrawal.ics20_memo =
            metadata.encode_to_memo(&withdrawal.withdrawal.ics20_memo)?;
    }

    withdrawal.body.withdrawal = withdrawal.withdrawal.clone();
    Ok(())
}

async fn fetch_batch_compliance_data(
    grpc_url: &str,
    spend_identities: &[(asset::Id, Address)],
    output_identities: &[(asset::Id, Address)],
) -> Result<Option<(BatchComplianceData, Address, asset::Id)>> {
    if spend_identities.is_empty() && output_identities.is_empty() {
        return Ok(None);
    }

    let sender_address = spend_identities
        .first()
        .map(|(_, address)| address.clone())
        .or_else(|| {
            output_identities
                .first()
                .map(|(_, address)| address.clone())
        })
        .expect("at least one spend or output identity must exist");
    let spend_binding_asset_id = spend_identities
        .first()
        .map(|(asset_id, _)| *asset_id)
        .or_else(|| output_identities.first().map(|(asset_id, _)| *asset_id))
        .expect("at least one spend or output identity must exist");

    let mut queries: BTreeSet<(Address, asset::Id)> = BTreeSet::new();
    for (asset_id, address) in spend_identities {
        queries.insert((address.clone(), *asset_id));
    }
    for (asset_id, address) in output_identities {
        queries.insert((address.clone(), *asset_id));
        queries.insert((sender_address.clone(), spend_binding_asset_id));
    }

    let query_vec = queries.into_iter().collect::<Vec<_>>();
    let batch_response = fetch_batch_response(grpc_url, &query_vec).await?;
    let batch_data = parse_batch_response(grpc_url, query_vec.clone(), batch_response).await?;
    Ok(Some((batch_data, sender_address, spend_binding_asset_id)))
}

async fn fetch_batch_response(
    grpc_url: &str,
    queries: &[(Address, asset::Id)],
) -> Result<pb::ComplianceBatchMerkleProofsResponse> {
    let request = pb::ComplianceBatchMerkleProofsRequest {
        queries: queries
            .iter()
            .map(|(address, asset_id)| pb::ComplianceBatchQuery {
                address: Some(address.clone().into()),
                asset_id: Some((*asset_id).into()),
            })
            .collect(),
    };
    let response = grpc_web_unary(
        grpc_url,
        "/penumbra.core.component.compliance.v1.QueryService/ComplianceBatchMerkleProofs",
        request.encode_to_vec(),
    )
    .await?;
    Ok(pb::ComplianceBatchMerkleProofsResponse::decode(
        response.as_slice(),
    )?)
}

async fn fetch_asset_policy(grpc_url: &str, asset_id: asset::Id) -> Result<Option<AssetPolicy>> {
    let request = pb::ComplianceAssetStatusRequest {
        asset_id: Some(asset_id.into()),
    };
    let response = grpc_web_unary(
        grpc_url,
        "/penumbra.core.component.compliance.v1.QueryService/ComplianceAssetStatus",
        request.encode_to_vec(),
    )
    .await?;
    let status = pb::ComplianceAssetStatusResponse::decode(response.as_slice())?;
    status.asset_policy.map(AssetPolicy::try_from).transpose()
}

async fn parse_batch_response(
    grpc_url: &str,
    queries: Vec<(Address, asset::Id)>,
    response: pb::ComplianceBatchMerkleProofsResponse,
) -> Result<BatchComplianceData> {
    let compliance_anchor =
        parse_state_commitment(&response.compliance_anchor, "compliance_anchor")?;
    let asset_anchor = parse_state_commitment(&response.asset_anchor, "asset_anchor")?;

    if response.results.len() != queries.len() {
        return Err(anyhow!(
            "batch compliance response result count {} does not match query count {}",
            response.results.len(),
            queries.len()
        ));
    }

    let mut asset_proofs = BTreeMap::new();
    let mut asset_policies = BTreeMap::new();
    let mut user_proofs = BTreeMap::new();

    for (result, (address, asset_id)) in response.results.into_iter().zip(queries.into_iter()) {
        let compliance_path = parse_merkle_path(result.compliance_path);
        let asset_path = parse_merkle_path(result.asset_path);

        if !asset_proofs.contains_key(&asset_id) {
            let indexed_leaf = result
                .asset_indexed_leaf
                .ok_or_else(|| anyhow!("asset_indexed_leaf missing for asset {}", asset_id))
                .and_then(IndexedLeaf::try_from)?;
            asset_proofs.insert(
                asset_id,
                (
                    asset_path.clone(),
                    result.asset_position,
                    indexed_leaf,
                    result.is_regulated,
                ),
            );
            if result.is_regulated {
                let policy = fetch_asset_policy(grpc_url, asset_id)
                    .await?
                    .ok_or_else(|| {
                        anyhow!("missing asset policy for regulated asset {}", asset_id)
                    })?;
                asset_policies.insert(asset_id, policy);
            }
        }

        let key = (address.clone(), asset_id);
        if !user_proofs.contains_key(&key) {
            if result.user_registered {
                let leaf = result
                    .compliance_leaf
                    .ok_or_else(|| anyhow!("compliance leaf missing for registered user"))?
                    .try_into()?;
                user_proofs.insert(key, (compliance_path, result.compliance_position, leaf));
            } else if !result.is_regulated {
                let b_d_fq = address.diversified_generator().vartime_compress_to_field();
                let d = penumbra_compliance::derive_compliance_scalar(b_d_fq);
                let leaf = ComplianceLeaf {
                    address,
                    asset_id,
                    d,
                };
                user_proofs.insert(key, (MerklePath::default(), 0, leaf));
            } else {
                return Err(anyhow!(
                    "user is not registered in compliance tree for asset {}",
                    asset_id
                ));
            }
        }
    }

    Ok(BatchComplianceData {
        compliance_anchor,
        asset_anchor,
        asset_proofs,
        asset_policies,
        user_proofs,
    })
}

async fn grpc_web_unary(grpc_url: &str, path: &str, request_bytes: Vec<u8>) -> Result<Vec<u8>> {
    let mut frame = Vec::with_capacity(5 + request_bytes.len());
    frame.push(0);
    let len = request_bytes.len() as u32;
    frame.extend_from_slice(&len.to_be_bytes());
    frame.extend_from_slice(&request_bytes);
    let body = BASE64_STANDARD.encode(frame);

    let headers = web_sys::Headers::new().map_err(js_error)?;
    headers
        .set("Content-Type", "application/grpc-web-text")
        .map_err(js_error)?;
    headers
        .set("Accept", "application/grpc-web-text")
        .map_err(js_error)?;

    let init = web_sys::RequestInit::new();
    init.set_method("POST");
    init.set_mode(web_sys::RequestMode::Cors);
    init.set_headers(&headers);
    init.set_body(&JsValue::from_str(&body));

    let window = web_sys::window().ok_or_else(|| anyhow!("window is unavailable"))?;
    let url = format!("{}{}", grpc_url.trim_end_matches('/'), path);
    let response_value = JsFuture::from(window.fetch_with_str_and_init(&url, &init))
        .await
        .map_err(js_error)?;
    let response: web_sys::Response = response_value
        .dyn_into()
        .map_err(|_| anyhow!("fetch did not return a Response"))?;
    if !response.ok() {
        let status = response.status();
        let text = response_text(response).await.unwrap_or_default();
        return Err(anyhow!(
            "compliance query failed with HTTP {}: {}",
            status,
            text
        ));
    }

    let text = response_text(response).await?;
    decode_grpc_web_text(&text)
}

async fn response_text(response: web_sys::Response) -> Result<String> {
    let text_value = JsFuture::from(response.text().map_err(js_error)?)
        .await
        .map_err(js_error)?;
    text_value
        .as_string()
        .ok_or_else(|| anyhow!("response text is not a string"))
}

fn decode_grpc_web_text(text: &str) -> Result<Vec<u8>> {
    let mut bytes = Vec::new();
    for chunk in split_base64_frames(text.trim()) {
        if chunk.is_empty() {
            continue;
        }
        bytes.extend(BASE64_STANDARD.decode(chunk.as_bytes())?);
    }

    let mut offset = 0usize;
    while offset + 5 <= bytes.len() {
        let flags = bytes[offset];
        let len = u32::from_be_bytes([
            bytes[offset + 1],
            bytes[offset + 2],
            bytes[offset + 3],
            bytes[offset + 4],
        ]) as usize;
        offset += 5;
        if offset + len > bytes.len() {
            return Err(anyhow!("malformed grpc-web frame"));
        }
        let message = bytes[offset..offset + len].to_vec();
        if flags & 0x80 == 0 {
            return Ok(message);
        }
        offset += len;
    }

    Err(anyhow!("grpc-web response did not contain a message frame"))
}

fn split_base64_frames(text: &str) -> Vec<&str> {
    let bytes = text.as_bytes();
    let mut chunks = Vec::new();
    let mut start = 0usize;
    let mut i = 0usize;
    while i + 1 < bytes.len() {
        if bytes[i] == b'=' && bytes[i + 1].is_ascii_alphanumeric() {
            chunks.push(&text[start..=i]);
            start = i + 1;
        }
        i += 1;
    }
    chunks.push(&text[start..]);
    chunks
}

fn parse_state_commitment(bytes: &[u8], field: &str) -> Result<StateCommitment> {
    if bytes.len() != 32 {
        return Err(anyhow!("{} must be 32 bytes, got {}", field, bytes.len()));
    }
    let mut bytes_array = [0u8; 32];
    bytes_array.copy_from_slice(bytes);
    Ok(StateCommitment(
        Fq::from_bytes_checked(&bytes_array)
            .map_err(|e| anyhow!("invalid {} field element: {}", field, e))?,
    ))
}

fn parse_merkle_path(path: Option<pb::MerklePath>) -> MerklePath {
    match path {
        Some(path) => MerklePath {
            layers: path
                .layers
                .into_iter()
                .map(|layer| MerklePathLayer {
                    siblings: layer.siblings,
                })
                .collect(),
        },
        None => MerklePath { layers: vec![] },
    }
}

fn default_unregulated_asset_proof() -> (MerklePath, u64, IndexedLeaf, bool) {
    let default_leaf =
        IndexedLeaf::with_default_policy(Fq::from(0u64), 0, indexed_tree::FQ_MAX.clone());
    (MerklePath::default(), 0, default_leaf, false)
}

fn js_error(value: JsValue) -> anyhow::Error {
    if let Some(s) = value.as_string() {
        anyhow!(s)
    } else {
        anyhow!("JavaScript error: {:?}", value)
    }
}

#[wasm_bindgen(js_name = deriveComplianceScalarForAddress)]
pub fn derive_compliance_scalar_for_address(address: &[u8]) -> Result<Vec<u8>, JsValue> {
    let pb_address = penumbra_proto::core::keys::v1::Address::decode(address)
        .map_err(|e| JsValue::from_str(&format!("invalid address protobuf: {e}")))?;
    let address = Address::try_from(pb_address)
        .map_err(|e| JsValue::from_str(&format!("invalid address: {e}")))?;
    let b_d_fq = address.diversified_generator().vartime_compress_to_field();
    Ok(penumbra_compliance::derive_compliance_scalar(b_d_fq)
        .to_bytes()
        .to_vec())
}

#[derive(Serialize)]
struct JsOrbisUploadPackage {
    ring_id: String,
    policy_id: String,
    resource: String,
    permission: String,
    tier_label: String,
    timestamp: u64,
    salt: String,
    encrypted_document: Vec<u8>,
    enc_cmt: Vec<u8>,
    shared_point: Vec<u8>,
    challenge: Vec<u8>,
    response: Vec<u8>,
    orbis_challenge: Vec<u8>,
    orbis_response: Vec<u8>,
    derived_pk: Vec<u8>,
    metadata_hash: Vec<u8>,
}

#[derive(Serialize)]
struct JsOrbisUploadBundle {
    sender_core: JsOrbisUploadPackage,
    sender_ext: JsOrbisUploadPackage,
    output_core: JsOrbisUploadPackage,
    output_ext: JsOrbisUploadPackage,
}

impl From<OrbisEncryptedSeedUploadPackage> for JsOrbisUploadPackage {
    fn from(p: OrbisEncryptedSeedUploadPackage) -> Self {
        Self {
            ring_id: p.ring_id,
            policy_id: p.policy_id,
            resource: p.resource,
            permission: p.permission,
            tier_label: p.tier_label,
            timestamp: p.timestamp,
            salt: p.salt,
            encrypted_document: p.encrypted_document,
            enc_cmt: p.enc_cmt,
            shared_point: p.shared_point,
            challenge: p.challenge,
            response: p.response,
            orbis_challenge: p.orbis_challenge,
            orbis_response: p.orbis_response,
            derived_pk: p.derived_pk,
            metadata_hash: p.metadata_hash,
        }
    }
}

#[wasm_bindgen(js_name = decodeOrbisUploadBundle)]
pub fn decode_orbis_upload_bundle(bundle: &[u8]) -> Result<JsValue, JsValue> {
    let bundle = TransferOrbisUploadBundle::from_bytes(bundle)
        .map_err(|e| JsValue::from_str(&format!("invalid ORBIS upload bundle: {e}")))?;
    bundle
        .validate()
        .map_err(|e| JsValue::from_str(&format!("invalid ORBIS upload package: {e}")))?;
    let js = JsOrbisUploadBundle {
        sender_core: bundle.sender_core.into(),
        sender_ext: bundle.sender_ext.into(),
        output_core: bundle.output_core.into(),
        output_ext: bundle.output_ext.into(),
    };
    serde_wasm_bindgen::to_value(&js)
        .map_err(|e| JsValue::from_str(&format!("serialize ORBIS upload bundle: {e}")))
}
