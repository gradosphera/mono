void add_vote_against(eosio::name coopname, eosio::name member, uint64_t decision_id) {
  // Инициализация таблицы решений
  decisions_index decisions(_soviet, coopname.value);

  auto decision = decisions.find(decision_id);
  // Модифицируем запись в таблице
  decisions.modify(decision, _soviet, [&](auto& row) {
    row.votes_against.push_back(member); // Добавляем участника в голоса против
  });
}

/**
\ingroup public_actions
\brief Голосование против решения совета
*
* Этот метод позволяет члену совета голосовать против конкретного решения. Если у члена совета нет права голоса или голосование уже было произведено ранее, процедура завершится ошибкой.
*
* @param coopname Имя кооператива
* @param member Имя члена совета, голосующего против решения
* @param decision_id Идентификатор решения, против которого происходит голосование
* 
* @note Авторизация требуется от аккаунта: @p member или @p permission_level{member, "provide"_n}
*/
void soviet::voteagainst(eosio::name coopname, eosio::name member, uint64_t decision_id) { 
  
  if (!has_auth(member)) {
    require_auth(permission_level{member, "provide"_n});
  } else {
    require_auth(member);
  }
  
  decisions_index decisions(_soviet, coopname.value);
  auto decision = decisions.find(decision_id);
  eosio::check(decision != decisions.end(), "Документ не найден");

  auto board = get_board_by_type_or_fail(coopname, "soviet"_n);

  eosio::check(board.is_voting_member(member), "У вас нет права голоса");
  
  decision -> check_for_any_vote_exist(member); 

  add_vote_against(coopname, member, decision_id);
};

