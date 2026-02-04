/**
 * @brief Устанавливает мастера проекта
 * Назначает мастера для управления проектом:
 * - Проверяет существование проекта
 * - Валидирует что пользователь подписал договор УХД
 * - Проверяет что пользователь является участником проекта
 * - Назначает мастера проекта
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта
 * @param master Наименование пользователя-мастера
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::setmaster(name coopname, checksum256 project_hash, name master) {
    require_auth(coopname);

    
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
  
    // Если мастер не указан (пустая строка), просто снимаем назначение мастера
    if (master == name()) {
      Capital::Projects::set_master(coopname, project.id, name());
      return;
    }

    // Проверяем что пользователь подписал основной договор УХД
    auto contributor = Capital::Contributors::get_contributor(coopname, master);
    eosio::check(contributor.has_value(), "Мастер должен подписать основной договор УХД");
    eosio::check(contributor -> status == Capital::Contributors::Status::ACTIVE, "Основной договор УХД не активен");
  
    // Проверяем что пользователь является участником проекта
    eosio::check(Capital::Contributors::is_contributor_has_appendix_in_project(coopname, project_hash, contributor->id),
                 "Мастер должен быть участником проекта");

    // Проверяем лимит количества авторов
    uint64_t current_authors_count = Capital::Segments::count_project_authors(coopname, project_hash);
    eosio::check(current_authors_count < MAX_PROJECT_AUTHORS, "Превышено максимальное количество соавторов в проекте");
  
    // Проверяем что проект авторизован советом
    //eosio::check(project -> is_authorized, "Проект не авторизован советом");

    // Назначаем мастера проекта
    Capital::Projects::set_master(coopname, project.id, master);
    
    // Получаем или создаем segment_id для мастера
    auto segment = Capital::Segments::get_segment(coopname, project_hash, master);
    uint64_t segment_id = 0;
    if (segment.has_value()) {
      segment_id = segment.value().id;
    } else {
      segment_id = Capital::Segments::get_segment_id(coopname);
    }
    
    // Добавляем мастера как соавтора в проект
    Capital::Core::upsert_author_segment(coopname, segment_id, project, master);
} 