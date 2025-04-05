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
    void createresult(name coopname, name application, checksum256 project_hash, checksum256 result_hash, eosio::name assignee, std::string assignment);

    //Возврат из результата  
    [[eosio::action]]
    void createwthd1(eosio::name coopname, eosio::name application, eosio::name username, checksum256 result_hash, checksum256 withdraw_hash, asset amount, document return_statement);

    [[eosio::action]]
    void capauthwthd1(eosio::name coopname, checksum256 withdraw_hash, document authorization);
    
    // Возврат из проекта    
    [[eosio::action]]
    void createwthd2(name coopname, name application, name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document return_statement);
    
    [[eosio::action]]
    void capauthwthd2(eosio::name coopname, checksum256 withdraw_hash, document authorization);
    
    [[eosio::action]]
    void approvewthd2(name coopname, name application, name approver, checksum256 withdraw_hash, document approved_return_statement);

    // Возврат из программы
    [[eosio::action]]
    void createwthd3(name coopname, name application, name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document return_statement);
    
    [[eosio::action]]
    void capauthwthd3(eosio::name coopname, checksum256 withdraw_hash, document authorization);
    
    [[eosio::action]]
    void approvewthd3(name coopname, name application, name approver, checksum256 withdraw_hash, document approved_return_statement);


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
    
    // claims
    [[eosio::action]]
    void createclaim(
      eosio::name coopname,
      eosio::name application,
      eosio::name username,
      checksum256 result_hash,
      checksum256 claim_hash
    );
    
    [[eosio::action]]
    void claimnow(name coopname, name application, name username, checksum256 claim_hash, document statement);
    
    [[eosio::action]]
    void capauthclaim(eosio::name coopname, checksum256 claim_hash, document decision);
    
    [[eosio::action]]
    void approveclaim(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 claim_hash, document approved_statement);
    
    // конвертация
    [[eosio::action]]
    void approvecnvrt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 convert_hash, document approved_statement);
    
    [[eosio::action]]
    void createcnvrt(
      eosio::name coopname,
      eosio::name application,
      eosio::name username,
      checksum256 result_hash,
      checksum256 convert_hash,
      document convert_statement
    );
    
    [[eosio::action]]
    void startdistrbn(name coopname, name application, checksum256 result_hash);

    [[eosio::action]]
    void addauthor(name coopname, name application, checksum256 project_hash, name author, uint64_t shares);
    
    // Коммиты
    [[eosio::action]]
    void createcmmt(eosio::name coopname, eosio::name application, eosio::name username, checksum256 result_hash, checksum256 commit_hash, uint64_t contributed_hours);
    [[eosio::action]]
    void approvecmmt(eosio::name coopname, checksum256 commit_hash, document empty_document);
    [[eosio::action]]
    void declinecmmt(eosio::name coopname, checksum256 commit_hash, std::string reason);
    [[eosio::action]]
    void delcmmt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 commit_hash);
    
    // Долги
    [[eosio::action]]
    void createdebt(name coopname, name username, checksum256 result_hash, checksum256 debt_hash, asset amount, time_point_sec repaid_at, document statement);
    
    [[eosio::action]]
    void approvedebt(eosio::name coopname, checksum256 debt_hash, document approved_statement);

    [[eosio::action]]
    void debtauthcnfr(eosio::name coopname, checksum256 debt_hash, document decision);
    
    [[eosio::action]]
    void debtpaycnfrm(name coopname, checksum256 debt_hash);
    
    [[eosio::action]]
    void debtpaydcln(name coopname, checksum256 debt_hash, std::string reason);
    
    [[eosio::action]]
    void declinedebt(name coopname, checksum256 debt_hash, std::string reason);
    
    [[eosio::action]]
    void settledebt(name coopname);

    
    [[eosio::action]]
    void setact1(eosio::name coopname, eosio::name application, eosio::name username, checksum256 commit_hash, document act);    
    [[eosio::action]]
    void setact2(eosio::name coopname, eosio::name application, eosio::name username, checksum256 commit_hash, document act);
    [[eosio::action]]
    void capauthcmmt(eosio::name coopname, checksum256 commit_hash, document authorization);
        
    // Регистрация
    [[eosio::action]]
    void regcontrib(eosio::name coopname, eosio::name application, eosio::name username, checksum256 project_hash, uint64_t convert_percent, eosio::asset rate_per_hour, time_point_sec created_at, document agreement);
    [[eosio::action]]
    void capregcontr(eosio::name coopname, uint64_t contributor_id, document authorization);    
    [[eosio::action]]
    void approvereg(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 project_hash, eosio::name username, document approved_agreement);
    
    // Инвестиции
    [[eosio::action]]
    void createinvest(name coopname, name application, name username, checksum256 project_hash, checksum256 invest_hash, asset amount, document statement);    
    
    [[eosio::action]]
    void capauthinvst(eosio::name coopname, checksum256 invest_hash, document authorization);    
    
    [[eosio::action]]
    void approveinvst(name coopname, name application, name approver, checksum256 invest_hash, document approved_statement);
    
    [[eosio::action]]
    void allocate(eosio::name coopname, eosio::name application, checksum256 project_hash, checksum256 result_hash, eosio::asset amount);
    
    [[eosio::action]]
    void diallocate(eosio::name coopname, eosio::name application, checksum256 project_hash, checksum256 result_hash, eosio::asset amount);
    
    [[eosio::action]]
    void approvewthd1(name coopname, name application, name approver, checksum256 withdraw_hash, document approved_return_statement);
        
    // Расходы
    [[eosio::action]]
    void createexpnse(eosio::name coopname, eosio::name application, checksum256 expense_hash, checksum256 result_hash, name creator, uint64_t fund_id, asset amount, std::string description, document statement);
    
    [[eosio::action]]
    void approveexpns(name coopname, name application, name approver, checksum256 expense_hash, document approved_statement);
    
    [[eosio::action]]
    void capauthexpns(eosio::name coopname, checksum256 expense_hash, document authorization);
    
    [[eosio::action]]
    void exppaycnfrm(eosio::name coopname, checksum256 expense_hash);
    

    // Членские взносы
    [[eosio::action]] void fundproj(eosio::name coopname, checksum256 project_hash, asset amount, std::string memo);
    [[eosio::action]] void refreshproj(name coopname, name application, checksum256 project_hash, name username);
    [[eosio::action]] void fundprog(eosio::name coopname, asset amount, std::string memo);
    [[eosio::action]] void refreshprog(name coopname, name application, name username);
    
private:
    
  static constexpr symbol TOKEN_SYMBOL = _root_govern_symbol; ///< Символ используемого токена.
  static constexpr symbol ACCUMULATION_SYMBOL = _root_symbol; ///< Символ токена для учёта распределения.
  
  static constexpr int64_t MAX_AUTHORS = 12;
  
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
    
  void ensure_contributor(name coopname, name username);
  
  static bonus_result calculcate_capital_amounts(int64_t spended_amount);
  
  std::optional<author> get_author(eosio::name coopname, eosio::name username, const checksum256 &project_hash);
  std::optional<creator> get_creator(eosio::name coopname, eosio::name username, const checksum256 &result_hash);
  std::optional<result> get_result(eosio::name coopname, const checksum256 &result_hash);
  std::optional<debt> get_debt(eosio::name coopname, const checksum256 &debt_hash);
  
  
  std::optional<project> get_project(eosio::name coopname, const checksum256 &project_hash);
  std::optional<project> get_master_project(eosio::name coopname);
  void validate_project_hierarchy_depth(eosio::name coopname, checksum256 project_hash);
  
  void distribute_project_membership_funds(eosio::name coopname, uint64_t project_id, asset amount, uint8_t level);
  
  int64_t get_capital_user_share_balance(eosio::name coopname, eosio::name username);
  
  std::optional<claim> get_claim_by_result_and_username(eosio::name coopname, const checksum256 &result_hash, eosio::name username);
  std::optional<claim> get_claim(eosio::name coopname, const checksum256 &claim_hash);
  
  std::optional<convert> get_convert(eosio::name coopname, const checksum256 &hash);
  
  std::optional<result_author> get_result_author(eosio::name coopname, eosio::name username, const checksum256 &result_hash);
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
  
  int64_t get_capital_program_share_balance(eosio::name coopname);
  
  uint64_t count_authors_by_project(eosio::name coopname, const checksum256 &project_hash);
  
  eosio::asset get_amount_for_withdraw_from_commit(eosio::name coopname, eosio::name username, const checksum256 &hash);
  
  resactor get_resactor_or_fail(eosio::name coopname, const checksum256 &result_hash, eosio::name username, const char* msg);
  std::optional<resactor> get_resactor(eosio::name coopname, const checksum256 &result_hash, eosio::name username);
  claim get_claim_by_result_and_username_or_fail(eosio::name coopname, const checksum256 &result_hash, eosio::name username, const char* msg);
  result get_result_or_fail(eosio::name coopname, const checksum256 &result_hash, const char* msg);
  
};
