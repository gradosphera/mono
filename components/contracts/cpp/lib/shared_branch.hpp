#pragma once

namespace Branch {
  /**
  * @brief Получает количество кооперативных участков для данного кооператива
  * @param coopname Имя кооператива
  * @return Количество участков кооператива
  */
  uint64_t get_branch_count(eosio::name coopname) {
    branchstat_index stat(_branch, _branch.value);
    auto st = stat.find(coopname.value);
    
    if (st == stat.end()) {
      return 0;
    }
    
    return st->count;
  }

  /**
  * @brief Проверяет, является ли пользователь уполномоченным лицом (trustee) кооперативного участка
  * @param coopname Имя кооператива
  * @param username Имя пользователя для проверки
  * @return true если пользователь является уполномоченным, false в противном случае
  */
  bool is_trustee(eosio::name coopname, eosio::name username) {
    branch_index branches(_branch, coopname.value);
    
    auto by_trustee_index = branches.get_index<"bytrustee"_n>();
    auto trustee_itr = by_trustee_index.find(username.value);
    
    return trustee_itr != by_trustee_index.end();
  }

  /**
  * @brief Проверяет, является ли пользователь доверенным лицом (trusted) в указанном участке кооператива
  * @param coopname Имя кооператива
  * @param braname Имя участка
  * @param username Имя пользователя для проверки
  * @return true если пользователь является доверенным, false в противном случае
  */
  bool is_trusted(eosio::name coopname, eosio::name braname, eosio::name username) {
    branch_index branches(_branch, coopname.value);
    auto branch_itr = branches.find(braname.value);
    
    if (branch_itr == branches.end()) {
      return false;
    }
    
    return branch_itr->is_account_in_trusted(username);
  } 

}