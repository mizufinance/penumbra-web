use rand_core::OsRng;
use shieldd_keys::Address;
use shieldd_proto::core::component::ibc::v1::Ics20Withdrawal as PbIcs20Withdrawal;
use shieldd_proto::core::keys::v1::Address as PbAddress;
use shieldd_shielded_pool::Ics20Withdrawal;

#[test]
fn height_properly_serializes_from_json() {
    let mut data: serde_json::Value = serde_json::from_str(
        r#"
        {
          "amount": {
            "lo": "12000000"
          },
          "denom": {
            "denom": "ushieldd"
          },
          "destinationChainAddress": "xyz",
          "timeoutHeight": {
            "revisionNumber": "5",
            "revisionHeight": "3928271"
          },
          "timeoutTime": "1680000000000",
          "sourceChannel": "channel-0",
          "useTransparentAddress": false
        }
    "#,
    )
    .unwrap();
    let return_address = Address::dummy(&mut OsRng);
    data["returnAddress"] = serde_json::to_value(PbAddress::from(&return_address)).unwrap();

    let withdrawal_proto: PbIcs20Withdrawal = serde_json::from_value(data).unwrap();
    let height = withdrawal_proto.clone().timeout_height.unwrap();
    assert_eq!(height.revision_number, 5u64);
    assert_eq!(height.revision_height, 3928271u64);

    let domain_type: Ics20Withdrawal = withdrawal_proto.try_into().unwrap();
    assert_eq!(domain_type.timeout_height.revision_number, 5u64);
    assert_eq!(domain_type.timeout_height.revision_height, 3928271u64);
}
