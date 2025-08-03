// capital.hpp

#pragma once

#include <cstdint>

// Константы
const double COORDINATOR_PERCENT = 0.04; ///< Процент координатора (4%)
const uint32_t THIRTY_DAYS_IN_SECONDS = 2592000;
const uint32_t MAX_PROJECT_AUTHORS = 12;
const uint32_t VOTING_PERIOD_IN_DAYS = 7; ///< Период голосования (7 дней)
const double AUTHORS_VOTING_PERCENT = 38.2; ///< Процент премий авторов для голосования
const double CREATORS_VOTING_PERCENT = 38.2; ///< Процент премий создателей для голосования

#include <eosio/eosio.hpp>
#include <eosio/asset.hpp>
#include "../lib/common.hpp"
#include "domain/index.hpp"


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

    // Создать проект
    [[eosio::action]]
    void createproj (
      eosio::name coopname, 
      checksum256 project_hash,
      checksum256 parent_project_hash,
      double parent_distribution_ratio,
      std::string title, 
      std::string description,
      std::string meta
    );
    
    // Открыть проект на приём инвестиций
    [[eosio::action]]
    void openproject(name coopname, checksum256 project_hash);
    
    // Запустить проект на приём коммитов
    [[eosio::action]]
    void startproject(name coopname, checksum256 project_hash);
    
    // Завершить проект и начать голосование
    [[eosio::action]]
    void cmpltproject(name coopname, checksum256 project_hash);
    
    // Завершить голосование
    [[eosio::action]]
    void cmpltvoting(name coopname, checksum256 project_hash);
    
    // Закрыть проект
    [[eosio::action]]
    void closeproject(name coopname, checksum256 project_hash);
    
    // Удалить проект
    [[eosio::action]]
    void delproject(name coopname, checksum256 project_hash);
    
    //Возврат из результата  
    [[eosio::action]]
    void createwthd1(eosio::name coopname, eosio::name application, eosio::name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document2 return_statement);

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

    
    // results
    [[eosio::action]]
    void updaterslt(
      eosio::name coopname,
      eosio::name application,
      eosio::name username,
      checksum256 project_hash,
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
    
    [[eosio::action]]
    void createcnvrt(
      eosio::name coopname,
      eosio::name application,
      eosio::name username,
      checksum256 project_hash,
      checksum256 convert_hash,
      document2 convert_statement
    );
    
    [[eosio::action]]
    void addauthor(name coopname, name application, checksum256 project_hash, name author, uint64_t shares);
    
    // Коммиты
    [[eosio::action]]
    void createcmmt(eosio::name coopname, eosio::name application, eosio::name username, checksum256 project_hash, checksum256 commit_hash, uint64_t creator_hours);
    [[eosio::action]]
    void approvecmmt(eosio::name coopname, checksum256 commit_hash, document2 empty_document);
    [[eosio::action]]
    void declinecmmt(eosio::name coopname, checksum256 commit_hash, std::string reason);
    
    // Долги
    [[eosio::action]]
    void createdebt(name coopname, name username, checksum256 project_hash, checksum256 debt_hash, asset amount, time_point_sec repaid_at, document2 statement);
    
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
    void regcontrib(eosio::name coopname, eosio::name application, eosio::name username, checksum256 contributor_hash, uint64_t convert_percent, eosio::asset rate_per_hour, bool is_external_contract, document2 contract);
    [[eosio::action]]
    void approvereg(eosio::name coopname, checksum256 contributor_hash, document2 contract);
    [[eosio::action]]
    void declinereg(eosio::name coopname, checksum256 contributor_hash, std::string reason);
    
    // Приложения к договору УХД
    [[eosio::action]]
    void signappndx(eosio::name coopname, eosio::name application, eosio::name username, checksum256 project_hash, checksum256 appendix_hash, document2 document);
    [[eosio::action]]
    void apprvappndx(eosio::name coopname, checksum256 appendix_hash, document2 approved_document);
    [[eosio::action]]
    void dclineappndx(eosio::name coopname, checksum256 appendix_hash, std::string reason);
    
    // Инвестиции
    [[eosio::action]]
    void createinvest(name coopname, name application, name username, checksum256 project_hash, checksum256 invest_hash, asset amount, document2 statement);    
    
    [[eosio::action]]
    void approveinvst(eosio::name coopname, checksum256 invest_hash, document2 approved_statement);
    
    [[eosio::action]]
    void declineinvst(eosio::name coopname, checksum256 invest_hash, document2 decline_statement);
    
    // [[eosio::action]]
    // void allocate(eosio::name coopname, eosio::name application, checksum256 project_hash, eosio::asset amount);
    
    // [[eosio::action]]
    // void diallocate(eosio::name coopname, eosio::name application, checksum256 project_hash, eosio::asset amount);
    
    [[eosio::action]]
    void approvewthd1(name coopname, name application, name approver, checksum256 withdraw_hash, document2 approved_return_statement);
        
    // Расходы
    [[eosio::action]]
    void createexpnse(eosio::name coopname, eosio::name application, checksum256 expense_hash, checksum256 project_hash, name creator, uint64_t fund_id, asset amount, std::string description, document2 statement);
    
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
    
    // Планирование
    [[eosio::action]] void setmaster(name coopname, checksum256 project_hash, name master);
    [[eosio::action]] void setplan(name coopname, checksum256 project_hash, uint64_t plan_creators_hours, asset plan_expenses, asset plan_hour_cost);
    
    // CRPS
    [[eosio::action]] void rfrshsegment(name coopname, checksum256 project_hash, name username);

    [[eosio::action]] void addcontrib(name coopname, checksum256 project_hash, name username);
    
  };
