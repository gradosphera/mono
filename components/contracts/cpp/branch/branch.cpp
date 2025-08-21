#include "branch.hpp"

#include "src/addtrusted.cpp"
#include "src/createbranch.cpp"
#include "src/deletebranch.cpp"
#include "src/deltrusted.cpp"
#include "src/editbranch.cpp"

using namespace eosio;

/**
 * @brief Инициализация контракта кооперативных участков.
 * Выполняет начальную настройку контракта.
 * @ingroup public_actions
 * @ingroup public_branch_actions
 * @anchor branch_migrate
 * @note Авторизация требуется от аккаунта: @p _branch
 */
[[eosio::action]] void branch::migrate() {
  require_auth(_branch);
}

/**
 * @brief Инициализация контракта кооперативных участков.
 * Выполняет начальную настройку контракта.
 * @ingroup public_actions
 * @ingroup public_branch_actions
 * @anchor branch_init
 * @note Авторизация требуется от аккаунта: @p _system
 */
[[eosio::action]] void branch::init()
{
  require_auth(_system);  
};

