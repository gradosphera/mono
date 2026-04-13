#include <vector>

/**
 * @brief Миграция контракта: синхронизация contributed_as_investor с балансом кошелька программы благороста
 * Только кооператив voskhod: для каждого участника в contributors читается progwallet программы capital,
 * contributed_as_investor выставляется равным available+blocked (как накопление при createpinv).
 * @ingroup public_actions
 * @ingroup public_capital_actions
 *
 * @note Авторизация требуется от аккаунта: @p _capital
 */
void capital::migrate() {
  require_auth(_capital);

}
