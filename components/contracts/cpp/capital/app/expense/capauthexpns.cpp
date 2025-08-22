/**
 * @brief Авторизует расход в проекте советом
 * Авторизует расход в проекте советом и создает исходящий платеж:
 * - Получает расход и валидирует его статус (должен быть approved)
 * - Проверяет регистрацию пользователя
 * - Авторизует расход (обновляет статус)
 * - Создает объект исходящего платежа в gateway с коллбэком
 * @param coopname Наименование кооператива
 * @param expense_hash Хеш расхода для авторизации
 * @param authorization Документ авторизации совета
 * @ingroup public_actions
 * @ingroup public_capital_actions

 * @note Авторизация требуется от аккаунта: @p _soviet
 */
void capital::capauthexpns(eosio::name coopname, checksum256 expense_hash, document2 authorization) {
  require_auth(_soviet);
  
  // Получаем расход и проверяем его статус
  auto expense = Capital::Expenses::get_expense_or_fail(coopname, expense_hash);
  eosio::check(expense.status == Capital::Expenses::Status::APPROVED, "Расход должен быть в статусе 'approved'");
  
  // Проверяем что пользователь зарегистрирован
  auto contributor = Capital::Contributors::get_contributor(coopname, expense.username);
  eosio::check(contributor.has_value(), "Договор УХД с пайщиком по проекту не найден");
  
  // Авторизуем расход (простое обновление статуса)
  Capital::Expenses::set_authorized(coopname, expense_hash, authorization);
  
  // Создаём объект исходящего платежа в gateway с коллбэком после обработки
  Action::send<createoutpay_interface>(
    _gateway,
    Names::External::CREATE_OUTPAY,
    _capital,
    coopname, 
    expense.username, 
    expense.expense_hash, 
    expense.amount, 
    _capital, 
    Names::Capital::CONFIRM_EXPENSE_PAYMENT, 
    Names::Capital::DECLINE_EXPENSE
  );  
}