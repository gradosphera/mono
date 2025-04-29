/**
\ingroup public_actions
\brief Метод редактирования целевой программы
*
* Этот метод позволяет модифицировать существующую программу.
*
* @param coopname Имя кооператива
* @param id Идентификатор программы
* @param name Имя программы
* @param announce Объявление о программе
* @param description Описание программы
* @param preview Предварительный просмотр
* @param images Изображения для программы
* @param website Веб-сайт программы
* @param initial Вступительный взнос
* @param minimum Минимальный взнос
* @param membership Членский взнос
* @param period Периодичность
* @param category Категория
*
* @note Авторизация требуется от аккаунта: @p coopname
*/
void soviet::editprog(eosio::name coopname, eosio::name username, uint64_t program_id, uint64_t draft_id, std::string title, std::string announce, std::string description, std::string preview, std::string images, std::string meta) {
  check_auth_or_fail(_soviet, coopname, username, "editprog"_n);
  
  programs_index programs(_soviet, coopname.value);
  auto existing_program = programs.find(program_id);
  eosio::check(existing_program != programs.end(), "Программа не найдена.");

  programs.modify(existing_program, coopname, [&](auto& pr) {
    pr.draft_id = draft_id;
    pr.title = title;
    pr.announce = announce;
    pr.description = description;
    pr.preview = preview;
    pr.images = images;
    pr.meta = meta;
  });
}