#pragma once

#include <eosio/eosio.hpp>

/**
 * Проверка прав администратора / председателя для действий кооператива.
 * Требует domain/index.hpp (совет, staff) и consts.hpp (_gateway, _soviet).
 */
inline void check_auth_or_fail(eosio::name contract, eosio::name coopname, eosio::name admin,
                               eosio::name action_name) {
  if (has_auth(coopname) || has_auth(contract))
    return;

  require_auth(admin);

  auto board = get_board_by_type_or_fail(coopname, "soviet"_n);
  bool is_valid = board.is_valid_chairman(admin);

  if (!is_valid) {
    staff_index staff(_soviet, coopname.value);
    auto administrator = staff.find(admin.value);
    eosio::check(administrator != staff.end(), "Администратор не найден");
    bool has_right = administrator->has_right(_gateway, action_name);

    eosio::check(has_right, "Недостаточно прав доступа к действию");
  }
}
