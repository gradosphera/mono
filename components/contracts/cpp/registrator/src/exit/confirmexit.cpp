/**
 * @brief Одобрение советом выхода пайщика из кооператива.
 * Совет одобрил заявление о выходе. Контракт сам вычисляет сумму возврата по
 * L3-балансам ledger2 (минимальный + целевой паевой), консолидирует
 * минимальный паевой на главный (o.reg.mvmin), резервирует сумму возврата
 * (o.wal.wthreq) и создаёт исходящий платёж в gateway. Если возвращать нечего
 * — выход завершается сразу без платежа.
 * @param coopname Наименование кооператива
 * @param exit_hash Хэш процесса выхода
 * @param authorization Документ-решение совета о выходе
 * @ingroup public_actions
 * @ingroup public_registrator_actions

 * @note Авторизация требуется от аккаунта: @p soviet
 */
void registrator::confirmexit(eosio::name coopname, checksum256 exit_hash, document2 authorization) {
  require_auth(_soviet);

  auto exist = Registrator::get_exit_by_hash(coopname, exit_hash);
  eosio::check(exist.has_value(), "Объект выхода не найден");

  Registrator::exits_index exits(_registrator, coopname.value);
  auto e = exits.find(exist->username.value);
  eosio::check(e->status == "pending"_n, "Только ожидающие заявления на выход могут быть одобрены");

  eosio::name username = e->username;

  // оповещаем пайщика
  require_recipient(username);

  // Контракт сам считает сумму возврата по L3-балансам ledger2 — не доверяем
  // клиенту. Возвращается минимальный (w.reg.minshr) + целевой (w.wal.share)
  // паевой взнос пайщика.
  eosio::asset min_share = Registrator::get_user_wallet_available(coopname, ledger2_wallets::MIN_SHARE_FUND, username);
  eosio::asset share = Registrator::get_user_wallet_available(coopname, ledger2_wallets::SHARE_FUND_PAY, username);
  eosio::asset total_return = min_share + share;

  exits.modify(e, _soviet, [&](auto &row) {
    row.status = "authorized"_n;
    row.approved_statement = authorization;
    row.quantity = total_return;
  });

  // Консолидируем минимальный паевой на главный (o.reg.mvmin: w.reg.minshr →
  // w.wal.share), чтобы единым платежом вернуть весь паевой через механику
  // возврата паевого взноса (o.wal.*).
  if (min_share.amount > 0) {
    std::string memo = "Консолидация минимального паевого взноса при выходе, username=" + username.to_string();
    Ledger2::apply(_registrator, coopname, operations::registrator::MOVE_MINSHARE,
                   min_share, username, exit_hash, memo);
  }

  if (total_return.amount > 0) {
    // Резервируем сумму возврата: w.wal.share → w.wal.wpend (o.wal.wthreq).
    std::string memo_req = "Резерв паевого взноса под выход из кооператива, username=" + username.to_string();
    Ledger2::apply(_registrator, coopname, operations::wallet::REQUEST_WITHDRAW,
                   total_return, username, exit_hash, memo_req);

    // Создаём исходящий платёж в gateway с коллбэками completexit/declinexit.
    Action::send<createoutpay_interface>(
      _gateway,
      "createoutpay"_n,
      _registrator,
      coopname,
      username,
      exit_hash,
      total_return,
      _registrator,
      "completexit"_n,
      "declinexit"_n
    );
  } else {
    // Возвращать нечего — финализируем выход без платежа.
    Registrator::finalize_member_exit(coopname, username);
    exits.erase(e);
  }
}
