

/**
\ingroup public_actions
\brief Установка прав для персонала кооператива
*
* Этот метод позволяет установить конкретные права для члена персонала в кооперативе.
* Авторизация для выполнения этого метода требуется только от председателя совета кооператива.
*
* @param coopname Имя кооператива
* @param board_id ID совета кооператива
* @param chairman Имя председателя совета
* @param username Имя члена персонала, для которого устанавливаются права
* @param rights Вектор прав, которые будут установлены для указанного члена персонала
* 
* @note Авторизация требуется от аккаунта: @p chairman
*/
void soviet::setrights(eosio::name coopname, eosio::name chairman, eosio::name username, std::vector<right> rights) {
  require_auth(chairman);

  staff_index staff(_soviet, coopname.value);
  boards_index boards(_soviet, coopname.value);

  auto board = get_board_by_type_or_fail(coopname, "soviet"_n);
  eosio::check(board.is_valid_chairman(chairman), "Только председатель кооператива может устанавливать права персонала");

  auto persona = staff.find(username.value);
  eosio::check(persona != staff.end(), "Персона не найдена");

  staff.modify(persona, chairman, [&](auto &a){
    a.rights = rights;
    a.updated_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
  });  
};