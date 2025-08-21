#include <eosio.bios/eosio.bios.hpp>

namespace eosiobios {

/**
 * @brief Устанавливает ABI для аккаунта.
 * Сохраняет хеш ABI в таблице для указанного аккаунта.
 * @param account Аккаунт, для которого устанавливается ABI
 * @param abi ABI в виде вектора символов
 * @ingroup public_actions
 * @ingroup public_bios_actions
 * @anchor bios_setabi
 * @note Авторизация требуется от аккаунта: @p eosio.bios
 */
void bios::setabi( name account, const std::vector<char>& abi ) {
   abi_hash_table table(get_self(), get_self().value);
   auto itr = table.find( account.value );
   if( itr == table.end() ) {
      table.emplace( account, [&]( auto& row ) {
         row.owner = account;
         row.hash  = eosio::sha256(const_cast<char*>(abi.data()), abi.size());
      });
   } else {
      table.modify( itr, eosio::same_payer, [&]( auto& row ) {
         row.hash = eosio::sha256(const_cast<char*>(abi.data()), abi.size());
      });
   }
}

void bios::onerror( ignore<uint128_t>, ignore<std::vector<char>> ) {
   check( false, "the onerror action cannot be called directly" );
}

/**
 * @brief Устанавливает привилегированный статус для аккаунта.
 * Включает или выключает привилегированный статус для указанного аккаунта.
 * @param account Аккаунт, для которого устанавливается привилегированный статус
 * @param is_priv 0 для false, > 0 для true
 * @ingroup public_actions
 * @ingroup public_bios_actions
 * @anchor bios_setpriv
 * @note Авторизация требуется от аккаунта: @p eosio.bios
 */
void bios::setpriv( name account, uint8_t is_priv ) {
   require_auth( get_self() );
   set_privileged( account, is_priv );
}

/**
 * @brief Устанавливает лимиты ресурсов для аккаунта.
 * Устанавливает лимиты RAM, сети и CPU для указанного аккаунта.
 * @param account Имя аккаунта, для которого устанавливается лимит ресурсов
 * @param ram_bytes Лимит RAM в абсолютных байтах
 * @param net_weight Дробно пропорциональный лимит сети доступных ресурсов
 * @param cpu_weight Дробно пропорциональный лимит CPU доступных ресурсов
 * @ingroup public_actions
 * @ingroup public_bios_actions
 * @anchor bios_setalimits
 * @note Авторизация требуется от аккаунта: @p eosio.bios
 */
void bios::setalimits( name account, int64_t ram_bytes, int64_t net_weight, int64_t cpu_weight ) {
   require_auth( get_self() );
   set_resource_limits( account, ram_bytes, net_weight, cpu_weight );
}

/**
 * @brief Устанавливает новый список активных продюсеров.
 * Устанавливает новый список активных продюсеров, предлагая изменение расписания.
 * @param schedule Новый список активных продюсеров для установки
 * @ingroup public_actions
 * @ingroup public_bios_actions
 * @anchor bios_setprods
 * @note Авторизация требуется от аккаунта: @p eosio.bios
 */
void bios::setprods( const std::vector<eosio::producer_authority>& schedule ) {
   require_auth( get_self() );
   set_proposed_producers( schedule );
}

/**
 * @brief Устанавливает параметры блокчейна.
 * Устанавливает параметры блокчейна для настройки различных степеней кастомизации.
 * @param params Новые параметры блокчейна для установки
 * @ingroup public_actions
 * @ingroup public_bios_actions
 * @anchor bios_setparams
 * @note Авторизация требуется от аккаунта: @p eosio.bios
 */
void bios::setparams( const eosio::blockchain_parameters& params ) {
   require_auth( get_self() );
   set_blockchain_parameters( params );
}

/**
 * @brief Проверяет авторизацию аккаунта.
 * Проверяет, имеет ли аккаунт from авторизацию для доступа к текущему действию.
 * @param from Имя аккаунта для авторизации
 * @ingroup public_actions
 * @ingroup public_bios_actions
 * @anchor bios_reqauth
 * @note Авторизация требуется от аккаунта: @p from
 */
/**
 * @brief Проверяет авторизацию аккаунта.
 * Проверяет, имеет ли аккаунт from авторизацию для доступа к текущему действию.
 * @param from Имя аккаунта для авторизации
 * @ingroup public_actions
 * @ingroup public_bios_actions
 * @anchor bios_reqauth
 * @note Авторизация требуется от аккаунта: @p from
 */
void bios::reqauth( name from ) {
   require_auth( from );
}

/**
 * @brief Активирует протокольную функцию.
 * Активирует протокольную функцию по хешу.
 * @param feature_digest Хеш протокольной функции для активации
 * @ingroup public_actions
 * @ingroup public_bios_actions
 * @anchor bios_activate
 * @note Авторизация требуется от аккаунта: @p eosio.bios
 */
void bios::activate( const eosio::checksum256& feature_digest ) {
   require_auth( get_self() );
   preactivate_feature( feature_digest );
}

/**
 * @brief Проверяет активацию протокольной функции.
 * Утверждает, что протокольная функция была активирована.
 * @param feature_digest Хеш протокольной функции для проверки активации
 * @ingroup public_actions
 * @ingroup public_bios_actions
 * @anchor bios_reqactivated
 */
void bios::reqactivated( const eosio::checksum256& feature_digest ) {
   check( is_feature_activated( feature_digest ), "protocol feature is not activated" );
}

}
