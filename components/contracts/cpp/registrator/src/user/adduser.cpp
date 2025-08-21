/**
 * @brief Добавление пайщика.
 * Создает новый аккаунт и добавляет пайщика в кооператив
 * @param coopname Наименование кооператива
 * @param referer Имя реферера
 * @param username Имя пользователя для создания
 * @param type Тип пользователя (individual, entrepreneur, organization)
 * @param created_at Дата создания аккаунта
 * @param initial Вступительный взнос
 * @param minimum Минимальный взнос
 * @param spread_initial Флаг распределения вступительного взноса
 * @param meta Метаданные пользователя
 * @ingroup public_actions
 * @ingroup public_registrator_actions
 * @anchor registrator_adduser
 * @note Авторизация требуется от аккаунта: @p coopname
 */
[[eosio::action]] void registrator::adduser(
    eosio::name coopname, eosio::name referer, 
    eosio::name username, eosio::name type , eosio::time_point_sec created_at, 
    eosio::asset initial, eosio::asset minimum, bool spread_initial, std::string meta)
{
  require_auth(coopname);
  
  auto cooperative = get_cooperative_or_fail(coopname);
  
  eosio::check(created_at.sec_since_epoch() <= eosio::current_time_point().sec_since_epoch(), "Дата created_at должна быть в прошлом" );
  eosio::check(cooperative.initial.symbol == initial.symbol, "Неверный символ");
  eosio::check(cooperative.initial.symbol == minimum.symbol, "Неверный символ");
  
  authority active_auth;
  active_auth.threshold = 1; 

  authority owner_auth;
  owner_auth.threshold = 1;

  // Устанавливаем разрешение eosio.prods@active для владельца
  permission_level_weight eosio_prods_plw{{_registrator, "active"_n},1};
  owner_auth.accounts.push_back(eosio_prods_plw);

  // Добавьте пустые ключи в active_auth
  active_auth.accounts.push_back(eosio_prods_plw);
  
  // регистрируем аккаунт  
  action(permission_level(_registrator, "active"_n), "eosio"_n, "createaccnt"_n,
         std::tuple(coopname, username, owner_auth, active_auth))
  .send();
  
  accounts_index accounts(_registrator, _registrator.value);
  
  auto card = accounts.find(username.value);

  eosio::check(card == accounts.end(), "Аккаунт уже зарегистририван");

  eosio::check(type == "individual"_n || type == "entrepreneur"_n || type == "organization"_n, "Неверный тип пользователя, допустимы только: individual, entrepreneur и organization.");
  
  std::vector<eosio::name> storages;
  
  storages.push_back(coopname);

  accounts.emplace(coopname, [&](auto &n)
    {
      n.username = username;
      n.status = "active"_n;
      n.registrator = coopname;
      n.referer = referer;
      n.type = type;
      n.storages = storages; 
      n.registered_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
      n.meta = meta; 
    });
    
  
  Ledger::add(_registrator, coopname, Ledger::accounts::SHARE_FUND, minimum, "Паевой взнос при регистрации пайщика");
  
  if (spread_initial) {
    Ledger::add(_registrator, coopname, Ledger::accounts::ENTRANCE_FEES, initial, "Вступительный взнос при регистрации пайщика");
  }
  
  eosio::name braname = ""_n;
  
  action(permission_level{_registrator, "active"_n}, _soviet, "addpartcpnt"_n,
     std::make_tuple(coopname, username, braname, type, created_at, initial, minimum, spread_initial))
  .send();
  
}
