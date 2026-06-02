# C28-28 · Naming Proposal v2 — универсальное шасси расхода

**Изменения v2 (после голосового пользователя 2026-06-02):** контракт делается универсальным — не вводим новых счетов (60/71 отвергнуты), используем существующие 04/08/51/58/80/86; источник средств и operation_code передаются **извне** в payload, контракт ничего не «знает» про Благорост или хозрасходы; матрица 5 операций (вместо 6).

**Канон:** `feedback_kanon_naming_soglasovyvat` — имена в ontology согласовываются ДО реализации; прецедент 2026-05-19.

**Источник правды:** `components/contracts/cpp/lib/core/ledger2/{accounts,wallets,operations}.hpp` mono-ai-2 (`feat/expense-chassis-mvp`).

---

## 0. Что изменилось v1 → v2

| Точка | v1 | v2 | Причина |
|---|---|---|---|
| Имя контракта | `expenses` (мн.ч.) | **`expense`** (ед.ч.) | пользователь §1 |
| Счета 60/71 | новые account_id | **не вводим** | пользователь §2 — план счетов фиксирован 04/08/51/58/80/86 |
| Кошелёк `w.exp.sup` | COOPERATIVE для расчётов с поставщиком | **отменён** | `w.mkt.payout` занят, `w.exp.sup` дублирует семантику без выгоды |
| Operation codes | 6 в реестре с хардкод-источниками | **5**, по матрице source × mechanic; источник определяется при выборе кода | универсальность шасси, расширение без правки контракта |
| `o.exp.compen` (12 char) | основной | **`o.exp.over`** | пользователь §7.1 — короче, понятнее |
| capwip-флаг | отдельная политика | **payload-флаг `wip_project_hash`** | пользователь §5 — capital trigger только если payload содержит project_hash |
| Расширение реестра | ADD COLUMN | реестр расширяемый — каждая новая пара (source, mechanic) = новая `o.exp.*` запись | хардкод-only constraint OPERATION_REGISTRY |

---

## 1. Контракт-владелец

`expense` (ед.ч.). Префиксы:
- `[[eosio::action]]`: `expense::createexp`, `submitexp`, `authexp`, `payexp`, `reportexp`, `closeexp`, `declexp`, `returnexp`, `overspendexp`.
- Operation codes: `o.exp.*` (§3).
- Wallets: `w.exp.adv` (один — §4).
- Processes: `p.exp.proposal`.

## 2. План счетов — без новых записей

Существующие из `accounts.hpp`:
- **04** НМА (А) — если расход капитализируется в РИД
- **08** Вложения во внеоборотные активы (А) — WIP-проект РИД
- **51** Расчётный счёт (А)
- **58** Финансовые вложения (А) — займы
- **80** Паевой фонд (П)
- **86** Целевое финансирование (П) — членские, хозрасходы

**60/71 отвергнуты.** Подотчёт пайщика моделируется кошельком-резервом (`w.exp.adv` USER_SHARED) аналогично `w.wal.wpend` — без отдельного бух.счёта.

## 3. Operation codes — 5 в реестре, матрица source × mechanic

В `OPERATION_REGISTRY[]`:

| # | C++ константа | eosio::name | WalletOp | wallet_from → wallet_to | Dr / Cr | human_name |
|---|---|---|---|---|---|---|
| 3.1 | `operations::expense::BLAGO_ADVANCE` | `o.exp.blgadv` | TRANSFER | `BLAGOROST_FUND` → `w.exp.adv` | 08 / 80 | «Выдача подотчётных из ЦПП «Благорост»» |
| 3.2 | `operations::expense::BLAGO_DIRECT` | `o.exp.blgdir` | BURN | `BLAGOROST_FUND` → ∅ | 08 / 51 | «Прямая оплата из ЦПП «Благорост» (DIRECT)» |
| 3.3 | `operations::expense::ADVANCE_REPORT` | `o.exp.advrpt` | BURN | `w.exp.adv` → ∅ | 0 / 0 | «Закрытие подотчёта пайщика по отчёту» |
| 3.4 | `operations::expense::ADVANCE_RETURN` | `o.exp.advret` | TRANSFER | `w.exp.adv` → `BLAGOROST_FUND` | 80 / 08 | «Возврат неиспользованного подотчёта в ЦПП «Благорост»» |
| 3.5 | `operations::expense::OVERSPEND` | `o.exp.over` | TRANSFER | `BLAGOROST_FUND` → `w.exp.adv` | 08 / 80 | «Доплата сверх подотчёта (перерасход)» |

**Process_type:** один — `processes::expense::PROPOSAL = "p.exp.proposal"_n`. Все 5 кодов привязаны к нему.

### Объяснение проводок

- **3.1 BLAGO_ADVANCE (Dr 08 / Cr 80):** `w.cap.blago` сидит на 80 (паевой фонд); подотчёт = инвестиция в РИД-проект (вложение во внеоборотные → 08). Зеркало паттерна `o.cap.commit`.
- **3.2 BLAGO_DIRECT (Dr 08 / Cr 51):** прямая оплата вне пайщика — деньги уходят с расчётного счёта (51), сразу попадают в WIP-проект (08). BURN с `w.cap.blago` — резерв пула сжигается.
- **3.3 ADVANCE_REPORT (0/0):** бухпроводка уже сделана на blgadv/blgdir. При отчёте только BURN подотчётного кошелька — без новых проводок. Аналог `o.cap.accept` (WalletOp::NONE для зеркала). Здесь BURN, потому что кошелёк пайщика очищается.
- **3.4 ADVANCE_RETURN (Dr 80 / Cr 08):** возврат в `w.cap.blago` — обратная операция. Восстановление пула.
- **3.5 OVERSPEND (Dr 08 / Cr 80):** добавочная выдача — зеркало 3.1. После `o.exp.over` сразу `o.exp.advrpt` закрывает.

### Расширяемость

Новый источник (хозрасходы из членских 86, фонд развития, AXN) — это **новая пара кодов** в реестре:

| Будущее | source | target | пример имени |
|---|---|---|---|
| Хозрасходы DIRECT | `w.sov.expns` (86) | банк | `o.exp.sovdir` (Dr 26\*/Cr 51 или прямой Dr 86/Cr 51) |
| Хозрасходы ADVANCE | `w.sov.expns` | пайщик-подотчёт | `o.exp.sovadv` |
| Фонд развития DIRECT | `w.sov.devfnd` (новый) | банк | `o.exp.devdir` |

Контракт `expense` не меняется — только реестр ledger2 расширяется. Сейчас в MVP — только Благорост (3.1–3.5).

\* Счёт 26 в плане отсутствует. Если когда-то понадобится — добавится отдельным эпиком; для MVP хозрасходов из членских делаем прямо Dr 86 / Cr 51 без транзита через 26.

## 4. Кошельки — один новый

```cpp
// w.exp.* — Шасси расходов (подотчёт пайщика)
static constexpr eosio::name ADVANCE_HOLD = "w.exp.adv"_n;   ///< Подотчётные средства у пайщика (USER_SHARED, резерв-pattern; зеркало w.wal.wpend)
```

`LEDGER2_WALLET_REGISTRY`:
- `ADVANCE_HOLD` — «Подотчётные средства пайщика» — **USER_SHARED** (разрез по пайщику-получателю; именно он держит ответственность за отчёт).

`w.exp.sup` (расчёты с поставщиком) **не заводим** — DIRECT обходится без транзитного кошелька.

`w.mkt.payout` **не трогаем** — занят `o.mkt.recv` (Dr 80 / Cr 51, TRANSFER SHARE_FUND_PAY → SUPPLIER_PAYMENTS).

## 5. Capital trigger — payload-флаг

`expense::reportexp(proposal_hash, ?wip_project_hash)` принимает **необязательное** поле. Если есть — после `ledger2::apply(o.exp.advrpt | o.exp.blgdir)` контракт шлёт `eosio::action::send_inline` на `capital::onexpreport(wip_project_hash, amount)`. Capital сам решает, как зачесть.

Если поля нет — расход просто закрывается, никакой капитализации.

**Двусвязности нет:** `expense` ничего не знает про `capital::programs`. Он только дёргает action по имени, если ему передали хэш проекта.

## 6. Универсальный поток

```
1. UI собирает СЗ. Выбор источника (UI dropdown → BLAGOROST_FUND / SOV_EXPENSES / ...).
2. UI определяет operation_code по матрице (source × mechanic):
     BLAGOROST_FUND + ADVANCE → o.exp.blgadv
     BLAGOROST_FUND + DIRECT  → o.exp.blgdir
     SOV_EXPENSES + DIRECT    → o.exp.sovdir (будущее)
3. expense::payexp(proposal_hash, item_hash, operation_code, amount, ?wip_project_hash)
4. Контракт валидирует: operation_code ∈ OPERATION_REGISTRY, process_type == p.exp.proposal.
5. Контракт зовёт ledger2::apply(operation_code, sum, from?, to?). Реестр сам подставляет правильные wallets и Dr/Cr.
6. Для ADVANCE — фронт пайщика прикладывает чек → expense::reportexp → o.exp.advrpt.
7. Для DIRECT — backend сразу после payexp вызывает reportexp (внутренне, без UI).
8. Если в payload есть wip_project_hash — после reportexp inline action в capital.
```

Контракт `expense` агностичен:
- к **источнику** (передаётся operation_code, который сам несёт `wallet_from` в реестре);
- к **программе-получателю** (передаётся `wip_project_hash` в payload, опционально);
- к **бухгалтерским счетам** (выводятся из реестра по operation_code).

## 7. Acceptance Criteria для C28-28 v2

- [ ] §1 ack: контракт `expense` (ед.ч.).
- [ ] §2 ack: 60/71 не вводим, используем существующие 04/08/51/58/80/86.
- [ ] §3 ack: 5 op-кодов в реестре (`o.exp.blgadv`, `o.exp.blgdir`, `o.exp.advrpt`, `o.exp.advret`, `o.exp.over`); хозрасходы (sov-источники) — отдельный эпик.
- [ ] §4 ack: один новый кошелёк `w.exp.adv` USER_SHARED; `w.exp.sup` отменён; `w.mkt.payout` не трогаем.
- [ ] §5 ack: capital trigger — payload-флаг `wip_project_hash`, не отдельная операция.
- [ ] §6 ack: контракт универсальный, operation_code определяется фронтом/backend при сборке СЗ.

## 8. Открытые точки на ack

1. **`w.exp.adv` USER_SHARED.** Подотчётные числятся на пайщике-получателе (зеркало `w.wal.wpend`). OK?
2. **`o.exp.advrpt` без Dr/Cr (0/0, WalletOp::BURN).** Проводка уже сделана на момент `blgadv`/`blgdir`. При отчёте только BURN кошелька — без двойного учёта. OK?
3. **Capital trigger через payload `wip_project_hash`, не отдельный operation_code.** OK?
4. **Минимум 5 кодов сейчас (только Благорост).** Хозрасходы из членских (`o.exp.sov*`) — отдельный эпик после MVP. OK?

---

## 9. Roadmap после ack

1. C28-28 → C++:
   - `accounts.hpp` — без изменений
   - `wallets.hpp` — `+w.exp.adv`
   - `processes.hpp` — `+p.exp.proposal`
   - `operations.hpp` — `+5 entries` в `OPERATION_REGISTRY[]` под namespace `operations::expense`
2. CI-тест `ledger2_actions_registry_test` — ожидать 5 новых кодов.
3. `pnpm -w build` cooptypes — auto-regen enum `OperationCode`.
4. C28-29 расшивается на ledger2-инструкции (имена операций ↔ имена C++ actions контракта).
5. C28-31 backend `expense` extension использует cooptypes enums.
