#include <eosio.boot/eosio.boot.hpp>
#include <eosio/privileged.hpp>

namespace eosioboot {

void boot::onerror( ignore<uint128_t>, ignore<std::vector<char>> ) {
   check( false, "the onerror action cannot be called directly" );
}

/**
 * @brief Активирует протокольную функцию.
 * @param feature_digest Хеш протокольной функции для активации
 * @ingroup public_actions
 * @ingroup public_boot_actions

 * @note Авторизация требуется от аккаунта: @p eosio.boot
 */
void boot::activate( const eosio::checksum256& feature_digest ) {
   require_auth( get_self() );
   eosio::preactivate_feature( feature_digest );
}

/**
 * @brief Проверяет активацию протокольной функции.
 * Утверждает, что протокольная функция была активирована.
 * @param feature_digest Хеш протокольной функции для проверки активации
 * @ingroup public_actions
 * @ingroup public_boot_actions

 */
void boot::reqactivated( const eosio::checksum256& feature_digest ) {
   check( eosio::is_feature_activated( feature_digest ), "protocol feature is not activated" );
}

}
