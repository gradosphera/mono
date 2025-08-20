/**
 * @brief Добавление баланса в кошелек программы
 * Добавляет средства в кошелек участника по конкретной программе.
 * Обновляет доступный баланс участника и агрегированные показатели программы.
 * @param coopname Наименование кооператива
 * @param username Наименование пользователя
 * @param program_id Идентификатор программы
 * @param quantity Количество средств для добавления
 * @param memo Примечание к операции
 * @ingroup public_actions
 * @ingroup public_soviet_actions
 * @anchor soviet_addbal
 * @note Авторизация требуется от аккаунта в белом списке контрактов
 */
void soviet::addbal(eosio::name coopname, eosio::name username, uint64_t program_id, eosio::asset quantity, std::string memo) {
  
  name payer = check_auth_and_get_payer_or_fail(contracts_whitelist);
  
  programs_index programs(_soviet, coopname.value);
  auto prg = programs.find(program_id);
  eosio::check(prg != programs.end(), "Программа с указанным program_id не найдена");
  
  auto cooperative = get_cooperative_or_fail(coopname);  
  auto participant = get_participant_or_fail(coopname, username);
  auto exist_wallet = get_user_program_wallet_or_fail(coopname, username, program_id);
  
  progwallets_index progwallets(_soviet, coopname.value);
  auto wallet = progwallets.find(exist_wallet.id);
  
  progwallets.modify(wallet, _soviet, [&](auto &b) { 
    b.available += quantity; 
  });
  
  // Обновляем агрегированный баланс в самой программе (program_id)
  programs.modify(prg, _soviet, [&](auto &p) {
    p.available = p.available.value_or(asset(0, quantity.symbol)) + quantity;
    p.share_contributions = p.share_contributions.value_or(asset(0, quantity.symbol)) + quantity;
  });
  
  
}
