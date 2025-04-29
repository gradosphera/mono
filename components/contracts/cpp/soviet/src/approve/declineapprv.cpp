void soviet::declineapprv(eosio::name coopname, checksum256 approval_hash, std::string reason)
{
    require_auth(coopname);

    auto exist_approval = Approver::get_approval(coopname, approval_hash);
    eosio::check(exist_approval.has_value(), "Апррувал не найден с указанным хэшем");
    
    Approver::approvals_index approvals(_soviet, coopname.value);
    auto itr = approvals.find(exist_approval -> id);
    
    action(
      permission_level{_soviet, "active"_n},
      itr->callback_contract,
      itr->callback_action_decline,
      std::make_tuple(coopname, approval_hash, reason)
    ).send();

    approvals.erase(itr);
}
