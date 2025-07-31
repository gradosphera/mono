namespace Capital::Memo {

  inline std::string get_invest_memo(uint64_t contributor_id) {
    return "Зачёт части целевого паевого взноса по программе 'Цифровой Кошелёк' в качестве паевого взноса по договору УХД с ID: " + std::to_string(contributor_id);
  }

  inline std::string get_convert_to_blagorost_memo() {
    return "Конвертация паевого взноса по программе УХД в ЦПП 'Благорост'";
  }

  inline std::string get_convert_to_wallet_memo() {
    return "Конвертация паевого взноса по программе УХД в ЦПП 'Цифровой Кошелёк'";
  }

  inline std::string get_approve_convert_memo(uint64_t contributor_id, uint64_t convert_id) {
    return "Зачёт части целевого паевого взноса по договору УХД с ID: " + std::to_string(contributor_id) + " в качестве паевого взноса по программе 'Капитализация' с ID: " + std::to_string(convert_id);
  }

  inline std::string get_result_withdraw_memo(uint64_t contributor_id) {
    return "Зачёт части целевого паевого взноса по договору УХД с ID: " + std::to_string(contributor_id) + " в качестве паевого взноса по программе 'Цифровой Кошелёк'";
  }

  inline std::string get_project_withdraw_memo() {
    return "Зачёт части целевого паевого взноса по программе 'Капитализация' в качестве паевого взноса по участию в 'Цифровой Кошелёк'";
  }

  inline std::string get_program_withdraw_memo(uint64_t withdraw_id) {
    return "Зачёт части целевого паевого взноса по программе 'Капитализация' в качестве паевого взноса по программе 'Цифровой Кошелёк' с ID: " + std::to_string(withdraw_id);
  }

  inline std::string get_approve_invest_memo(uint64_t contributor_id) {
    return "Зачёт части целевого паевого взноса по программе 'Цифровой Кошелёк' в качестве паевого взноса по договору УХД с contributor_id:" + std::to_string(contributor_id);
  }

  inline std::string get_decline_invest_memo() {
    return "Возврат заблокированных средств по отклоненной инвестиции";
  }

  inline std::string get_coordinator_payment_memo() {
    return "Выплата координатору проекта";
  }

  inline std::string get_external_contract_memo() {
    return "Договор УХД подписан за пределами цифровой платформы";
  }

  inline std::string get_result_memo(uint64_t contributor_id, uint64_t result_id) {
    return "Зачёт части целевого паевого взноса по договору УХД с ID: " + std::to_string(contributor_id) + " в качестве паевого взноса по программе 'Цифровой Кошелёк' с ID: " + std::to_string(result_id);
  }

} // namespace Capital::Memo