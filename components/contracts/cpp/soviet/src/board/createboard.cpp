
/**
\ingroup public_actions
\brief Создание нового совета кооператива
*
* Этот метод позволяет председателю кооператива создать новый совет с указанными членами и параметрами. Если совет создается как совет кооператива, председатель должен быть указан в списке членов совета.
*
* @param coopname Имя кооператива
* @param username Имя председателя кооператива
* @param type Тип совета. Доступные типы:
*   - **soviet** - Совет кооператива (Board of Members)
*   - **executive** - Правление (Executive Board)
*   - **audit** - Ревизионный комитет (Audit and Revision Board)
*   - **other** - Другая комиссия (Other committee)
* @param members Список членов совета
* @param name Название совета
* @param description Описание совета
* 
* @note Авторизация требуется от аккаунта: @p username
*/
void soviet::createboard(eosio::name coopname, eosio::name username, eosio::name type, std::vector<board_member> members, std::string name, std::string description){
  require_recipient(coopname);
  
  check_auth_or_fail(_soviet, coopname, username, "createboard"_n);

  eosio::name payer = username;

  cooperatives_index coops(_registrator, _registrator.value);
  auto org = coops.find(coopname.value);
  eosio::check(org != coops.end(), "Организация не найдена");
  eosio::check(org -> is_coop(), "Организация - не кооператив");
    
  participants_index participants(_soviet, coopname.value);
  auto cooperative = get_cooperative_or_fail(coopname);
    
  if (type == "soviet"_n) {
    bool is_exist = check_for_exist_board_by_type(coopname, "soviet"_n);
    eosio::check(is_exist == false, "Совет кооператива уже создан");
    
    bool has_chairman = false;
    std::set<eosio::name> usernames;
    eosio::name chairman;
    
    bool chairman_found = false;

    for (const auto& m : members) {
        auto participant = participants.find(m.username.value);
        eosio::check(participant != participants.end(), "Один из аккаунтов не найден в реестре пайщиков");
        eosio::check(participant -> type.value() == "individual"_n, "Только физическое лицо может быть членом Совета");

        eosio::check(usernames.insert(m.username).second, "Обнаружено повторение username");

        if (m.position == "chairman"_n) {
            eosio::check(!chairman_found, "Обнаружено более одного председателя");
            has_chairman = true;
            chairman = m.username;
            chairman_found = true;
        }
    }

    eosio::check(has_chairman, "Председатель кооператива должен быть указан в членах совета");

    addresses_index addresses(_soviet, coopname.value);
    address_data data;

    addresses.emplace(payer, [&](auto &a) {
      a.id = 0;
      a.coopname = coopname;
      a.data = data;
    });
    
    
    soviet::make_base_coagreements(coopname, cooperative.initial.symbol);

  } else {
    
    auto soviet = get_board_by_type_or_fail(coopname, "soviet"_n);
  }

  boards_index boards(_soviet, coopname.value);

  boards.emplace(payer, [&](auto &b) {
    b.id = boards.available_primary_key();
    b.type = type;
    b.members = members;
    b.name = name;
    b.description = description;
    b.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    b.last_update = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
  });

}

