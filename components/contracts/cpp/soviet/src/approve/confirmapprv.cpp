void soviet::confirmapprv(eosio::name coopname, checksum256 approval_hash, std::optional<document> approved_document)
{
   require_auth(coopname);

   if (approved_document.has_value()) {
      verify_document_or_fail(approved_document.value());
   }

    auto exist_approval = Approver::get_approval(coopname, approval_hash);
    eosio::check(exist_approval.has_value(), "Апррувал не найден с указанным хэшем");
    
    Approver::approvals_index approvals(_soviet, coopname.value);
    auto itr = approvals.find(exist_approval -> id);
 
   const document doc_to_send = approved_document.has_value() ? approved_document.value() : document{};

   action(
    permission_level{_soviet, "active"_n},
    itr->callback_contract,
    itr->callback_action_approve,
    std::make_tuple(coopname, approval_hash, doc_to_send)
  ).send();

   approvals.erase(itr);
}
