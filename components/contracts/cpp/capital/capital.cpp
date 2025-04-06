// capital.cpp
#include "capital.hpp"

#include "src/assignment/createassign.cpp"
#include "src/assignment/startdistrbn.cpp"

#include "src/investment/createinvest.cpp"
#include "src/investment/approveinvst.cpp"
#include "src/investment/capauthinvst.cpp"

#include "src/commit/createcmmt.cpp"
#include "src/commit/approvecmmt.cpp"
#include "src/commit/declinecmmt.cpp"
#include "src/commit/delcmmt.cpp"

#include "src/debt/createdebt.cpp"
#include "src/debt/approvedebt.cpp"

#include "src/debt/debtauthcnfr.cpp"
#include "src/debt/debtpaycnfrm.cpp"
#include "src/debt/debtpaydcln.cpp"
#include "src/debt/declinedebt.cpp"
#include "src/debt/settledebt.cpp"

#include "src/result/approverslt.cpp"
#include "src/result/updaterslt.cpp"
#include "src/result/pushrslt.cpp"
#include "src/result/authrslt.cpp"
#include "src/result/setact1.cpp"
#include "src/result/setact2.cpp"

#include "src/registration/capregcontr.cpp"
#include "src/registration/approvereg.cpp"
#include "src/registration/regcontrib.cpp"

#include "src/managment/init.cpp"
#include "src/managment/createproj.cpp"
#include "src/managment/addauthor.cpp"
#include "src/managment/allocate.cpp"
#include "src/managment/diallocate.cpp"


#include "src/withdraw_from_result/createwthd1.cpp"
#include "src/withdraw_from_result/capauthwthd1.cpp"
#include "src/withdraw_from_result/approvewthd1.cpp"

#include "src/withdraw_from_project/createwthd2.cpp"
#include "src/withdraw_from_project/capauthwthd2.cpp"
#include "src/withdraw_from_project/approvewthd2.cpp"

#include "src/withdraw_from_program/createwthd3.cpp"
#include "src/withdraw_from_program/capauthwthd3.cpp"
#include "src/withdraw_from_program/approvewthd3.cpp"

#include "src/convert/approvecnvrt.cpp"
#include "src/convert/createcnvrt.cpp"

#include "src/expense/approveexpns.cpp"
#include "src/expense/capauthexpns.cpp"
// #include "src/expense/capdeclexpns.cpp"
#include "src/expense/createexpnse.cpp"
#include "src/expense/exppaycnfrm.cpp"



#include "src/fundproj/fundproj.cpp"
#include "src/fundproj/refreshproj.cpp"

#include "src/fundprog/fundprog.cpp"
#include "src/fundprog/refreshprog.cpp"

#include <optional>


void capital::validate_project_hierarchy_depth(eosio::name coopname, checksum256 project_hash) {
    uint8_t level = 0;
    project_index projects(_capital, coopname.value);
    
    auto current_project = get_project(coopname, project_hash);
    eosio::check(current_project.has_value(), "Проект не найден");

    while (current_project -> parent_project_hash != checksum256()) {
        eosio::check(level < 12, "Превышено максимальное количество уровней родительских проектов (12)");

        current_project = get_project(coopname, current_project->parent_project_hash);
        eosio::check(current_project.has_value(), "Родительский проект не найден");

        level++;
    };
};


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
    
    return itr -> spended;
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


std::optional<capital_tables::capitalist> capital::get_capitalist(eosio::name coopname, eosio::name username) {
    capital_tables::capitalist_index capitalists(_capital, coopname.value);
    
    auto itr = capitalists.find(username.value);
    if (itr == capitalists.end()) {
        return std::nullopt;
    }

    return *itr;
}



program capital::get_capital_program_or_fail(eosio::name coopname) {
  auto program_id = get_program_id(_capital_program);

  auto program = get_program_or_fail(coopname, program_id);
  return program;
}


program capital::get_source_program_or_fail(eosio::name coopname) {
  auto program_id = get_program_id(_source_program);

  auto program = get_program_or_fail(coopname, program_id);
  return program;
};

int64_t capital::get_capital_program_share_balance(eosio::name coopname) {
  auto capital_program = get_capital_program_or_fail(coopname);
  
  return capital_program.available -> amount + capital_program.blocked -> amount;
};

int64_t capital::get_capital_user_share_balance(eosio::name coopname, eosio::name username) {
  auto wallet = get_capital_wallet(coopname, username);
  eosio::check(wallet.has_value(), "Кошелёк пайщика в программе не найден");
  
  return wallet -> available.amount + wallet -> blocked -> amount;
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

std::optional<creator> capital::get_creator(eosio::name coopname, eosio::name username, const checksum256 &assignment_hash) {
    creators_index creators(_capital, coopname.value);
    auto assignment_creator_index = creators.get_index<"byassigncrtr"_n>();

    uint128_t combined_id = combine_checksum_ids(assignment_hash, username);
    auto creator_itr = assignment_creator_index.find(combined_id);

    if (creator_itr == assignment_creator_index.end()) {
        return std::nullopt;
    }

    return *creator_itr;
}

std::optional<assignment> capital::get_assignment(eosio::name coopname, const checksum256 &assignment_hash) {
    assignment_index assignments(_capital, coopname.value);
    auto assignment_hash_index = assignments.get_index<"byhash"_n>();

    auto assignment_itr = assignment_hash_index.find(assignment_hash);
    if (assignment_itr == assignment_hash_index.end()) {
        return std::nullopt;
    }

    return *assignment_itr;
}


std::optional<debt> capital::get_debt(eosio::name coopname, const checksum256 &debt_hash) {
    debts_index debts(_capital, coopname.value);
    auto hash_index = debts.get_index<"bydebthash"_n>();

    auto itr = hash_index.find(debt_hash);
    if (itr == hash_index.end()) {
        return std::nullopt;
    }

    return *itr;
}

assignment capital::get_assignment_or_fail(eosio::name coopname, const checksum256 &assignment_hash, const char* msg) {
    auto maybe_assignment = get_assignment(coopname, assignment_hash);
    eosio::check(maybe_assignment.has_value(), msg);
    return *maybe_assignment;
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


std::optional<capital_tables::result_withdraw> capital::get_result_withdraw(eosio::name coopname, const checksum256 &hash) {
    capital_tables::result_withdraws_index result_withdraws(_capital, coopname.value);
    auto index = result_withdraws.get_index<"byhash"_n>();

    auto itr = index.find(hash);
    
    if (itr == index.end()) {
        return std::nullopt;
    }

    return *itr;
}


std::optional<capital_tables::program_withdraw> capital::get_program_withdraw(eosio::name coopname, const checksum256 &hash) {
    capital_tables::program_withdraws_index program_withdraws(_capital, coopname.value);
    auto index = program_withdraws.get_index<"byhash"_n>();

    auto itr = index.find(hash);
    
    if (itr == index.end()) {
        return std::nullopt;
    }

    return *itr;
}


std::optional<capital_tables::project_withdraw> capital::get_project_withdraw(eosio::name coopname, const checksum256 &hash) {
    capital_tables::project_withdraws_index project_withdraws(_capital, coopname.value);
    auto index = project_withdraws.get_index<"byhash"_n>();

    auto itr = index.find(hash);
    
    if (itr == index.end()) {
        return std::nullopt;
    }

    return *itr;
}


std::optional<result> capital::get_result(eosio::name coopname, const checksum256 &result_hash) {
    result_index results(_capital, coopname.value);
    auto idx = results.get_index<"byhash"_n>();
    
    auto it = idx.find(result_hash);
    if (it == idx.end()) {
        return std::nullopt;
    }
    return *it;
}

std::optional<result> capital::get_result_by_assignment_and_username(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username) {
    result_index results(_capital, coopname.value);
    auto idx = results.get_index<"byresuser"_n>();
    auto rkey = combine_checksum_ids(assignment_hash, username);

    auto it = idx.find(rkey);
    if (it == idx.end()) {
        return std::nullopt;
    }
    return *it;
}

std::optional<convert> capital::get_convert(eosio::name coopname, const checksum256 &hash) {
    convert_index converts(_capital, coopname.value);
    auto index = converts.get_index<"byhash"_n>();

    auto itr = index.find(hash);
    
    if (itr == index.end()) {
        return std::nullopt;
    }

    return *itr;
}


result capital::get_result_by_assignment_and_username_or_fail(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username, const char* msg) {
    auto c = get_result_by_assignment_and_username(coopname, assignment_hash, username);
    eosio::check(c.has_value(), msg);
    return *c;
}


std::optional<creauthor> capital::get_creauthor(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username) {
    creauthor_index ractors(_capital, coopname.value);
    auto idx  = ractors.get_index<"byresuser"_n>();
    auto rkey = combine_checksum_ids(assignment_hash, username);

    auto it = idx.find(rkey);
    if (it == idx.end()) {
        return std::nullopt;
    }
    return *it;
}

creauthor capital::get_creauthor_or_fail(eosio::name coopname, const checksum256 &assignment_hash, eosio::name username, const char* msg) {
    auto maybe_creauthor = get_creauthor(coopname, assignment_hash, username);
    eosio::check(maybe_creauthor.has_value(), msg);
    return *maybe_creauthor;
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
//   - creators_bonus      = spended * 0.382
//   - authors_bonus       = spended * 1.618
//   - generated           = spended + creators_bonus + authors_bonus
//   - capitalists_bonus  = generated * 1.618
//   - total               = generated + capitalists_bonus
//----------------------------------------------------------------------------
bonus_result capital::calculcate_capital_amounts(int64_t spended_amount) {
    bonus_result br{};

    // Преобразуем spended_amount в double для дальнейших расчетов
    double spended = double(spended_amount);

    // 1) creators_bonus = spended_amount * 0.382
    br.creators_bonus = int64_t(spended * 0.382);

    // 2) authors_bonus = spended_amount * 1.618
    br.authors_bonus = int64_t(spended * 1.618);

    // 3) generated = spended + creators_bonus + authors_bonus
    br.generated = int64_t(spended + br.creators_bonus + br.authors_bonus);

    // 4) capitalists_bonus = generated * 1.618
    br.capitalists_bonus = int64_t(double(br.generated) * 1.618);

    // 5) total = generated + capitalists_bonus
    br.total = int64_t(br.generated + br.capitalists_bonus);

    return br;
}
