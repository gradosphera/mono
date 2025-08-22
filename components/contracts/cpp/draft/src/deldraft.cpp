/**
 * @brief Удаление шаблона документа.
 * Удаляет существующий шаблон документа из системы.
 * @param scope Область видимости (кооператив или _draft)
 * @param username Имя пользователя, удаляющего шаблон
 * @param registry_id Реестровый идентификатор шаблона для удаления
 * @ingroup public_actions
 * @ingroup public_draft_actions

 * @note Авторизация требуется от аккаунта: @p scope или @p _system
 */
void draft::deldraft(eosio::name scope, eosio::name username, uint64_t registry_id) {
  eosio::name payer = draft::get_payer_and_check_auth_in_scope(scope, username, "deldraft"_n);
  
  drafts_index drafts(_draft, _draft.value);

  auto draft = drafts.find(registry_id);
  eosio::check(draft != drafts.end(), "Шаблон не найден");
  
  drafts.erase(draft);
};
