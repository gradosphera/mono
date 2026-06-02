# C28-28 · Naming Proposal (text-only, до кода)

**Назначение:** консолидировать 5 открытых вопросов по Эпику 0 (ledger2 P0 action-codes) в один документ — пользователь ack/redirect, после чего разблокируются C28-29 (контракт `expenses`) и C28-31 (backend extension).

**Канон:** `feedback_kanon_naming_soglasovyvat` — имена в onthology/стандартах согласовываются ДО реализации; прецедент 2026-05-19 (`seize`/`wroff`/`seizecollat` отвергнуты).

**Источник правды по существующему стилю:** `components/contracts/cpp/lib/core/ledger2/{accounts,wallets,operations}.hpp` mono-ai-2 (`feat/expense-chassis-mvp`).

---

## 0. Сводка вопросов на ack

| # | Вопрос | Предложение | Альтернатива |
|---|---|---|---|
| 1 | Имя контракта-владельца кодов | `expenses` (префикс операций `o.exp.*`, кошельков `w.exp.*`, процессов `p.exp.*`) | `expense` (без `s`) |
| 2 | Новые account_id в `LEDGER2_ACCOUNT_MAP` | добавить `SETTLEMENTS_WITH_SUPPLIERS` (60) и `SETTLEMENTS_WITH_ACCOUNTABLES` (71) | оставить только 71, для 60 использовать BANK_ACCOUNT-овский синтетический проход (хуже — теряем счёт 60 в балансе) |
| 3 | Новые кошельки | `w.exp.adv` (подотчётные средства у пайщика, USER_SHARED) + `w.exp.sup` (расчёты с поставщиком, COOPERATIVE) | один общий `w.exp.hold` без разреза по контрагенту (плохо — невозможно сводить 71 по пайщику) |
| 4 | Posting-моделирование DIRECT-механики | **2 op-кода** (`DIRECT_PAYMENT` + `DIRECT_REPORTED`) — issue упускает второй | один код Dr 08/Cr 51 без транзита через 60 (плохо — теряем счёт 60, не соответствует ПБУ) |
| 5 | `capwip`-флаг (capitalize-WIP) | НЕ заводить на уровне action-code — решает контракт `capital` через свой trigger (см. C28-29 §«capital trigger») | флаг внутри `expenses::reportexp` — двусвязность контрактов, отказ |

Дополнительно (§3.6) — скрытый insight, которого нет в issue: для замыкания 60-го счёта при DIRECT нужен **второй** action-code `DIRECT_REPORTED`. Без него Дт 60 не закрывается → балансовая ошибка. Issue фиксирует 5 кодов, фактически нужно **6**.

---

## 1. Контракт-владелец

**Предложение:** `expenses` (множ. число — как `wallets2`/`accounts`/`marketplace` в существующем коде; единственное число — `marketplace`/`registrator` тоже встречается, но «расходы» в русском всегда мн.ч.). Префиксы:

- `[[eosio::action]]` actions: `expenses::createexp`, `submitexp`, `authexp`, `payexp`, `reportexp`, `closeexp`, `declexp`, `returnexp`, `overspendexp` (12-char ограничение eosio::name — соблюдено).
- Operation codes (это другое — `o.exp.*`, см. §3).
- Wallets — `w.exp.*` (§4).
- Processes — `p.exp.proposal` (один процесс на всё ССЗ-предложение).

## 2. План счетов — новые account_id

Добавить в `accounts.hpp` (между `FINANCIAL_INVESTMENTS=58000` и `SHARE_FUND=80000`):

```cpp
static constexpr uint64_t SETTLEMENTS_WITH_SUPPLIERS    = 60 * 1000; // 60 — Расчёты с поставщиками (А/П, активно-пассивный)
static constexpr uint64_t SETTLEMENTS_WITH_ACCOUNTABLES = 71 * 1000; // 71 — Расчёты с подотчётными лицами (А/П, активно-пассивный)
```

`AccountType` в текущем enum только `ACTIVE`/`PASSIVE`. **Открытый вопрос:** заводить `ACTIVE_PASSIVE` или фиксировать обе записи как `ACTIVE` (фактический остаток на 71/60 у нас всегда дебетовый — кооператив выдал, ждёт отчёта). **Предложение:** `ACTIVE` — соответствует фактической семантике, не плодить enum-значение.

`LEDGER2_ACCOUNT_MAP` пополняем двумя строками с человекочитаемыми именами:
- «Расчёты с поставщиками»
- «Расчёты с подотчётными лицами»

## 3. Operation codes — 6 (не 5)

В реестре `OPERATION_REGISTRY[]` добавить (имена соблюдают канон `o.<contract>.<verb>` ≤12 char):

| # | C++ константа | eosio::name | WalletOp | wallet_from → wallet_to | Dr / Cr | human_name |
|---|---|---|---|---|---|---|
| 3.1 | `operations::expenses::ADVANCE_PAYOUT` | `o.exp.payadv` | TRANSFER | `BLAGOROST_FUND` → `w.exp.adv` | 71 / 51 | «Выдача подотчётных пайщику» |
| 3.2 | `operations::expenses::DIRECT_PAYMENT` | `o.exp.paydir` | TRANSFER | `BLAGOROST_FUND` → `w.exp.sup` | 60 / 51 | «Прямая оплата поставщику» |
| 3.3 | `operations::expenses::ADVANCE_REPORTED` | `o.exp.rptadv` | BURN | `w.exp.adv` → ∅ | 08 / 71 | «Закрытие подотчёта пайщика (РИД-имущество)» |
| 3.4 | `operations::expenses::DIRECT_REPORTED` | `o.exp.rptdir` | BURN | `w.exp.sup` → ∅ | 08 / 60 | «Закрытие расчётов с поставщиком (РИД-имущество)» |
| 3.5 | `operations::expenses::ADVANCE_RETURN` | `o.exp.retadv` | TRANSFER | `w.exp.adv` → `BLAGOROST_FUND` | 51 / 71 | «Возврат неиспользованного подотчёта» |
| 3.6 | `operations::expenses::OVERSPEND_COMPENSATION` | `o.exp.compen` | TRANSFER | `BLAGOROST_FUND` → `w.exp.adv` | 08 / 71 | «Доплата сверх подотчёта (перерасход)» — затем `ADVANCE_REPORTED` закрывает |

**Insight по §3.6 (overspend):** «доплата» — это **TRANSFER** на `w.exp.adv`, потому что сначала надо «выдать» пайщику добавочные деньги (формально Dr 71/Cr 51), потом сразу закрыть их `ADVANCE_REPORTED` (Dr 08/Cr 71). Альтернатива — атомарная op с Dr 08/Cr 51 — нарушает «одна op = одна пара проводок» (см. ADR-003 в `operations.hpp:42`). **Предложение:** оставить две последовательные операции (`OVERSPEND_COMPENSATION` + `ADVANCE_REPORTED` уже сразу из `expenses::overspendexp`).

**Process_type:** единственный — `processes::expenses::PROPOSAL = "p.exp.proposal"_n`. Все 6 кодов привязаны к нему. Один process_hash на одно ССЗ-предложение, шаги differentiated по `operation_code`.

**Insight по §3.2 vs §3.4:** issue в C28-28 говорит «только 5 кодов, DIRECT_PAYMENT — это Dr 60/Cr 51». Это оставляет 60-й счёт открытым. Backend `expenses::reportexp` в DIRECT-механике должен вызвать **второй** ledger2-op (`DIRECT_REPORTED`) сразу после `payexp` (без UI-шага «приложить чек» — для DIRECT это фоновая операция). См. E2E.md (C28-34) Journey A шаг 8: «для DIRECT-механики backend сразу делает reportexp». Если выберем модель «5 кодов» — теряем 60.

**Альтернатива** (5 кодов): DIRECT_PAYMENT = Dr 08/Cr 51 без транзита через 60. Тогда счёт 60 не появляется. **Минус:** не соответствует ПБУ (поставщик — это расчёты, 60), нельзя сводить акты сверки с поставщиками.

## 4. Кошельки — новые записи в `wallets.hpp`

```cpp
// w.exp.* — Шасси расходов (расчёты с подотчётными и поставщиками)
static constexpr eosio::name ADVANCE_HOLD     = "w.exp.adv"_n;   ///< Подотчётные средства у пайщика (USER_SHARED; Dr 71 source)
static constexpr eosio::name SUPPLIER_HOLD    = "w.exp.sup"_n;   ///< Расчёты с поставщиком — pending-выплата (COOPERATIVE; Dr 60 source)
```

**`LEDGER2_WALLET_REGISTRY`:**
- `ADVANCE_HOLD` — «Подотчётные средства пайщика» — `USER_SHARED` (разрез по пайщику-получателю, чтобы вести 71-й по каждому).
- `SUPPLIER_HOLD` — «Расчёты с поставщиком» — `COOPERATIVE` (поставщик — внешнее лицо, не пайщик; 60-й сводится в пул кооператива).

**`LEDGER2_WALLET_TO_PROGRAM`:** оба — `0` (не привязаны к программе). Программу несёт `BLAGOROST_FUND`-источник через `process_hash`.

## 5. `capwip`-флаг

`capwip` (capitalize-WIP) — это решение Благороста, что отчёт по подотчёту увеличивает РИД-баланс пайщика на `w.cap.gen` (Dr 08/Cr 71 → переходит в `o.cap.commit` через capital-trigger).

**Предложение:** **НЕ заводить** флаг на уровне action-code шасси. Контракт `expenses` агностичен к программе-источнику. Капитализация — обязанность контракта `capital` через **trigger** (C28-29 §«capital trigger»):

```
expenses::reportexp(proposal_hash) →
  ledger2::apply(o.exp.rptadv | o.exp.rptdir) →
  (если source_wallet == w.cap.blago И target == capital::programs.BLAGOROST_POOL)
    capital::onexpreport(proposal_hash) →
      ledger2::apply(o.cap.commit) на ту же сумму
```

Триггер вызывается из `expenses::reportexp` через `eosio::action::send_inline` к `capital::onexpreport`. Контракт `expenses` не знает про РИД; контракт `capital` сам решает, капитализировать или нет.

**Альтернатива:** флаг `bool capwip` в payload `reportexp` — отказ, потому что:
1. Двусвязность: контракт `expenses` ссылается на сущности `capital`.
2. Решение «капитализировать или нет» — программная политика, она меняется со временем; зашивать в action-payload = ломать обратную совместимость.

## 6. Acceptance Criteria для C28-28 (уточнённые)

- [ ] §1 ack: контракт `expenses` с указанными префиксами.
- [ ] §2 ack: 60 и 71 заводятся как `ACTIVE` (не `ACTIVE_PASSIVE`); или ack варианта `ACTIVE_PASSIVE` с расширением enum.
- [ ] §3 ack: 6 op-кодов (не 5); если выбран вариант «5 кодов без 60», переписать §3.2 и удалить §3.4.
- [ ] §4 ack: имена кошельков `w.exp.adv` / `w.exp.sup`, kinds USER_SHARED / COOPERATIVE.
- [ ] §5 ack: `capwip` — через `capital::onexpreport` trigger, не флаг в payload.

После ack:
- C28-29 расшивается на ledger2-инструкции (§3 даёт точную карту).
- C28-31 backend EventEmitter маппит 6 op-кодов на 9 шасси-событий из INTEGRATIONS.md §2.

## 7. Спорные точки для пользователя

1. **Нумерация `o.exp.*` против ограничения 12 символов.** `o.exp.compen` — 12 символов ровно (`o`+`.`+`exp`+`.`+`compen`). Альтернатива покороче: `o.exp.over`.
2. **`SUPPLIER_HOLD` vs `SUPPLIER_PAYMENTS`** (`w.mkt.payout`, marketplace). Семантически близко, но `w.mkt.payout` — sink (платёж ушёл, $0 после `o.mkt.recv`), а `w.exp.sup` — pending (платёж ещё не подтверждён актом). Объединять опасно — нарушим инвариант marketplace. **Предложение:** держать раздельно.
3. **`ADVANCE_RETURN` BURN vs TRANSFER.** Сейчас в таблице (§3.5) — TRANSFER в `BLAGOROST_FUND` (возврат в пул). Альтернатива — BURN с `w.exp.adv` без `wallet_to`, если возврат идёт сразу на 51 без захода в Благорост. **Предложение:** TRANSFER (пайщик вернул в источник = пул).
4. **Источник для не-Благорост-потребителей.** Сейчас зашит `BLAGOROST_FUND`. Когда появится второй потребитель (Маркетплейс), `o.exp.payadv` должен принимать любой `source_wallet`. **Предложение:** в реестре `wallet_from = eosio::name{}` (динамически), `wallet_to = w.exp.adv`. Хардкод `BLAGOROST_FUND` в реестре противоречит §5 (контракт `expenses` агностичен).

**Sub-insight по §7.4:** если `wallet_from` — пустое имя в реестре, нужно расширить `OperationRegistryEntry` или ввести флаг `dynamic_source`. Это — отдельный архитектурный вопрос; **на ack: расширить ли реестр или зашить `BLAGOROST_FUND` для MVP и переделать в Эпике 2**.

---

## Roadmap после ack

1. C28-28 → код в `ledger2/operations.hpp` + `accounts.hpp` + `wallets.hpp` + `processes.hpp` (1 файл — `OPERATION_REGISTRY` дополнить).
2. cooptypes regen (`pnpm -w build` cooptypes).
3. CI-тест `ledger2_actions_registry_test` обновить ожидания (6 новых кодов).
4. C28-29 расшивается (имена операций ↔ имена C++ actions контракта).
5. C28-31 backend `expenses` extension использует cooptypes enums (`OperationCode.EXP_PAYADV` и т.д.).
