// capital.cpp
#include "capital.hpp"

#include "src/managment/accumulate.cpp"

#include "src/result/createresult.cpp"
#include "src/result/startdistrbn.cpp"

#include "src/investment/createinvest.cpp"
#include "src/investment/approveinvst.cpp"
#include "src/investment/capauthinvst.cpp"

#include "src/managment/init.cpp"
#include "src/refresh.cpp"

#include "src/claim/setact1.cpp"
#include "src/claim/setact2.cpp"
#include "src/claim/createclaim.cpp"
#include "src/claim/setstatement.cpp"
#include "src/claim/authorize.cpp"

// #include "src/withdraw.cpp"

#include "src/registration/capregcontr.cpp"
#include "src/registration/approvereg.cpp"
#include "src/registration/regcontrib.cpp"

#include "src/managment/createproj.cpp"
#include "src/managment/addauthor.cpp"
#include "src/managment/allocate.cpp"
#include "src/managment/wthdrcallbck.cpp"

#include "src/commit/createcmmt.cpp"
#include "src/commit/approvecmmt.cpp"

#include "src/withdraw/createwthd1.cpp"
#include "src/withdraw/capauthwthdc.cpp"
#include "src/withdraw/capauthwthdr.cpp"
#include "src/withdraw/authwithdraw.cpp"
#include "src/withdraw/approvewthd1.cpp"

#include "src/expense/approveexpns.cpp"
#include "src/expense/capauthexpns.cpp"
#include "src/expense/createexpnse.cpp"
#include "src/expense/expense_withdraw_callback.cpp"

#include <optional>


/**
 * @brief Получает расход по хэшу.
 * @param coopname Имя кооператива (scope таблицы).
 * @param hash Хэш расхода.
 * @return `std::optional<expense>` - найденное действие или `std::nullopt`, если его нет.
 */
std::optional<expense> capital::get_expense(eosio::name coopname, const checksum256 &hash) {
    expense_index expenses(_capital, coopname.value);
    auto expense_index = expenses.get_index<"byhash"_n>();

    auto itr = expense_index.find(hash);
    if (itr == expense_index.end()) {
        return std::nullopt;
    }

    return *itr;
}


/**
 * @brief Получает действие по хэшу действия.
 * @param coopname Имя кооператива (scope таблицы).
 * @param hash Хэш действия.
 * @return `std::optional<commit>` - найденное действие или `std::nullopt`, если его нет.
 */
std::optional<commit> capital::get_commit(eosio::name coopname, const checksum256 &hash) {
    commit_index commits(_capital, coopname.value);
    auto commit_index = commits.get_index<"byhash"_n>();

    auto itr = commit_index.find(hash);
    if (itr == commit_index.end()) {
        return std::nullopt;
    }

    return *itr;
}


/**
 * @brief Получает действие по хэшу действия.
 * @param coopname Имя кооператива (scope таблицы).
 * @param hash Хэш действия.
 * @return `std::optional<commit>` - найденное действие или `std::nullopt`, если его нет.
 */
eosio::asset capital::get_amount_for_withdraw_from_commit(eosio::name coopname, eosio::name username, const checksum256 &hash) {
    commit_index commits(_capital, coopname.value);
    auto commit_index = commits.get_index<"byhash"_n>();

    auto itr = commit_index.find(hash);
    eosio::check(itr != commit_index.end(), "Коммит не найден");
    eosio::check(itr -> status != "created"_n, "Коммит еще не принят");
    eosio::check(itr -> status == "approved"_n, "Коммит уже погашен");
    eosio::check(itr -> username == username, "Нельзя присвоить чужой коммит");
    
    commit_index.modify(itr, coopname, [&](auto &c){
      c.status = "withdrawed"_n; 
    });
    
    return itr -> spend;
}


/**
 * @brief Получает количество авторов проекта по его хэшу.
 * @param coopname Имя кооператива (scope таблицы).
 * @param project_hash Хэш проекта.
 * @return Количество авторов, связанных с данным проектом.
 */
uint64_t capital::count_authors_by_project(eosio::name coopname, const checksum256 &project_hash) {
    authors_index authors(_capital, coopname.value);
    auto project_index = authors.get_index<"byprojecthash"_n>();

    auto itr = project_index.lower_bound(project_hash);
    uint64_t count = 0;

    while (itr != project_index.end() && itr->by_project_hash() == project_hash) {
        ++count;
        ++itr;
    }
    return count;
};

/**
 * @brief Получает участника по имени аккаунта и проекту (project_hash).
 */
std::optional<contributor> capital::get_contributor(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    contributor_index contributors(_capital, coopname.value);
    auto project_user_index = contributors.get_index<"byprojuser"_n>();

    auto itr = project_user_index.find(combine_checksum_ids(project_hash, username));
    if (itr == project_user_index.end()) {
        return std::nullopt;
    }

    return *itr;
}

/**
 * @brief Получает участника по имени аккаунта и проекту и проверяет на активность (project_hash).
 */
std::optional<contributor> capital::get_active_contributor_or_fail(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    auto contributor = capital::get_contributor(coopname, project_hash, username);
    eosio::check(contributor.has_value(), "Создатель не подписывал договор УХД");
    eosio::check(contributor -> status == "authorized"_n, "Договор УХД с пайщиком не активен");
    return contributor;
}

program capital::get_capital_program_or_fail(eosio::name coopname) {
  auto program_id = get_program_id(_capital_program);

  auto program = get_program_or_fail(coopname, program_id);
  return program;
}


program capital::get_cofund_program_or_fail(eosio::name coopname) {
  auto program_id = get_program_id(_cofund_program);

  auto program = get_program_or_fail(coopname, program_id);
  return program;
}

std::optional<progwallet> capital::get_capital_wallet(eosio::name coopname, eosio::name username) {
  auto state = get_global_state(coopname);
  
  auto program_id = get_program_id(_capital_program);
  
  auto program = get_program_or_fail(coopname, program_id);
  
  auto capital_wallet = get_program_wallet(coopname, username, _capital_program);
  
  if (!capital_wallet.has_value()) {
    return std::nullopt;
  }
  
  return *capital_wallet;
  
}


std::optional<result_author> capital::get_result_author(eosio::name coopname, eosio::name username, const checksum256 &result_hash) {
    result_authors_index result_authors(_capital, coopname.value);
    auto result_author_index = result_authors.get_index<"byresauthor"_n>();

    uint128_t combined_id = combine_checksum_ids(result_hash, username);
    auto result_author_itr = result_author_index.find(combined_id);

    if (result_author_itr == result_author_index.end()) {
        return std::nullopt;
    }

    return *result_author_itr;
}

std::optional<author> capital::get_author(eosio::name coopname, eosio::name username, const checksum256 &project_hash) {
    authors_index authors(_capital, coopname.value);
    auto project_author_index = authors.get_index<"byprojauthor"_n>();

    uint128_t combined_id = combine_checksum_ids(project_hash, username);
    auto author_itr = project_author_index.find(combined_id);

    if (author_itr == project_author_index.end()) {
        return std::nullopt;
    }

    return *author_itr;
}

std::optional<creator> capital::get_creator(eosio::name coopname, eosio::name username, const checksum256 &result_hash) {
    creators_index creators(_capital, coopname.value);
    auto result_creator_index = creators.get_index<"byresultcrtr"_n>();

    uint128_t combined_id = combine_checksum_ids(result_hash, username);
    auto creator_itr = result_creator_index.find(combined_id);

    if (creator_itr == result_creator_index.end()) {
        return std::nullopt;
    }

    return *creator_itr;
}

std::optional<result> capital::get_result(eosio::name coopname, const checksum256 &result_hash) {
    result_index results(_capital, coopname.value);
    auto result_hash_index = results.get_index<"byhash"_n>();

    auto result_itr = result_hash_index.find(result_hash);
    if (result_itr == result_hash_index.end()) {
        return std::nullopt;
    }

    return *result_itr;
}

std::optional<project> capital::get_project(eosio::name coopname, const checksum256 &project_hash) {
    project_index projects(_capital, coopname.value);
    auto project_hash_index = projects.get_index<"byhash"_n>();

    auto project_itr = project_hash_index.find(project_hash);
    if (project_itr == project_hash_index.end()) {
        return std::nullopt;
    }

    return *project_itr;
}


std::optional<invest> capital::get_invest(eosio::name coopname, const checksum256 &invest_hash) {
    invest_index invests(_capital, coopname.value);
    auto invest_hash_index = invests.get_index<"byhash"_n>();

    auto invest_itr = invest_hash_index.find(invest_hash);
    if (invest_itr == invest_hash_index.end()) {
        return std::nullopt;
    }

    return *invest_itr;
}


std::optional<capital_tables::withdraw> capital::get_withdraw(eosio::name coopname, const checksum256 &hash) {
    capital_tables::withdraws_index withdraws(_capital, coopname.value);
    auto index = withdraws.get_index<"byhash"_n>();

    auto itr = index.find(hash);
    
    if (itr == index.end()) {
        return std::nullopt;
    }

    return *itr;
}

std::optional<claim> capital::get_claim(eosio::name coopname, const checksum256 &claim_hash) {
    claim_index claims(_capital, coopname.value);
    auto claim_hash_index = claims.get_index<"byhash"_n>();

    auto claim_itr = claim_hash_index.find(claim_hash);

    if (claim_itr == claim_hash_index.end()) {
        return std::nullopt;
    }

    return *claim_itr;
}



/**
  * @brief Обновляет глобальное состояние новыми значениями.
  *
  * @param gs Новое глобальное состояние.
  */
void capital::update_global_state(const global_state& gs){
  global_state_table global_state_inst(_self, _self.value);
  auto itr = global_state_inst.find(0);
  check(itr != global_state_inst.end(), "Global state not found");
  global_state_inst.modify(itr, _self, [&](auto& s) {
      s = gs;
  });
}
    
/**
  * @brief Получает текущее глобальное состояние.
  *
  * @return Текущее глобальное состояние.
  */
global_state capital::get_global_state(name coopname) {
    global_state_table global_state_inst(_self, _self.value);
    auto itr = global_state_inst.find(coopname.value);
    eosio::check(itr != global_state_inst.end(), "Контракт не инициализирован");
    return *itr;
}


void capital::ensure_contributor(name coopname, name username) {
  // Получаем глобальное состояние для установки reward_per_share_last
  auto gs = get_global_state(coopname);

}

//----------------------------------------------------------------------------
// calculcate_capital_amounts: для расчёта премий по формулам:
//   - creators_bonus      = spend * 0.382
//   - authors_bonus       = spend * 1.618
//   - generated           = spend + creators_bonus + authors_bonus
//   - participants_bonus  = generated * 1.618
//   - total               = generated + participants_bonus
//----------------------------------------------------------------------------
bonus_result capital::calculcate_capital_amounts(int64_t spend_amount) {
    bonus_result br{};

    // Преобразуем spend_amount в double для дальнейших расчетов
    double spend = double(spend_amount);

    // 1) creators_bonus = spend_amount * 0.382
    br.creators_bonus = int64_t(spend * 0.382);

    // 2) authors_bonus = spend_amount * 1.618
    br.authors_bonus = int64_t(spend * 1.618);

    // 3) generated = spend + creators_bonus + authors_bonus
    br.generated = int64_t(spend + br.creators_bonus + br.authors_bonus);

    // 4) participants_bonus = generated * 1.618
    br.participants_bonus = int64_t(double(br.generated) * 1.618);

    // 5) total = generated + participants_bonus
    br.total = int64_t(br.generated + br.participants_bonus);

    return br;
}
