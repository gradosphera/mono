/**
 * \brief Установка ставки плана для пакета (per-plan upsert).
 * \ingroup public_apps_actions
 *
 * Story v2.1.1: каркас без бизнес-валидации. Что делает действие:
 *  1. Требует `apps@active` — `require_auth(get_self())`.
 *  2. В таблице `pricings` (scope = `package_id`) находит запись по `plan`:
 *      - row нет → `emplace` с переданными `hourly_rate` и `updated_at = now`.
 *      - row есть → `modify`: обновляет `hourly_rate` и `updated_at`.
 *
 * Что **не делает** (выносится в Story v2.1.2):
 *  - Валидация `hourly_rate.amount > 0` и `is_amount_within_range`.
 *  - Валидация символа против `_root_govern_symbol` (ожидается `RUB,4`).
 *  - Whitelist допустимых имён `plan` (в MVP только `default`).
 *  - Snapshot предыдущей ставки в audit_log_admin (off-chain;
 *    journal-less invariant держит контракт без on-chain history).
 *
 * RAM payer — `get_self()` (`apps`-контракт). Фактически платит ВОСХОД
 * как owner аккаунта `apps`; pricing-таблицы — часть координационной
 * плоскости, оплачиваемой оператором каталога.
 */
void apps::setpricing(eosio::name package_id,
                      eosio::name plan,
                      eosio::asset hourly_rate) {
  require_auth(get_self());

  pricings_index pricings(get_self(), package_id.value);
  auto it = pricings.find(plan.value);
  auto now = eosio::time_point_sec(eosio::current_time_point().sec_since_epoch());

  if (it == pricings.end()) {
    pricings.emplace(get_self(), [&](auto &p) {
      p.plan        = plan;
      p.hourly_rate = hourly_rate;
      p.updated_at  = now;
    });
  } else {
    pricings.modify(it, get_self(), [&](auto &p) {
      p.hourly_rate = hourly_rate;
      p.updated_at  = now;
    });
  }
}
