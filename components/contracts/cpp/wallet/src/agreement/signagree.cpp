/**
 * @brief Подписание программного соглашения пайщиком (ADR-008).
 *
 * Wallet — owner программных соглашений (Эпик 2 компонента 48). Запись хранит
 * только хэш и метаданные документа; полный текст лежит в action data
 * (audit trail) и в off-chain реестре документов — НЕ в state контракта.
 *
 * Upsert по `(username, program_id)`:
 *   - если у `username` нет записи в `users` — emplace новой записью с одной
 *     программой в `programs[]`;
 *   - если запись есть, но `program_id` ещё не подписан — push в `programs[]`;
 *   - если `program_id` уже подписан — update version/draft_id/signed_at/doc_hash
 *     (повторная подпись = пересоглашение).
 *
 * @param coopname Кооператив (auth: coopname@active, payer для записи `users`)
 * @param username Пайщик, подписывающий соглашение
 * @param program_id Идентификатор программы (см. soviet::programs)
 * @param document Документ соглашения с подписями (только в action data, не в state)
 * @param draft_id Идентификатор шаблона документа (см. draft::drafts)
 * @ingroup public_actions
 * @ingroup public_wallet_actions
 *
 * @note Авторизация требуется от аккаунта: @p coopname (active)
 */
[[eosio::action]] void wallet::signagree(
  eosio::name coopname,
  eosio::name username,
  uint64_t    program_id,
  document2   document,
  uint64_t    draft_id
) {
  require_auth(coopname);

  // Кооператив должен существовать и быть активным.
  get_cooperative_or_fail(coopname);

  // Пайщик должен быть зарегистрирован в кооперативе.
  get_participant_or_fail(coopname, username);

  // Программа должна существовать и быть активной.
  auto program = get_program_or_fail(coopname, program_id);

  // Документ должен иметь хотя бы одну валидную подпись.
  verify_document_or_fail(document);

  // Если у программы задан draft_id — действующая подпись должна быть на тот же draft.
  if (program.draft_id > 0) {
    eosio::check(draft_id == program.draft_id,
                 "draft_id соглашения не совпадает с draft_id программы");
  }

  // Получаем версию шаблона из реестра drafts (если draft_id задан).
  uint16_t version = 0;
  if (draft_id > 0) {
    auto draft = get_scoped_draft_by_registry_or_fail(_draft, draft_id);
    version = static_cast<uint16_t>(draft.version);
  }

  Wallet::users_index users(_wallet, coopname.value);
  auto user_it = users.find(username.value);

  Wallet::program_agreement new_pa{
    .program_id = program_id,
    .doc_hash   = document.hash,
    .version    = version,
    .draft_id   = draft_id,
    .signed_at  = eosio::current_time_point(),
  };

  if (user_it == users.end()) {
    users.emplace(coopname, [&](auto &row) {
      row.username = username;
      row.programs = { new_pa };
    });
  } else {
    users.modify(user_it, coopname, [&](auto &row) {
      auto pa_it = std::find_if(
        row.programs.begin(), row.programs.end(),
        [&](const Wallet::program_agreement &p) { return p.program_id == program_id; });

      if (pa_it == row.programs.end()) {
        row.programs.push_back(new_pa);
      } else {
        *pa_it = new_pa;
      }
    });
  }
}
