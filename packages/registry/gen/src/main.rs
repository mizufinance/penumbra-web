//! Generates `packages/registry/src/data/chains/<chain-id>.json` from the
//! canonical `shieldd-sdk-asset::Cache::with_known_assets()` list, plus
//! `globals.json` with the staking asset ID.

use serde_json::{json, Map, Value};
use shieldd_sdk_asset::asset::Cache;
use std::{fs, path::PathBuf};

const CHAIN_IDS: &[&str] = &["shieldd-local-devnet"];

fn main() {
    let cache = Cache::with_known_assets();
    let staking_asset_id_b64 = cache
        .get_unit("ushieldd")
        .expect("ushieldd known asset")
        .base()
        .id()
        .to_base64();

    let mut asset_by_id: Map<String, Value> = Map::new();
    for metadata in cache.values() {
        let id_b64 = metadata.id().to_base64();
        let denom_units: Vec<Value> = metadata
            .units()
            .iter()
            .map(|u| {
                json!({
                    "denom": u.to_string(),
                    "exponent": u.exponent(),
                })
            })
            .collect();
        let entry = json!({
            "denomUnits": denom_units,
            "base": metadata.base_denom().denom,
            "display": metadata.default_unit().to_string(),
            "symbol": metadata.symbol(),
            "shielddAssetId": { "inner": id_b64.clone() },
        });
        asset_by_id.insert(id_b64, entry);
    }

    let out_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .join("src/data");

    fs::create_dir_all(out_dir.join("chains")).expect("create chains dir");

    for chain_id in CHAIN_IDS {
        let registry = json!({
            "chainId": chain_id,
            "ibcConnections": [],
            "assetById": asset_by_id,
            "numeraires": [],
        });
        let path = out_dir.join("chains").join(format!("{chain_id}.json"));
        fs::write(
            &path,
            serde_json::to_string_pretty(&registry).expect("serialize"),
        )
        .expect("write chain json");
        println!("wrote {}", path.display());
    }

    let globals = json!({
        "rpcs": [],
        "frontendsV2": [],
        "stakingAssetId": { "inner": staking_asset_id_b64 },
    });
    let globals_path = out_dir.join("globals.json");
    fs::write(
        &globals_path,
        serde_json::to_string_pretty(&globals).expect("serialize globals"),
    )
    .expect("write globals json");
    println!("wrote {}", globals_path.display());
}
