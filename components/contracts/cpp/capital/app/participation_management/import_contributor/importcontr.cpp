/**
 * @brief Импорт внешнего вкладчика с автоматическим созданием записи и внесением взносов
 * Создает запись вкладчика в системе капитализации для внешних участников кооператива:
 * - Проверяет отсутствие конфигурации кооператива для возможности импорта
 * - Валидирует сумму первоначальных взносов
 * - Создает запись вкладчика со статусом ACTIVE и внешним договором УХД
 * - Открывает программный кошелек в программе капитализации
 * - Зачисляет первоначальные взносы с блокировкой средств
 * @param coopname Наименование кооператива
 * @param username Наименование импортируемого вкладчика
 * @param contributor_hash Уникальный хеш для идентификации вкладчика
 * @param contribution_amount Сумма первоначальных взносов в программу капитализации
 * @param memo Мемо для импортированных вкладчиков
 * @ingroup public_actions
 * @ingroup public_capital_actions
 *
 * @note Авторизация требуется от аккаунта: @p coopname
 * @note Импорт возможен только до установки конфигурации кооператива
 *
 * @post Создается запись вкладчика со статусом ACTIVE
 * @post Открывается программный кошелек в программе капитализации
 * @post Зачисляются первоначальные взносы с блокировкой средств
 */
void capital::importcontrib(eosio::name coopname, eosio::name username, checksum256 contributor_hash, eosio::asset contribution_amount, std::string memo) {
  require_auth(coopname);

  // Проверка, что конфиг кооператива еще не установлен
  Capital::global_state_table global_state_inst(_self, _self.value);
  auto global_state_itr = global_state_inst.find(coopname.value);
  eosio::check(global_state_itr == global_state_inst.end(), "Невозможно импортировать вкладчика: кооператив уже имеет установленную конфигурацию");

  // Проверка суммы взносов
  Wallet::validate_asset(contribution_amount);
  eosio::check(contribution_amount.amount > 0, "Сумма взносов должна быть положительной");

  // Проверка, что вкладчик еще не существует
  auto existing_contributor = Capital::Contributors::get_contributor(coopname, username);
  eosio::check(!existing_contributor.has_value(), "Вкладчик уже существует");

  // Проверка, что contributor_hash уникален
  auto existing_by_hash = Capital::Contributors::get_contributor_by_hash(coopname, contributor_hash);
  eosio::check(!existing_by_hash.has_value(), "Хэш вкладчика не уникален");
  
  // Создание вкладчика
  Capital::Contributors::import_contributor(
    coopname,
    username,
    contributor_hash,
    memo,
    asset(20000000, _root_govern_symbol) // rate_per_hour = 2000 RUB / за час для импортированных вкладчиков
  );

  // Открытие кошелька в программе капитализации
  eosio::action(
    permission_level{ _capital, "active"_n },
    _soviet,
    "openprogwall"_n,
    std::make_tuple(coopname, username, _capital_program, uint64_t(0)) // agreement_id = 0
  ).send();

  // Пополнение кошелька программы капитализации
  std::string internal_memo = Capital::Memo::get_import_contributor_memo(contributor_hash, contribution_amount);
  
  Wallet::add_blocked_funds(_capital, coopname, username, contribution_amount, _capital_program, internal_memo);
  
  // Увеличиваем паевой фонд через бухгалтерский учет
  Ledger::add(_capital, coopname, Ledger::accounts::SHARE_FUND, contribution_amount, internal_memo);
  
}