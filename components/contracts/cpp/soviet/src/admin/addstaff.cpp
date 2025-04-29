
/**
\ingroup public_actions
\brief Добавление персонала кооператива
*
* Данный метод позволяет добавить в кооператив нового члена персонала с указанием определенных прав на выполнение методов действий вместо совета.
* Авторизация для выполнения этого метода требуется только от председателя совета кооператива.
*
* @param coopname Имя кооператива
* @param board_id ID совета кооператива
* @param chairman Имя председателя совета
* @param username Имя нового члена персонала
* @param rights Список прав, разрешенных для выполнения указанным членом персонала
* @param position_title Название должности нового члена персонала
* 
* @note Авторизация требуется от аккаунта: @p chairman
*/
void soviet::addstaff(eosio::name coopname, eosio::name chairman, eosio::name username, std::vector<right> rights, std::string position_title) {
  require_auth(chairman);

  staff_index staff(_soviet, coopname.value);
  
  auto board = get_board_by_type_or_fail(coopname, "soviet"_n);
  eosio::check(board.is_valid_chairman(chairman), "Только председатель кооператива может добавлять персонал");

  auto persona = staff.find(username.value);
  accounts_index accounts(_registrator, _registrator.value);
  auto account = accounts.find(username.value);
  eosio::check(account != accounts.end(), "Сотрудник не найден в картотеке аккаунтов");

  eosio::check(persona == staff.end(), "Сотрудник уже добавлен. Отредактируйте его права или переназначьте на другую должность");

  staff.emplace(chairman, [&](auto &a){
    a.username = username;
    a.position_title = position_title;
    a.rights = rights;
    a.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    a.updated_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
  });

};
