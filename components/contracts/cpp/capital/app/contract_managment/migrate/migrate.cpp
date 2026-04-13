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

  const eosio::name coopname = "voskhod"_n;

  Capital::contributor_index contributors(_capital, coopname.value);

  std::vector<uint64_t> contributor_ids;
  contributor_ids.reserve(32);
  for (auto itr = contributors.begin(); itr != contributors.end(); ++itr) {
    contributor_ids.push_back(itr->id);
  }

  for (uint64_t contributor_id : contributor_ids) {
    auto itr = contributors.find(contributor_id);
    if (itr == contributors.end()) {
      continue;
    }

    eosio::asset wallet_total = eosio::asset(0, _root_govern_symbol);
    auto pw_opt = Capital::Wallets::get_program_capital_wallet(coopname, itr->username);
    if (pw_opt.has_value()) {
      const progwallet &pw = pw_opt.value();
      eosio::asset blocked_part = pw.blocked.has_value()
                                      ? pw.blocked.value()
                                      : eosio::asset(0, _root_govern_symbol);
      wallet_total = pw.available + blocked_part;
    }

    contributors.modify(itr, _capital, [&](auto &c) {
      c.contributed_as_investor = wallet_total;
    });
  }
}
