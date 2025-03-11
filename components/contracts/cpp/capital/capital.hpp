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
    void createresult(name coopname, name application, checksum256 project_hash, checksum256 result_hash);

    [[eosio::action]]
    void refresh(name coopname, name username);

    [[eosio::action]]
    void wthdrcallbck(eosio::name coopname, eosio::name callback_type, checksum256 withdraw_hash);
  
    [[eosio::action]]
    void createwthd1(eosio::name coopname, eosio::name application, eosio::name username, checksum256 result_hash, checksum256 withdraw_hash, std::vector<checksum256> commit_hashes, document contribution_statement, document return_statement);

    [[eosio::action]]
    void capauthwthdc(eosio::name coopname, uint64_t withdraw_id, document authorization);
    [[eosio::action]]
    void capauthwthdr(eosio::name coopname, uint64_t withdraw_id, document authorization);
    [[eosio::action]]
    void authwithdraw(eosio::name coopname, checksum256 withdraw_hash);

    [[eosio::action]]
    void accumulate(name coopname, asset amount); // Добавление входящих членских взносов

    [[eosio::action]]
    void createproj (
      checksum256 project_hash,
      eosio::name coopname, 
      eosio::name application,
      std::string title, 
      std::string description,
      std::string terms,
      std::string subject
    );
    
    [[eosio::action]]
    void createclaim(name coopname, name application, name owner, checksum256 result_hash, checksum256 claim_hash);
    
    [[eosio::action]]
    void setstatement(name coopname, name application, name owner, checksum256 result_hash, document statement);
    
    [[eosio::action]]
    void authorize(eosio::name coopname, uint64_t claim_id, document decision);
    
    [[eosio::action]]
    void setact1(eosio::name coopname, eosio::name application, eosio::name owner, checksum256 claim_hash, document act);
    
    [[eosio::action]]
    void setact2(eosio::name coopname, eosio::name application, eosio::name owner, checksum256 result_hash, document act);
    
    
    [[eosio::action]]
    void startdistrbn(name coopname, name application, checksum256 result_hash);
    
    [[eosio::action]]
    void addauthor(name coopname, name application, checksum256 project_hash, name author, uint64_t shares);
    
    // Коммиты
    [[eosio::action]]
    void approvecmmt(eosio::name coopname, eosio::name application, eosio::name approver, checksum256 commit_hash, document approved_specification);
    [[eosio::action]]
    void createcmmt(eosio::name coopname, eosio::name application, eosio::name creator, checksum256 result_hash, checksum256 commit_hash, uint64_t contributed_hours, document specification);
        
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
    void capauthinvst(eosio::name coopname, uint64_t invest_id, document authorization);    
    [[eosio::action]]
    void approveinvst(name coopname, name application, name approver, checksum256 invest_hash, document approved_statement);
    
    [[eosio::action]]
    void allocate(eosio::name coopname, eosio::name application, checksum256 project_hash, checksum256 result_hash, eosio::asset amount);
    
    [[eosio::action]]
    void approvewthd1(name coopname, name application, name approver, checksum256 withdraw_hash, document approved_contribution_statement, document approved_return_statement);
    
    // Расходы
    [[eosio::action]]
    void createexpnse(eosio::name coopname, eosio::name application, checksum256 expense_hash, checksum256 result_hash, name creator, uint64_t fund_id, asset amount, std::string description, document statement);
    [[eosio::action]]
    void approveexpns(name coopname, name application, name approver, checksum256 expense_hash, document approved_statement);
    [[eosio::action]]
    void capauthexpns(eosio::name coopname, uint64_t expense_id, document authorization);
    
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
  
  static bonus_result calculcate_capital_amounts(int64_t spend_amount);
  
  std::optional<author> get_author(eosio::name coopname, eosio::name username, const checksum256 &project_hash);
  std::optional<creator> get_creator(eosio::name coopname, eosio::name username, const checksum256 &result_hash);
  std::optional<result> get_result(eosio::name coopname, const checksum256 &result_hash);
  std::optional<project> get_project(eosio::name coopname, const checksum256 &project_hash);
  std::optional<claim> get_claim(eosio::name coopname, const checksum256 &result_hash);
  std::optional<result_author> get_result_author(eosio::name coopname, eosio::name username, const checksum256 &result_hash);
  std::optional<commit> get_commit(eosio::name coopname, const checksum256 &hash);
  std::optional<invest> get_invest(eosio::name coopname, const checksum256 &invest_hash);
  std::optional<capital_tables::withdraw> get_withdraw(eosio::name coopname, const checksum256 &hash);
  
  std::optional<expense> get_expense(eosio::name coopname, const checksum256 &hash);
  
  program get_capital_program_or_fail(eosio::name coopname);
  program get_cofund_program_or_fail(eosio::name coopname);
  std::optional<progwallet> get_capital_wallet(eosio::name coopname, eosio::name username);
  
  
  std::optional<contributor> get_contributor(eosio::name coopname, const checksum256 &project_hash, eosio::name username);
  std::optional<contributor> get_active_contributor_or_fail(eosio::name coopname, const checksum256 &project_hash, eosio::name username);
  
  uint64_t count_authors_by_project(eosio::name coopname, const checksum256 &project_hash);
  
  eosio::asset get_amount_for_withdraw_from_commit(eosio::name coopname, eosio::name username, const checksum256 &hash);
  
  void expense_withdraw_callback(name coopname, checksum256 withdraw_hash);
  
  void try_finalize_withdrawal(eosio::name coopname, const capital_tables::withdraws_index::const_iterator &withdraw) {
    if (!is_document_empty(withdraw->authorized_return_statement) &&
        !is_document_empty(withdraw->authorized_contribution_statement)) {
      
      Wallet::add_blocked_funds(_capital, coopname, withdraw->username, withdraw->amount, _cofund_program);
      
      action(
        permission_level{_capital, "active"_n},
        _capital,
        "authwithdraw"_n,
        std::make_tuple(coopname, withdraw->withdraw_hash)
      ).send();
    }
  }

};
