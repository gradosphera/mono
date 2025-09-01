// capital.hpp

#pragma once

#include <cstdint>



/**
\defgroup public_capital Контракт CAPITAL

*/

/**
\defgroup public_capital_processes Процессы
\ingroup public_capital
*/

/**
\defgroup public_capital_actions Действия
\ingroup public_capital
*/

/**
\defgroup public_capital_tables Таблицы
\ingroup public_capital
*/

/**
\defgroup public_capital_consts Константы
\ingroup public_capital
*/


/**
 * Коэффициенты бизнес-логики (не управляются конфигом)
 * @ingroup public_consts
 * @ingroup public_capital_consts

 * @{
 */
const double CREATORS_BONUS_COEFFICIENT = 1; ///< Коэффициент премий создателей от своей себестоимости (100%)
const double AUTHOR_BASE_COEFFICIENT = 0.618; ///< Коэффициент авторской себестоимости от себестоимости создателя (61.8%)
const double AUTHOR_BONUS_COEFFICIENT = 1;    ///< Коэффициент премий авторов от своей себестоимости (100%)
const double CONTRIBUTORS_BONUS_COEFFICIENT = 1.618; ///< Коэффициент премий вкладчиков от себестоимостей создателей, авторов и координаторов (161.8%)
const uint32_t MAX_PROJECT_AUTHORS = 12; ///< Максимальное количество авторов в проекте
/** @} */

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
     * @brief Устанавливает или обновляет конфигурацию контракта для кооператива.
     * \ingroup public_actions
     */
    [[eosio::action]]
    void setconfig(name coopname, Capital::config config);

    // Создать проект
    [[eosio::action]]
    void createproj (
      eosio::name coopname, 
      checksum256 project_hash,
      checksum256 parent_hash,
      std::string title, 
      std::string description,
      std::string meta,
      bool can_convert_to_project
    );
    
    // Открыть проект на приём инвестиций
    [[eosio::action]]
    void openproject(name coopname, checksum256 project_hash);
    
    // Запустить проект на приём коммитов
    [[eosio::action]]
    void startproject(name coopname, checksum256 project_hash);
    
    // Завершить проект и начать голосование
    [[eosio::action]]
    void startvoting(name coopname, checksum256 project_hash);
    
    // Завершить голосование
    [[eosio::action]]
    void cmpltvoting(name coopname, checksum256 project_hash);

    // Подсчитать результаты голосования для участника
    [[eosio::action]]
    void calcvotes(name coopname, name username, checksum256 project_hash);
    
    // Проголосовать по методу Водянова
    [[eosio::action]]
    void submitvote(name coopname, name voter, checksum256 project_hash, std::vector<Capital::vote_input> votes);
    
    // Удалить проект
    [[eosio::action]]
    void delproject(name coopname, checksum256 project_hash);
    
    // Конвертация сегмента
    [[eosio::action]]
    void convertsegm(eosio::name coopname, eosio::name username, checksum256 project_hash, checksum256 convert_hash, asset wallet_amount, asset capital_amount, asset project_amount, document2 convert_statement);

    // Возврат из проекта    
    [[eosio::action]]
    void createwthd2(name coopname, name username, checksum256 project_hash, checksum256 withdraw_hash, asset amount, document2 return_statement);
    
    [[eosio::action]]
    void capauthwthd2(eosio::name coopname, checksum256 withdraw_hash, document2 authorization);
    
    [[eosio::action]]
    void capdeclwthd2(name coopname, checksum256 withdraw_hash, std::string reason);
    
    [[eosio::action]]
    void approvewthd2(name coopname, name approver, checksum256 withdraw_hash, document2 approved_return_statement);

    // Возврат из программы
    [[eosio::action]]
    void createwthd3(name coopname, name username, checksum256 withdraw_hash, asset amount, document2 return_statement);
    
    [[eosio::action]]
    void capauthwthd3(eosio::name coopname, checksum256 withdraw_hash, document2 authorization);
    
    [[eosio::action]]
    void approvewthd3(name coopname, name approver, checksum256 withdraw_hash, document2 approved_return_statement);

    [[eosio::action]]
    void capdeclwthd3(name coopname, checksum256 withdraw_hash, std::string reason);
    
    // results
    [[eosio::action]]
    void pushrslt(name coopname, name username, checksum256 project_hash, checksum256 result_hash, 
                  eosio::asset contribution_amount, eosio::asset debt_amount, document2 statement, std::vector<checksum256> debt_hashes);
    
    [[eosio::action]]
    void authrslt(eosio::name coopname, checksum256 result_hash, document2 decision);
    
    [[eosio::action]]
    void approverslt(eosio::name coopname, checksum256 result_hash, document2 approved_statement);
    
    [[eosio::action]]
    void declrslt(eosio::name coopname, checksum256 result_hash, std::string reason);
    
    [[eosio::action]]
    void signact1(eosio::name coopname, eosio::name username, checksum256 result_hash, document2 act);
    
    [[eosio::action]]
    void signact2(eosio::name coopname, eosio::name chairman, checksum256 result_hash, document2 act);
    
    // конвертация
    
    [[eosio::action]]
    void addauthor(name coopname, checksum256 project_hash, name author);
    
    // Коммиты
    [[eosio::action]]
    void createcmmt(eosio::name coopname, eosio::name username, checksum256 project_hash, checksum256 commit_hash, uint64_t creator_hours);
    [[eosio::action]]
    void approvecmmt(eosio::name coopname, eosio::name master, checksum256 commit_hash);
    [[eosio::action]]
    void declinecmmt(eosio::name coopname, eosio::name master, checksum256 commit_hash, std::string reason);
    
    // Проектные имущественные взносы
    [[eosio::action]]
    void createpjprp(eosio::name coopname, eosio::name username, checksum256 project_hash, checksum256 property_hash, eosio::asset property_amount, std::string property_description);
    [[eosio::action]]
    void approvepjprp(eosio::name coopname, checksum256 property_hash, document2 empty_document);
    [[eosio::action]]
    void declinepjprp(eosio::name coopname, checksum256 property_hash, std::string reason);
    
    // Программные имущественные взносы
    [[eosio::action]]
    void createpgprp(eosio::name coopname, eosio::name username, checksum256 property_hash, eosio::asset property_amount, std::string property_description, document2 statement);
    [[eosio::action]]
    void approvepgprp(eosio::name coopname, checksum256 property_hash, document2 approved_statement);
    [[eosio::action]]
    void declinepgprp(eosio::name coopname, checksum256 property_hash, std::string reason);
    [[eosio::action]]
    void authpgprp(eosio::name coopname, checksum256 property_hash, document2 decision);
    [[eosio::action]]
    void act1pgprp(eosio::name coopname, eosio::name username, checksum256 property_hash, document2 act);
    [[eosio::action]]
    void act2pgprp(eosio::name coopname, eosio::name username, checksum256 property_hash, document2 act);
    
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
    void settledebt(name coopname, name username, eosio::asset amount, document2 statement);

    // Регистрация
    [[eosio::action]]
    void regcontrib(eosio::name coopname, eosio::name username, checksum256 contributor_hash, eosio::asset rate_per_hour, bool is_external_contract, document2 contract);
    [[eosio::action]]
    void approvereg(eosio::name coopname, checksum256 contributor_hash, document2 contract);
    [[eosio::action]]
    void declinereg(eosio::name coopname, checksum256 contributor_hash, std::string reason);
    
    // Импорт вкладчиков
    [[eosio::action]]
    void importcontrib(eosio::name coopname, eosio::name username, checksum256 contributor_hash, eosio::asset contribution_amount, std::string memo);

    // Приложения к договору УХД
    [[eosio::action]]
    void signappndx(eosio::name coopname, eosio::name username, checksum256 project_hash, checksum256 appendix_hash, document2 document);
    [[eosio::action]]
    void apprvappndx(eosio::name coopname, checksum256 appendix_hash, document2 approved_document);
    [[eosio::action]]
    void dclineappndx(eosio::name coopname, checksum256 appendix_hash, std::string reason);
    
    // Инвестиции
    [[eosio::action]]
    void createinvest(name coopname, name username, checksum256 project_hash, checksum256 invest_hash, asset amount, document2 statement);    
    
    [[eosio::action]]
    void approveinvst(eosio::name coopname, checksum256 invest_hash, document2 approved_statement);
    
    [[eosio::action]]
    void declineinvst(eosio::name coopname, checksum256 invest_hash, document2 decline_statement);
    
    [[eosio::action]]
    void returnunused(name coopname, checksum256 project_hash, name username);
    
    // Программные инвестиции
    [[eosio::action]]
    void createpinv(name coopname, name username, checksum256 invest_hash, asset amount, document2 statement);
    
    [[eosio::action]]
    void apprvpinv(eosio::name coopname, checksum256 invest_hash, document2 approved_statement);
    
    [[eosio::action]]
    void declpinv(eosio::name coopname, checksum256 invest_hash, document2 declined_statement);
    
    // Аллокация программных инвестиций
    [[eosio::action]]
    void allocate(eosio::name coopname, checksum256 project_hash, eosio::asset amount);
    
    [[eosio::action]]
    void diallocate(eosio::name coopname, checksum256 project_hash);
    
    
    // Расходы
    [[eosio::action]]
    void createexpnse(eosio::name coopname, checksum256 expense_hash, checksum256 project_hash, name creator, asset amount, std::string description, document2 statement);
    
    [[eosio::action]]
    void approveexpns(name coopname, name approver, checksum256 expense_hash, document2 approved_statement);
    
    [[eosio::action]]
    void capauthexpns(eosio::name coopname, checksum256 expense_hash, document2 authorization);
    
    [[eosio::action]]
    void capdeclexpns(eosio::name coopname, checksum256 expense_hash);
    
    [[eosio::action]]
    void exppaycnfrm(eosio::name coopname, checksum256 expense_hash);
    
    // Членские взносы
    [[eosio::action]] void fundproj(eosio::name coopname, checksum256 project_hash, asset amount, std::string memo);
    [[eosio::action]] void refreshproj(name coopname, checksum256 project_hash, name username);
    [[eosio::action]] void fundprog(eosio::name coopname, asset amount, std::string memo);
    [[eosio::action]] void refreshprog(name coopname, name username);
    
    // Планирование
    [[eosio::action]] void setmaster(name coopname, checksum256 project_hash, name master);
    [[eosio::action]] void setplan(name coopname, name master, checksum256 project_hash, uint64_t plan_creators_hours, asset plan_expenses, asset plan_hour_cost);
    [[eosio::action]] void expandexpnss(name coopname, checksum256 project_hash, asset additional_expenses);
    
    // CRPS
    [[eosio::action]] void rfrshsegment(name coopname, checksum256 project_hash, name username);

    // Кошельки проектов
    
    [[eosio::action]] void addcontrib(name coopname, checksum256 project_hash, name username);
    
};
