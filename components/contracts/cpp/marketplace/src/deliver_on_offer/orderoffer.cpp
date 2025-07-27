/**
\ingroup public_actions
\brief Создать заявку orderoffer - заказчик создает заявку на поставку товара от поставщика.
*
* Данный метод позволяет заказчику создать заявку на поставку товара от поставщика.
* Заявка содержит всю информацию о товаре, стоимости, документах и сразу блокирует средства заказчика.
*
* @param coopname Имя кооператива
* @param receiver_braname Имя кооперативного участка заказчика для получения товара
* @param username Имя заказчика
* @param hash Хэш заявки (уникальный идентификатор)
* @param units Количество единиц товара
* @param unit_cost Цена за единицу товара
* @param product_lifecycle_secs Время жизни продукта
* @param warranty_period_secs Гарантийный срок в секундах
* @param membership_fee_amount Сумма членского взноса
* @param cancellation_fee_amount Сумма комиссии за отмену заявки
* @param product_return_statement Заявление на возврат паевого взноса имуществом
* @param convert_in Заявление на конвертацию из кошелька в маркетплейс
* @param meta Метаданные о заявке
*
* @note Авторизация требуется от аккаунта: @p coopname
*/
[[eosio::action]] void marketplace::orderoffer(eosio::name coopname, eosio::name receiver_braname, eosio::name username, checksum256 hash, uint64_t units, eosio::asset unit_cost, uint32_t product_lifecycle_secs, uint32_t warranty_period_secs, eosio::asset membership_fee_amount, eosio::asset cancellation_fee_amount, document2 product_return_statement, document2 convert_in, std::string meta) {
  require_auth(coopname);
  
  // Проверяем, что заявка с таким хэшем не существует
  auto existing_request = get_request_by_hash(coopname, hash);
  eosio::check(!existing_request.has_value(), "Заявка с таким хэшем уже существует");
  
  // Проверяем, что символ токена совпадает с символом токена кооператива
  auto coop = get_cooperative_or_fail(coopname);  
  eosio::check(unit_cost.symbol == coop.initial.symbol, "Неверный символ токена");
  eosio::check(membership_fee_amount.symbol == coop.initial.symbol, "Неверный символ токена для членского взноса");
  eosio::check(cancellation_fee_amount.symbol == coop.initial.symbol, "Неверный символ токена для комиссии отмены");
  eosio::check(units > 0, "Количество единиц в заявке должно быть больше нуля");
  eosio::check(unit_cost.amount >= 0, "Цена не может быть отрицательной");
  eosio::check(membership_fee_amount.amount >= 0, "Членский взнос не может быть отрицательным");
  eosio::check(cancellation_fee_amount.amount >= 0, "Комиссия за отмену не может быть отрицательной");
  
  // Проверяем, что пользователь является пайщиком кооператива
  get_participant_or_fail(coopname, username);

  // Проверяем существование кооперативного участка заказчика
  get_branch_or_fail(coopname, receiver_braname);
  
  // Проверяем существование программы маркетплейса
  auto program = get_program_or_fail(coopname, _marketplace_program_id);

  // Гарантийный срок возврата должен быть установлен
  eosio::check(product_lifecycle_secs > 0, "Гарантийный срок возврата для имущества должен быть установлен");
  eosio::check(warranty_period_secs > 0, "Гарантийный срок должен быть больше нуля");

  // Проводим проверку подписи документов
  verify_document_or_fail(product_return_statement);
  verify_document_or_fail(convert_in);
  
  // Валидируем документы по registry_id (пока что нули как просил пользователь)
  Document::validate_registry_id(product_return_statement, 0);
  Document::validate_registry_id(convert_in, 0);

  // Рассчитываем стоимость
  eosio::asset base_cost = unit_cost * units;
  eosio::asset total_cost = base_cost + membership_fee_amount;
  
  // Проверяем что комиссия за отмену не превышает общую стоимость
  eosio::check(cancellation_fee_amount <= total_cost, "Комиссия за отмену не может превышать общую стоимость заявки");

  requests_index requests(_marketplace, coopname.value);
  uint64_t request_id = get_global_id(_marketplace, "requests"_n);
  
  std::string memo = "Начало поставки по программе №" + std::to_string(_marketplace_program_id) + " с ID: " + std::to_string(request_id);
  
  // Создаем вектор именованных документов
  std::vector<Document::named_document> documents;
  Document::add_document(documents, DocumentNames::RETURN_STMT, product_return_statement);
  Document::add_document(documents, DocumentNames::CONVERT_FROM, convert_in);
  
  requests.emplace(_marketplace, [&](auto &i) {
    i.id = request_id;
    i.hash = hash;
    i.type = "orderoffer"_n;
    i.username = username;
    i.coopname = coopname;
    i.status = "active"_n;
    i.units = units;
    i.unit_cost = unit_cost;
    i.base_cost = base_cost;
    i.membership_fee_amount = membership_fee_amount;
    i.total_cost = total_cost;
    i.product_lifecycle_secs = product_lifecycle_secs;
    i.warranty_period_secs = warranty_period_secs;
    i.money_contributor = username;
    i.meta = meta;
    i.created_at = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());
    i.cancellation_fee_amount = cancellation_fee_amount;
    i.receiver_braname = receiver_braname;
    i.documents = documents;
  });

  // Конвертируем и блокируем средства заказчика
  std::string convert_memo = "Конвертация средств из ЦПП 'Цифровой Кошелёк' в ЦПП 'Маркетплейс' для заказа №" + std::to_string(request_id);
  Wallet::sub_available_funds(_marketplace, coopname, username, total_cost, _wallet_program, convert_memo);
  
  // Добавляем средства на ЦПП маркетплейса
  Wallet::add_available_funds(_marketplace, coopname, username, total_cost, _marketplace_program, convert_memo);
  
  // Блокируем средства на программе маркетплейса
  Wallet::block_funds(_marketplace, coopname, username, total_cost, _marketplace_program, memo);
}; 