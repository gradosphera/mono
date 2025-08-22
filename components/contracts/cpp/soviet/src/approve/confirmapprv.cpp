/**
 * @brief Подтверждение одобрения документа
 * Подтверждает одобрение документа и выполняет соответствующий обратный вызов.
 * Удаляет запись об одобрении после успешного выполнения.
 * @param coopname Наименование кооператива
 * @param approval_hash Хеш одобрения для подтверждения
 * @param approved_document Подтвержденный документ
 * @ingroup public_actions
 * @ingroup public_soviet_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void soviet::confirmapprv(eosio::name coopname, checksum256 approval_hash, document2 approved_document)
{
   require_auth(coopname);

   if (!is_empty_document(approved_document)) {
      verify_document_or_fail(approved_document);
    }

    auto exist_approval = Approver::get_approval(coopname, approval_hash);
    eosio::check(exist_approval.has_value(), "Апррувал не найден с указанным хэшем");
    
    Approver::approvals_index approvals(_soviet, coopname.value);
    auto itr = approvals.find(exist_approval -> id);
 
   action(
    permission_level{_soviet, "active"_n},
    itr->callback_contract,
    itr->callback_action_approve,
    std::make_tuple(coopname, approval_hash, approved_document)
  ).send();

   approvals.erase(itr);
}
