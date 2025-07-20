void capital::paycoordntr(name coopname, name application, checksum256 project_hash, name coordinator, asset amount) {
    require_auth(coopname);
    
    Wallet::validate_asset(amount);
    
    // Получаем координатора
    auto coord = get_coordinator_or_fail(coopname, project_hash, coordinator, "Координатор не найден");
    
    // Проверяем что у координатора достаточно накопленных средств
    eosio::check(coord.earned >= amount, "Недостаточно накопленных средств для получения");
    
    // Обновляем данные координатора
    coordinator_index coordinators(_capital, coopname.value);
    auto coordinator_itr = coordinators.find(coord.id);
    
    coordinators.modify(coordinator_itr, coopname, [&](auto &c) {
        c.earned -= amount;
        c.withdrawed += amount;
    });
    
    // Конвертируем средства из ЦПП "Благорост" в ЦПП "Цифровой Кошелёк"
    std::string memo = "Выплата координатору проекта";
    //TODO: тут напрямую вроде так нельзя - надо проверить (только через заявление?)
    Wallet::convert_between_programs(_capital, coopname, coordinator, amount, _capital_program, _wallet_program, memo);
} 