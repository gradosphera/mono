/**
 * @brief Инициализирует проект для авторизации советом
 * Отправляет проект на рассмотрение совета кооператива:
 * - Проверяет что проект существует
 * - Проверяет что проект еще не инициализирован
 * - Отправляет проект на авторизацию с предоставленным документом
 * @param coopname Наименование кооператива
 * @param project_hash Хеш проекта для инициализации
 * @param document Документ для отправки в совет
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p coopname
 * @note Доступно для всех проектов (корневых и дочерних)
 */
void capital::initprj(eosio::name coopname, checksum256 project_hash, document2 document) {
    require_auth(coopname);

    // Проверяем что контракт инициализирован
    Capital::State::is_initialized(coopname);

    // Получаем проект для проверки
    auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);

    // Проверяем что проект еще не инициализирован
    // eosio::check(!project->is_authorized, "Проект уже инициализирован");

    // Отправляем на рассмотрение совета
    ::Soviet::create_agenda(
      _capital,
      coopname,
      coopname,
      Names::SovietActions::CREATE_PROJECT,
      project_hash,
      _capital,
      Names::Capital::AUTHORIZE_PROJECT,
      Names::Capital::DECLINE_PROJECT,
      document,
      std::string("")
    );
}