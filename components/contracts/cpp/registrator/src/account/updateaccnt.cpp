

/**
\ingroup public_actions
\brief Обновление метаданных аккаунта
*
* Этот метод позволяет обновить метаданные указанного аккаунта.
* Только владелец аккаунта имеет право обновлять его метаданные.
*
* @param username Имя аккаунта, который требуется обновить
* @param meta Новые метаданные для аккаунта
*
* @note Авторизация требуется от аккаунта: @p username
*/
void registrator::updateaccnt(eosio::name username, eosio::name account_to_change, std::string meta)
{
  require_auth(username);

  if (account_to_change != username)
    check_auth_or_fail(_registrator, account_to_change, username, "updateaccnt"_n);
  
  accounts_index accounts(_registrator, _registrator.value);

  auto account = accounts.find(account_to_change.value);

  eosio::check(account != accounts.end(), "Аккаунт не зарегистрирован");

  accounts.modify(account, username, [&](auto &acc){ 
    acc.meta = meta; 
  });
}
