/**
 * @brief Создание предложения по имущественному взносу
 * \ingroup public_actions
 * @note Авторизация требуется от аккаунта: @p coopname
 */
void capital::createpjprp(eosio::name coopname, eosio::name username, 
                        checksum256 project_hash, checksum256 property_hash, 
                        eosio::asset property_amount, std::string property_description) {
  require_auth(coopname);
  
  // Проверяем существование проекта и получаем его
  auto project = Capital::Projects::get_project_or_fail(coopname, project_hash);
    
  // Проверяем, что проект в статусе "active"
  eosio::check(project.status == Capital::Projects::Status::ACTIVE, "Проект должен быть в статусе 'active'");
  
  // Проверяем основной договор УХД
  auto contributor = Capital::Contributors::get_contributor(coopname, username);
  eosio::check(contributor.has_value(), "Пайщик не подписывал основной договор УХД");
  eosio::check(contributor->status == Capital::Contributors::Status::ACTIVE, "Основной договор УХД не активен");
  
  // Проверяем приложение к проекту
  eosio::check(Capital::Contributors::is_contributor_has_appendix_in_project(coopname, project_hash, username), 
               "Пайщик не подписывал приложение к договору УХД для данного проекта");
  
  // Проверяем, что предложение с указанным хэшем не существует
  auto property = Capital::ProjectProperties::get_property(coopname, property_hash);
  eosio::check(!property.has_value(), "Предложение с указанным хэшем уже существует");
  
  // Валидация суммы имущества
  Wallet::validate_asset(property_amount);
  eosio::check(property_amount.amount > 0, "Стоимость имущества должна быть положительной");
  
  // Проверяем описание имущества
  eosio::check(!property_description.empty(), "Описание имущества не может быть пустым");
  
  // Создаем предложение и отправляем на approve
  Capital::ProjectProperties::create_property_with_approve(
    coopname,
    username,
    project_hash,
    property_hash,
    property_amount,
    property_description
  );
}
