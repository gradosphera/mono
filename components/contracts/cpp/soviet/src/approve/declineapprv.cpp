/**
 * @brief Отклонение одобрения документа
 * Отклоняет одобрение документа с указанием причины и выполняет соответствующий обратный вызов.
 * Удаляет запись об одобрении после отклонения.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя, отклоняющего одобрение
 * @param approval_hash Хеш одобрения для отклонения
 * @param reason Причина отклонения одобрения
 * @ingroup public_actions
 * @ingroup public_soviet_actions

 * @note Авторизация требуется от аккаунта: @p username
 */
void soviet::declineapprv(eosio::name coopname, eosio::name username, checksum256 approval_hash, std::string reason)
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
      std::make_tuple(coopname, username, approval_hash, reason)
    ).send();

    approvals.erase(itr);
}
