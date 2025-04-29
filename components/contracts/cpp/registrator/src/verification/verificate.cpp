/**
\ingroup public_actions
\brief Верификация аккаунта
*
* Этот метод позволяет верифицировать аккаунты как пользователей, так и организаций.
* На данный момент может быть применен только аккаунтом автономной некоммерческой организации "Кооперативная Экономика".
*
* @param username Имя аккаунта, который подлежит верификации
*
* @note Авторизация требуется от аккаунта: @p
*/
[[eosio::action]] void registrator::verificate(eosio::name username, eosio::name procedure)
{
  require_auth(_provider);
  eosio::check(procedure == "online"_n, "Только онлайн-верификация доступна сейчас");

  accounts_index accounts(_registrator, _registrator.value);
  auto account = accounts.find(username.value);
  eosio::check(account != accounts.end(), "Аккаунт не найден");

  if (procedure == "online"_n)
  {
    accounts.modify(account, _provider, [&](auto &a)
    {
    
      for (const auto& ver : a.verifications) {
        eosio::check(ver.procedure == "online"_n, "Онлайн верификация уже проведена");
      }
      
      verification new_verification {
        .verificator = _ano,
        .is_verified = true,
        .procedure = procedure,
        .created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch()),
        .last_update = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch()),
        .notice = ""
      };

      a.verifications.push_back(new_verification); 
    
    });
  }
  else
  {
    eosio::check(false, "Только онлайн-верификация доступна сейчас");
  }
}
