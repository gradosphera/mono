/**
\ingroup public_actions
\brief Метод отключения целевой программы
*
* Этот метод позволяет отключить существующую программу, устанавливая поле `is_active` в `false`.
*
* @param coopname Имя кооператива
* @param id Идентификатор программы
*
* @note Авторизация требуется от аккаунта: @p coopname
*/
void soviet::disableprog(eosio::name coopname, uint64_t program_id) {
  require_auth(coopname);

  programs_index programs(_soviet, coopname.value);
  auto existing_program = programs.find(program_id);
  eosio::check(existing_program != programs.end(), "Программа не найдена.");

  programs.modify(existing_program, coopname, [&](auto& pr) {
    pr.is_active = false;
  });
}