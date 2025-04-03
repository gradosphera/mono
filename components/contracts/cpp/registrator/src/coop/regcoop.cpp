/**
\ingroup public_actions
\brief Регистрация кооператива-члена цифровой системы
*
* Этот метод позволяет 
*
* @note Авторизация требуется от одного из аккаунтов: @p coopname || username
*/
[[eosio::action]] void registrator::regcoop(eosio::name coopname, eosio::name username, org_data params, document document)
{
  check_auth_or_fail(_registrator, coopname, username, "regcoop"_n);
  
  eosio::name payer = username;

  get_cooperative_or_fail(_provider);

  accounts_index accounts(_registrator, _registrator.value);
  auto account = accounts.find(coopname.value);
  eosio::check(account != accounts.end(), "Участник не найден в картотеке аккаунтов");
  
  eosio::check(account -> type != ""_n, "Аккаунт не переведен в статус пользователя (reguser)");
  
  eosio::check(account->type == "organization"_n, "Только организация может быть подключена к системе");

  cooperatives_index coops(_registrator, _registrator.value);
  eosio::check(params.initial.symbol == params.minimum.symbol && params.initial.symbol == _root_govern_symbol, "Неверные символы для взносов");
  eosio::check(params.org_initial.symbol == params.org_minimum.symbol && params.org_initial.symbol == _root_govern_symbol, "Неверные символы для взносов");  
  eosio::check(params.initial.amount > 0 && params.org_initial.amount > 0 && params.minimum.amount > 0 && params.org_minimum.amount > 0, "Вступительный и минимальный паевые взносы должны быть положительными");
  
  eosio::check(params.is_cooperative == true, "Только кооператив может быть подключен к системе");
  
  coops.emplace(payer, [&](auto &org)
    {
      org.username = coopname;
      org.is_cooperative = params.is_cooperative;
      org.coop_type = params.coop_type;
      org.announce = params.announce;
      org.description = params.description;
      org.registration = params.initial + params.minimum;
      org.initial = params.initial;
      org.minimum = params.minimum; 
      org.org_registration = params.org_initial + params.org_minimum;
      org.org_initial = params.org_initial;
      org.org_minimum = params.org_minimum; 
      org.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
      org.status = "pending"_n;
      org.document = document;
    });
    
    //newSubmitted
    action(
      permission_level{ _registrator, "active"_n},
      _soviet,
      "newsubmitted"_n,
      std::make_tuple(_provider, coopname, "regcoop"_n, uint64_t(0), document)
    ).send();
}
