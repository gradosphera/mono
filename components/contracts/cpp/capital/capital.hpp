// capital.hpp

#pragma once

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../lib/common.hpp"
#include "include/tables.hpp"

using namespace eosio;
using std::string;

/**
 *  \ingroup public_contracts
 *  @brief  Контракт Capital управляет вкладами, распределением вознаграждений и выводом средств для участников.
 *  Capital — это контракт, управляющий вкладами участников, распределением вознаграждений и механизмами вывода средств в системе. Он поддерживает два типа вкладов — интеллектуальные и имущественные, и предоставляет два метода для участников, чтобы вывести свои средства при различных условиях.
 */
class [[eosio::contract]] capital : public contract {
public:
    using contract::contract;
    
    /**
     * @brief Инициализирует контракт, устанавливая глобальное состояние.
     * \ingroup public_actions
     * Это действие должно быть вызвано один раз после развертывания контракта.
     */
    [[eosio::action]]
    void init(name coopname, name initiator);

    [[eosio::action]]
    void createassign(name coopname, name application, checksum256 project_hash, checksum256 assignment_hash, eosio::name assignee, std::string description);

    //Возврат из задания  
    [[eosio::action]]
    void createwthd1(eosio::name coopname, eosio::name application, eosio::name username, checksum256 assignment_hash, checksum256 withdraw_hash, asset amount, document2 return_statement);

    [[eosio::action]]
    void capauthwthd1(eosio::name coopname, checksum256 withdraw_hash, document2 authorization);
    
    // Возврат из проекта    
    [[eosio::action]]
    void createwthd2(name coopname, name application, name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document2 return_statement);
    
    [[eosio::action]]
    void capauthwthd2(eosio::name coopname, checksum256 withdraw_hash, document2 authorization);
    
    [[eosio::action]]
    void approvewthd2(name coopname, name application, name approver, checksum256 withdraw_hash, document2 approved_return_statement);

    // Возврат из программы
    [[eosio::action]]
    void createwthd3(name coopname, name application, name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document2 return_statement);
    
    [[eosio::action]]
    void capauthwthd3(eosio::name coopname, checksum256 withdraw_hash, document2 authorization);
    
    [[eosio::action]]
    void approvewthd3(name coopname, name application, name approver, checksum256 withdraw_hash, document2 approved_return_statement);

    [[eosio::action]]
    void createproj (
      checksum256 project_hash,
      checksum256 parent_project_hash,
      double parent_distribution_ratio,
      eosio::name coopname, 
      eosio::name application,
      std::string title, 
      std::string description,
      std::string terms,
      std::string subject
    );
    
    // results
    [[eosio::action]]
    void updaterslt(
      eosio::name coopname,
      eosio::name application,
      eosio::name username,
      checksum256 assignment_hash,
      checksum256 result_hash
    );
    
    [[eosio::action]]
    void pushrslt(name coopname, name application, checksum256 result_hash, document2 statement);
    
    [[eosio::action]]
    void authrslt(eosio::name coopname, checksum256 result_hash, document2 decision);
    
    [[eosio::action]]
    void approverslt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 result_hash, document2 approved_statement);
    
    // конвертация
    [[eosio::action]]
    void approvecnvrt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 convert_hash, document2 approved_statement);
    
    // Конвертация согласно этапу 4 ТЗ БЛАГОРОСТ v0.1
    [[eosio::action]]
    void convtowallet(eosio::name coopname, eosio::name application, eosio::name username, checksum256 result_hash, asset amount, document2 convert_statement);
    
    [[eosio::action]]
    void convtoblagst(eosio::name coopname, eosio::name application, eosio::name username, checksum256 result_hash, asset amount, document2 convert_statement);
    
    [[eosio::action]]
    void approvecnvtw(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 convert_hash, document2 approved_statement);
    
    [[eosio::action]]
    void approvecnvtb(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 convert_hash, document2 approved_statement);
    
    [[eosio::action]]
    void createcnvrt(
      eosio::name coopname,
      eosio::name application,
      eosio::name username,
      checksum256 assignment_hash,
      checksum256 convert_hash,
      document2 convert_statement
    );
    
    [[eosio::action]]
    void startdistrbn(name coopname, name application, checksum256 assignment_hash);

    [[eosio::action]]
    void addauthor(name coopname, name application, checksum256 project_hash, name author, uint64_t shares);
    
    // Координаторы согласно ТЗ БЛАГОРОСТ v0.1 (автоматическая регистрация по referer)
    [[eosio::action]]
    void paycoordntr(name coopname, name application, checksum256 project_hash, name coordinator, asset amount);
    
    // Получение накопленных средств координатором при сдаче результата (согласно ТЗ БЛАГОРОСТ v0.1)
    [[eosio::action]]
    void claimcoordntr(name coopname, name application, checksum256 project_hash, checksum256 result_hash, name coordinator, document2 presentation);
    
    // Мастера согласно ТЗ БЛАГОРОСТ v0.1
    [[eosio::action]]
    void addmaster(name coopname, name application, checksum256 project_hash, checksum256 assignment_hash, name master, name role);
    
    [[eosio::action]]
    void setplannig(name coopname, name application, checksum256 assignment_hash, uint64_t plan_time, asset plan_expense, asset norma_hour_cost);
    
    [[eosio::action]]
    void setprojevl(name coopname, name application, checksum256 project_hash, uint64_t total_plan_time, asset total_plan_expense, asset norma_hour_cost);
    
    // Коммиты
    [[eosio::action]]
    void createcmmt(eosio::name coopname, eosio::name application, eosio::name username, checksum256 assignment_hash, checksum256 commit_hash, uint64_t contributed_hours);
    [[eosio::action]]
    void approvecmmt(eosio::name coopname, checksum256 commit_hash, document2 empty_document);
    [[eosio::action]]
    void declinecmmt(eosio::name coopname, checksum256 commit_hash, std::string reason);
    [[eosio::action]]
    void delcmmt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 commit_hash);
    
    // Долги
    [[eosio::action]]
    void createdebt(name coopname, name username, checksum256 assignment_hash, checksum256 debt_hash, asset amount, time_point_sec repaid_at, document2 statement);
    
    [[eosio::action]]
    void approvedebt(eosio::name coopname, checksum256 debt_hash, document2 approved_statement);

    [[eosio::action]]
    void debtauthcnfr(eosio::name coopname, checksum256 debt_hash, document2 decision);
    
    [[eosio::action]]
    void debtpaycnfrm(name coopname, checksum256 debt_hash);
    
    [[eosio::action]]
    void debtpaydcln(name coopname, checksum256 debt_hash, std::string reason);
    
    [[eosio::action]]
    void declinedebt(name coopname, checksum256 debt_hash, std::string reason);
    
    [[eosio::action]]
    void settledebt(name coopname);

    
    [[eosio::action]]
    void setact1(eosio::name coopname, eosio::name application, eosio::name username, checksum256 commit_hash, document2 act);    
    [[eosio::action]]
    void setact2(eosio::name coopname, eosio::name application, eosio::name username, checksum256 commit_hash, document2 act);
        
    // Регистрация
    [[eosio::action]]
    void regcontrib(eosio::name coopname, eosio::name application, eosio::name username, checksum256 project_hash, uint64_t convert_percent, eosio::asset rate_per_hour, time_point_sec created_at, document2 agreement);
    [[eosio::action]]
    void capregcontr(eosio::name coopname, uint64_t contributor_id, document2 authorization);    
    [[eosio::action]]
    void approvereg(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 project_hash, eosio::name username, document2 approved_agreement);
    
    // Инвестиции
    [[eosio::action]]
    void createinvest(name coopname, name application, name username, checksum256 project_hash, checksum256 invest_hash, asset amount, document2 statement);    
    
    [[eosio::action]]
    void capauthinvst(eosio::name coopname, checksum256 invest_hash, document2 authorization);    
    
    [[eosio::action]]
    void approveinvst(name coopname, name application, name approver, checksum256 invest_hash, document2 approved_statement);
    
    [[eosio::action]]
    void allocate(eosio::name coopname, eosio::name application, checksum256 project_hash, checksum256 assignment_hash, eosio::asset amount);
    
    [[eosio::action]]
    void diallocate(eosio::name coopname, eosio::name application, checksum256 project_hash, checksum256 assignment_hash, eosio::asset amount);
    
    [[eosio::action]]
    void approvewthd1(name coopname, name application, name approver, checksum256 withdraw_hash, document2 approved_return_statement);
        
    // Расходы
    [[eosio::action]]
    void createexpnse(eosio::name coopname, eosio::name application, checksum256 expense_hash, checksum256 assignment_hash, name creator, uint64_t fund_id, asset amount, std::string description, document2 statement);
    
    [[eosio::action]]
    void approveexpns(name coopname, name application, name approver, checksum256 expense_hash, document2 approved_statement);
    
    [[eosio::action]]
    void capauthexpns(eosio::name coopname, checksum256 expense_hash, document2 authorization);
    
    [[eosio::action]]
    void exppaycnfrm(eosio::name coopname, checksum256 expense_hash);
    

    // Членские взносы
    [[eosio::action]] void fundproj(eosio::name coopname, checksum256 project_hash, asset amount, std::string memo);
    [[eosio::action]] void refreshproj(name coopname, name application, checksum256 project_hash, name username);
    [[eosio::action]] void fundprog(eosio::name coopname, asset amount, std::string memo);
    [[eosio::action]] void refreshprog(name coopname, name application, name username);
    
    // Голосование по методу Водянова
    [[eosio::action]]
    void startvodyanov(name coopname, name application, checksum256 result_hash);
    
    [[eosio::action]]
    void submitvote(name coopname, name application, name voter, checksum256 result_hash, std::vector<std::pair<name, asset>> votes);
    
    [[eosio::action]]
    void finalvodyanov(name coopname, name application, checksum256 result_hash);
    
private:
    
  static constexpr symbol TOKEN_SYMBOL = _root_govern_symbol; ///< Символ используемого токена.
  static constexpr symbol ACCUMULATION_SYMBOL = _root_symbol; ///< Символ токена для учёта распределения.
  
  static constexpr int64_t MAX_AUTHORS = 12;
  static constexpr double COORDINATOR_PERCENT = 0.04; ///< Процент координатора согласно ТЗ БЛАГОРОСТ v0.1 (4%)
  static constexpr int64_t MAX_COORDINATOR_ACCUMULATION = 10000000; ///< Максимальная сумма накоплений координатора за инвестора (100,000 RUB в минимальных единицах)
  
  static constexpr name _intellectual = "intellectual"_n; ///< Символьное обозначение интеллектуального взноса
  static constexpr name _property = "property"_n; ///< Символьное обозначение имущественного взноса
  

  /**
    * @brief Обновляет глобальное состояние новыми значениями.
    *
    * @param gs Новое глобальное состояние.
    */
  void update_global_state(const global_state& gs);
      
  /**
    * @brief Получает текущее глобальное состояние.
    *
    * @return Текущее глобальное состояние.
    */
  global_state get_global_state(name coopname);
      
  static bonus_result calculcate_capital_amounts(const eosio::asset& spended);
  static eosio::asset calculate_capitalists_bonus_with_debts(eosio::asset generated, eosio::asset sum_debt_amount);
  
  std::optional<author> get_author(eosio::name coopname, eosio::name username, const checksum256 &project_hash);
  std::optional<creator> get_creator(eosio::name coopname, eosio::name username, const checksum256 &assignment_hash);
  std::optional<assignment> get_assignment(eosio::name coopname, const checksum256 &assignment_hash);
  std::optional<debt> get_debt(eosio::name coopname, const checksum256 &debt_hash);
  
  
  std::optional<project> get_project(eosio::name coopname, const checksum256 &project_hash);
  std::optional<project> get_master_project(eosio::name coopname);
  void validate_project_hierarchy_depth(eosio::name coopname, checksum256 project_hash);
  
  void distribute_project_membership_funds(eosio::name coopname, uint64_t project_id, asset amount, uint8_t level);
  
  int64_t get_capital_user_share_balance(eosio::name coopname, eosio::name username);
  
  std::optional<result> get_result_by_assignment_and_username(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username);
  std::optional<result> get_result(eosio::name coopname, const checksum256 &result_hash);
  
  std::optional<convert> get_convert(eosio::name coopname, const checksum256 &hash);
  
  std::optional<commit> get_commit(eosio::name coopname, const checksum256 &hash);
  std::optional<invest> get_invest(eosio::name coopname, const checksum256 &invest_hash);
  std::optional<capital_tables::result_withdraw> get_result_withdraw(eosio::name coopname, const checksum256 &hash);
  std::optional<capital_tables::project_withdraw> get_project_withdraw(eosio::name coopname, const checksum256 &hash);
  std::optional<capital_tables::program_withdraw> get_program_withdraw(eosio::name coopname, const checksum256 &hash);
  

  std::optional<expense> get_expense(eosio::name coopname, const checksum256 &hash);
  
  program get_capital_program_or_fail(eosio::name coopname);
  program get_source_program_or_fail(eosio::name coopname);
  std::optional<progwallet> get_capital_wallet(eosio::name coopname, eosio::name username);
  
  
  std::optional<contributor> get_contributor(eosio::name coopname, const checksum256 &project_hash, eosio::name username);
  std::optional<contributor> get_active_contributor_or_fail(eosio::name coopname, const checksum256 &project_hash, eosio::name username);
  
  std::optional<capital_tables::capitalist> get_capitalist(eosio::name coopname, eosio::name username);
  
  // Функции для работы с координаторами согласно ТЗ БЛАГОРОСТ v0.1
  std::optional<coordinator> get_coordinator(eosio::name coopname, const checksum256 &project_hash, eosio::name username);
  coordinator get_coordinator_or_fail(eosio::name coopname, const checksum256 &project_hash, eosio::name username, const char* msg);
  eosio::asset calculate_coordinator_base(eosio::asset creator_base, eosio::asset author_base);
  
  // Функции для отслеживания выплат координаторам (с лимитом накоплений)
  bool has_coordinator_received_payout(eosio::name coopname, eosio::name coordinator_username, eosio::name investor_username);
  eosio::asset get_coordinator_accumulated_amount(eosio::name coopname, eosio::name coordinator_username, eosio::name investor_username);
  void record_coordinator_payout(eosio::name coopname, eosio::name coordinator_username, eosio::name investor_username, checksum256 result_hash, eosio::asset total_accumulated, eosio::asset amount_claimed);
  
  // Функции для работы с мастерами согласно ТЗ БЛАГОРОСТ v0.1
  std::optional<master> get_assignment_master(eosio::name coopname, const checksum256 &assignment_hash);
  std::optional<master> get_project_master(eosio::name coopname, const checksum256 &project_hash);
  master get_assignment_master_or_fail(eosio::name coopname, const checksum256 &assignment_hash, const char* msg);
    
  // Функции для расчёта долей в ОАП согласно ТЗ БЛАГОРОСТ v0.1
  double calculate_creator_share(eosio::asset creator_base, eosio::asset creator_bonus, eosio::asset total_project_cost);
  double calculate_author_share(eosio::asset author_base, eosio::asset author_bonus, eosio::asset total_project_cost);
  double calculate_contributor_share(eosio::asset contributor_amount, eosio::asset contributors_amounts);
  
  int64_t get_capital_program_share_balance(eosio::name coopname);
  
  uint64_t count_authors_by_project(eosio::name coopname, const checksum256 &project_hash);
  
  eosio::asset get_amount_for_withdraw_from_commit(eosio::name coopname, eosio::name username, const checksum256 &hash);
  
  creauthor get_creauthor_or_fail(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username, const char* msg);
  std::optional<creauthor> get_creauthor(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username);
  result get_result_by_assignment_and_username_or_fail(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username, const char* msg);
  assignment get_assignment_or_fail(eosio::name coopname, const checksum256 &assignment_hash, const char* msg);
  
  // Функции для работы с голосованием по методу Водянова
  std::optional<capital_tables::vodyanov_distribution> get_vodyanov_distribution(eosio::name coopname, const checksum256 &result_hash);
  capital_tables::vodyanov_distribution get_vodyanov_distribution_or_fail(eosio::name coopname, const checksum256 &result_hash, const char* msg);
  std::vector<eosio::name> get_assignment_participants(eosio::name coopname, const checksum256 &assignment_hash);
  eosio::asset calculate_vodyanov_amounts(eosio::asset authors_bonus, eosio::asset creators_bonus);
  bool has_user_voted(eosio::name coopname, uint64_t distribution_id, eosio::name voter);
  void calculate_vodyanov_results(eosio::name coopname, uint64_t distribution_id);
  
};
