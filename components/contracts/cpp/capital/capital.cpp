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
#include "src/managment/paycoordntr.cpp"
#include "src/managment/claimcoordntr.cpp"
#include "src/managment/addmaster.cpp"
#include "src/managment/setplannig.cpp"
#include "src/managment/setprojevl.cpp"
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
#include "src/convert/convtowallet.cpp"
#include "src/convert/convtoblagst.cpp"

#include "src/expense/approveexpns.cpp"
#include "src/expense/capauthexpns.cpp"
// #include "src/expense/capdeclexpns.cpp"
#include "src/expense/createexpnse.cpp"
#include "src/expense/exppaycnfrm.cpp"



#include "src/fundproj/fundproj.cpp"
#include "src/fundproj/refreshproj.cpp"

#include "src/fundprog/fundprog.cpp"
#include "src/fundprog/refreshprog.cpp"

#include "src/vodyanov/startvodyanov.cpp"
#include "src/vodyanov/submitvote.cpp"
#include "src/vodyanov/finalvodyanov.cpp"

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
    creauthor_index creathors(_capital, coopname.value);
    auto idx  = creathors.get_index<"byresuser"_n>();
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


//----------------------------------------------------------------------------
// calculcate_capital_amounts: для расчёта премий:
//   - creator_base_fact = spended (фактически потраченное время * ставка)
//   - author_base_fact = 61.8% * creator_base_fact  
//   - creators_bonus = 100% * creator_base_fact
//   - authors_bonus = 100% * author_base_fact
//   - 68.2% от премий идет напрямую получателям
//   - 31.8% от премий идет в голосование по методу Водянова среди авторов и создателей
//   - generated = creator_base + creators_bonus + author_base + authors_bonus
//   - capitalists_bonus рассчитывается отдельно с учётом долгов
//   - total = generated + capitalists_bonus
//----------------------------------------------------------------------------
bonus_result capital::calculcate_capital_amounts(const eosio::asset& spended) {
    bonus_result br;

    eosio::symbol sym = spended.symbol;
    
    // По ТЗ: creator_base_fact = фактически потраченное время * ставка
    br.creator_base = spended;
    
    // По ТЗ: author_base_fact = 61.8% * creator_base_fact
    br.author_base = eosio::asset(int64_t(static_cast<double>(spended.amount) * 0.618), sym);
    
    // По ТЗ: creators_bonus = 100% * creator_base_fact
    br.creators_bonus = spended;
    
    // По ТЗ: authors_bonus = 100% * author_base_fact  
    br.authors_bonus = br.author_base;
    
    // Новая логика распределения по методу Водянова:
    // 68.2% от авторских премий распределяются среди авторов поровну
    br.authors_direct_bonus = eosio::asset(int64_t(static_cast<double>(br.authors_bonus.amount) * 0.682), sym);
    
    // 31.8% от авторских премий идет в голосование по методу Водянова
    br.authors_vodyanov_bonus = eosio::asset(br.authors_bonus.amount - br.authors_direct_bonus.amount, sym);
    
    // 68.2% от создательских премий идет создателю напрямую  
    br.creators_direct_bonus = eosio::asset(int64_t(static_cast<double>(br.creators_bonus.amount) * 0.682), sym);
    
    // 31.8% от создательских премий идет в голосование по методу Водянова
    br.creators_vodyanov_bonus = eosio::asset(br.creators_bonus.amount - br.creators_direct_bonus.amount, sym);
    
    // Общая сумма для распределения по методу Водянова
    br.total_vodyanov_amount = eosio::asset(
        br.authors_vodyanov_bonus.amount + br.creators_vodyanov_bonus.amount, 
        sym
    );
    
    // По ТЗ: generated = creator_base + creators_bonus + author_base + authors_bonus
    br.generated = eosio::asset(
        br.creator_base.amount + 
        br.creators_bonus.amount + 
        br.author_base.amount + 
        br.authors_bonus.amount, 
        sym
    );
    
    // ВНИМАНИЕ: capitalists_bonus рассчитывается отдельно в зависимости от контекста
    // с учётом формулы: contributors_bonus = (generated - sum_debt_amount) * 1.618
    br.capitalists_bonus = eosio::asset(0, sym);
    
    // total будет рассчитан после установки capitalists_bonus
    br.total = br.generated;

    return br;
}

// Рассчитывает capitalists_bonus согласно ТЗ: contributors_bonus = (generated - sum_debt_amount) * 1.618
eosio::asset capital::calculate_capitalists_bonus_with_debts(eosio::asset generated, eosio::asset sum_debt_amount) {
    eosio::check(generated >= sum_debt_amount, "Сумма долгов не может превышать сумму генерации");
    
    double net_generated = static_cast<double>(generated.amount - sum_debt_amount.amount);
    eosio::asset capitalists_bonus = eosio::asset(
        int64_t(net_generated * 1.618), 
        generated.symbol
    );
    
    return capitalists_bonus;
}

// Функции для работы с координаторами согласно ТЗ БЛАГОРОСТ v0.1

std::optional<coordinator> capital::get_coordinator(eosio::name coopname, const checksum256 &project_hash, eosio::name username) {
    coordinator_index coordinators(_capital, coopname.value);
    auto project_coordinator_index = coordinators.get_index<"byprojcoord"_n>();
    
    uint128_t combined_id = combine_checksum_ids(project_hash, username);
    auto coordinator_itr = project_coordinator_index.find(combined_id);
    
    if (coordinator_itr == project_coordinator_index.end()) {
        return std::nullopt;
    }
    
    return *coordinator_itr;
}

coordinator capital::get_coordinator_or_fail(eosio::name coopname, const checksum256 &project_hash, eosio::name username, const char* msg) {
    auto coord = get_coordinator(coopname, project_hash, username);
    eosio::check(coord.has_value(), msg);
    return *coord;
}

// Рассчитывает coordinator_base согласно формуле ТЗ: coordinator_base = (creator_base + author_base) / (100% - 4%)
eosio::asset capital::calculate_coordinator_base(eosio::asset creator_base, eosio::asset author_base) {
    double total_base = static_cast<double>(creator_base.amount + author_base.amount);
    double coordinator_base_amount = total_base / (1.0 - COORDINATOR_PERCENT); // (100% - 4%)
    
    return eosio::asset(int64_t(coordinator_base_amount), creator_base.symbol);
}

// Функции для отслеживания выплат координаторам (с лимитом накоплений)

bool capital::has_coordinator_received_payout(eosio::name coopname, eosio::name coordinator_username, eosio::name investor_username) {
    coordinator_payout_index payouts(_capital, coopname.value);
    auto coordinator_investor_index = payouts.get_index<"bycoordinv"_n>();
    
    uint128_t combined_id = combine_ids(coordinator_username.value, investor_username.value);
    auto payout_itr = coordinator_investor_index.find(combined_id);
    
    return payout_itr != coordinator_investor_index.end();
}

eosio::asset capital::get_coordinator_accumulated_amount(eosio::name coopname, eosio::name coordinator_username, eosio::name investor_username) {
    coordinator_payout_index payouts(_capital, coopname.value);
    auto coordinator_investor_index = payouts.get_index<"bycoordinv"_n>();
    
    uint128_t combined_id = combine_ids(coordinator_username.value, investor_username.value);
    auto payout_itr = coordinator_investor_index.find(combined_id);
    
    if (payout_itr != coordinator_investor_index.end()) {
        return payout_itr->total_accumulated;
    }
    
    return asset(0, _root_govern_symbol);
}

void capital::record_coordinator_payout(eosio::name coopname, eosio::name coordinator_username, eosio::name investor_username, checksum256 result_hash, eosio::asset total_accumulated, eosio::asset amount_claimed) {
    coordinator_payout_index payouts(_capital, coopname.value);
    auto payout_id = get_global_id_in_scope(_capital, coopname, "coordpayouts"_n);
    
    payouts.emplace(coopname, [&](auto &p) {
        p.id = payout_id;
        p.coordinator_username = coordinator_username;
        p.investor_username = investor_username;
        p.result_hash = result_hash;
        p.total_accumulated = total_accumulated;
        p.amount_claimed = amount_claimed;
        p.claimed_at = current_time_point();
    });
}

// Функции для работы с мастерами согласно ТЗ БЛАГОРОСТ v0.1

std::optional<master> capital::get_assignment_master(eosio::name coopname, const checksum256 &assignment_hash) {
    master_index masters(_capital, coopname.value);
    auto assignment_master_index = masters.get_index<"byassignmstr"_n>();
    
    // Поиск мастера для данного задания
    auto lower = assignment_master_index.lower_bound(assignment_hash);
    auto upper = assignment_master_index.upper_bound(assignment_hash);
    
    for (auto itr = lower; itr != upper; ++itr) {
        if (itr->assignment_hash == assignment_hash && itr->role == "assignment"_n) {
            return *itr;
        }
    }
    
    return std::nullopt;
}

std::optional<master> capital::get_project_master(eosio::name coopname, const checksum256 &project_hash) {
    master_index masters(_capital, coopname.value);
    auto project_master_index = masters.get_index<"byprojmaster"_n>();
    
    // Поиск мастера для данного проекта
    auto lower = project_master_index.lower_bound(project_hash);
    auto upper = project_master_index.upper_bound(project_hash);
    
    for (auto itr = lower; itr != upper; ++itr) {
        if (itr->project_hash == project_hash && itr->role == "project"_n) {
            return *itr;
        }
    }
    
    return std::nullopt;
}

master capital::get_assignment_master_or_fail(eosio::name coopname, const checksum256 &assignment_hash, const char* msg) {
    auto master = get_assignment_master(coopname, assignment_hash);
    eosio::check(master.has_value(), msg);
    return *master;
}

// Функции для расчёта долей в ОАП согласно ТЗ БЛАГОРОСТ v0.1

// Рассчитывает долю создателя в ОАП: (sum_creator_base + sum_creator_bonus) / total_fact_project_cost * 38.2%
double capital::calculate_creator_share(eosio::asset creator_base, eosio::asset creator_bonus, eosio::asset total_project_cost) {
    if (total_project_cost.amount == 0) return 0.0;
    
    double creator_total = static_cast<double>(creator_base.amount + creator_bonus.amount);
    double project_total = static_cast<double>(total_project_cost.amount);
    
    return (creator_total / project_total) * 0.382; // 38.2%
}

// Рассчитывает долю автора в ОАП: (sum_author_base + sum_author_bonus) / total_fact_project_cost * 38.2%
double capital::calculate_author_share(eosio::asset author_base, eosio::asset author_bonus, eosio::asset total_project_cost) {
    if (total_project_cost.amount == 0) return 0.0;
    
    double author_total = static_cast<double>(author_base.amount + author_bonus.amount);
    double project_total = static_cast<double>(total_project_cost.amount);
    
    return (author_total / project_total) * 0.382; // 38.2%
}

// Рассчитывает долю пайщика в ОАП: contributor_amount / contributors_amounts * 61.8%
double capital::calculate_contributor_share(eosio::asset contributor_amount, eosio::asset contributors_amounts) {
    if (contributors_amounts.amount == 0) return 0.0;
    
    double contributor_ratio = static_cast<double>(contributor_amount.amount) / static_cast<double>(contributors_amounts.amount);
    
    return contributor_ratio * 0.618; // 61.8%
}

// Функции для работы с голосованием по методу Водянова

std::optional<capital_tables::vodyanov_distribution> capital::get_vodyanov_distribution(eosio::name coopname, const checksum256 &result_hash) {
    capital_tables::vodyanov_distribution_index distributions(_capital, coopname.value);
    auto by_result = distributions.get_index<"byresult"_n>();
    auto itr = by_result.find(result_hash);
    
    if (itr == by_result.end()) {
        return std::nullopt;
    }
    return *itr;
}

capital_tables::vodyanov_distribution capital::get_vodyanov_distribution_or_fail(eosio::name coopname, const checksum256 &result_hash, const char* msg) {
    auto distribution = get_vodyanov_distribution(coopname, result_hash);
    eosio::check(distribution.has_value(), msg);
    return *distribution;
}

std::vector<eosio::name> capital::get_assignment_participants(eosio::name coopname, const checksum256 &assignment_hash) {
    std::vector<eosio::name> participants;
    
    // Добавляем всех авторов проекта
    auto assignment = get_assignment_or_fail(coopname, assignment_hash, "Задание не найдено");
    
    authors_index authors(_capital, coopname.value);
    auto by_project = authors.get_index<"byprojecthash"_n>();
    
    for (auto itr = by_project.lower_bound(assignment.project_hash); 
         itr != by_project.end() && itr->project_hash == assignment.project_hash; 
         ++itr) {
        participants.push_back(itr->username);
    }
    
    // Добавляем всех создателей данного задания
    creators_index creators(_capital, coopname.value);
    auto by_assignment = creators.get_index<"byassignment"_n>();
    
    for (auto itr = by_assignment.lower_bound(assignment_hash); 
         itr != by_assignment.end() && itr->assignment_hash == assignment_hash; 
         ++itr) {
        // Проверяем, что создатель еще не добавлен (если он также является автором)
        if (std::find(participants.begin(), participants.end(), itr->username) == participants.end()) {
            participants.push_back(itr->username);
        }
    }
    
    return participants;
}

eosio::asset capital::calculate_vodyanov_amounts(eosio::asset authors_bonus, eosio::asset creators_bonus) {
    // 31.8% от общей суммы премий авторов и создателей
    int64_t total_bonus = authors_bonus.amount + creators_bonus.amount;
    int64_t vodyanov_amount = int64_t(static_cast<double>(total_bonus) * 0.318);
    
    return eosio::asset(vodyanov_amount, authors_bonus.symbol);
}

bool capital::has_user_voted(eosio::name coopname, uint64_t distribution_id, eosio::name voter) {
    capital_tables::vodyanov_vote_index votes(_capital, coopname.value);
    auto by_dist_voter = votes.get_index<"bydistvoter"_n>();
    
    uint128_t combined_id = combine_ids(distribution_id, voter.value);
    auto itr = by_dist_voter.find(combined_id);
    
    return itr != by_dist_voter.end();
}

void capital::calculate_vodyanov_results(eosio::name coopname, uint64_t distribution_id) {
    capital_tables::vodyanov_distribution_index distributions(_capital, coopname.value);
    auto dist_itr = distributions.find(distribution_id);
    eosio::check(dist_itr != distributions.end(), "Распределение не найдено");
    
    capital_tables::vodyanov_vote_index votes(_capital, coopname.value);
    capital_tables::vodyanov_result_index results(_capital, coopname.value);
    
    auto by_distribution = votes.get_index<"bydistrib"_n>();
    
    // Создаем результаты для каждого участника
    for (const auto& participant : dist_itr->participants) {
        eosio::asset votes_received = asset(0, dist_itr->total_amount.symbol);
        
        // Суммируем все голоса, поданные ЗА данного участника
        for (auto vote_itr = by_distribution.lower_bound(distribution_id); 
             vote_itr != by_distribution.end() && vote_itr->distribution_id == distribution_id; 
             ++vote_itr) {
            
            if (vote_itr->recipient == participant) {
                votes_received += vote_itr->amount;
            }
        }
        
        // Рассчитываем итоговую сумму: среднее арифметическое голосов + равная доля
        eosio::asset final_amount = votes_received + dist_itr->equal_share;
        
        // Сохраняем результат
        auto result_id = get_global_id_in_scope(_capital, coopname, "vodyanovrslt"_n);
        results.emplace(coopname, [&](auto &r) {
            r.id = result_id;
            r.distribution_id = distribution_id;
            r.result_hash = dist_itr->result_hash;
            r.participant = participant;
            r.votes_received = votes_received;
            r.equal_share = dist_itr->equal_share;
            r.final_amount = final_amount;
            r.calculated_at = current_time_point();
        });
    }
}

