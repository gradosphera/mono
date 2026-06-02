# Expenses · E2E Golden Path (C28-34)

**Статус:** scaffold-stub. На момент создания в `components/desktop/` нет e2e-фреймворка (ни Cypress, ни Playwright — `grep cypress|playwright` по package.json пусто). Документ фиксирует план сценариев и матрицу assertions; реальные spec'и пишутся после закрытия [C28-28..C28-33] и развёртывания e2e-инфраструктуры в desktop.

## 0. Прежде чем писать spec'и

1. Согласовать с пользователем выбор фреймворка (Cypress vs Playwright). Канон `feedback_kanon_naming_soglasovyvat`: спрашивать ДО реализации.
2. Завести `components/desktop/test-e2e/` (или `cypress/`/`tests/e2e/`), подключить через quasar config / package.json scripts.
3. Добавить `pnpm test:e2e` в корне (требование Acceptance Criteria из C28-34).
4. Завести fixture-кооператив `voskhod-e2e` с предзаведёнными ролями: `igor` (chairman), `master` (chairman, отдельная личность для Journey B), `svetlana` (member).
5. Завести seed для `BLAGOROST_POOL` (capital::topupprogexp на достаточную сумму).

## 1. Journey A — DIRECT-оплата организации

**Контекст:** Игорь (председатель) платит Yandex Cloud из BLAGOROST_POOL.

| Шаг | Actor | Действие | Ожидание |
|---|---|---|---|
| 1 | `igor` | login → `/voskhod/expenses` → «Создать расход» | dialog открыт |
| 2 | `igor` | items: `[{amount: 8000, description: 'Yandex Cloud, май 2026', mechanics: 'DIRECT', payee: 'Yandex Cloud LLC', requisites: {...}}]`, source=`BLAGOROST_POOL` | форма валидна |
| 3 | `igor` | submit | proposal.status = `created`, СЗ document2 type=2010 в реестре |
| 4 | `igor` | подписать СЗ (2010, signact1) | document2 signed_by_first=true |
| 5 | `council[]` | mock authorize (signact2) | proposal.status = `authorized`, document2 type=2011 |
| 6 | `igor` | `/voskhod/expenses/cashier`, таб «Готово к оплате» | строка видна |
| 7 | `igor` | «Оплатил» → upload платёжки (2012) | item.status = `paid`, ledger2 op = `DIRECT_PAYMENT` (Д60 К51) |
| 8 | `igor` | для DIRECT-механики backend сразу делает `reportexp` (фон, без UI) | proposal.status = `reporting`, ledger2 op = `ADVANCE_REPORTED` (Д08 К60) |
| 9 | `igor` | submit СЗ-отчёт (2013) | proposal.status = `report_submitted` |
| 10 | `council[]` | authorize (2014) | proposal.status = `closed` |

**Ledger2 assertions (по hash расхода):**
- `DIRECT_PAYMENT` × 1, amount=8000, Д60 / К51
- `ADVANCE_REPORTED` × 1, amount=8000, Д08 / К60

**Document2 assertions:**
- type=2010 (СЗ-смета), signact1=igor, signact2=<council>
- type=2011 (протокол-1 авторизации)
- type=2012 (платёжное поручение, attached_files=[receipt])
- type=2013 (СЗ-отчёт), signact1=igor
- type=2014 (протокол-2 закрытия)

## 2. Journey B — ADVANCE другому пайщику

**Контекст:** мастер оформляет 2 аванса (себе + Светлане).

| Шаг | Actor | Действие | Ожидание |
|---|---|---|---|
| 1 | `master` | login → «Создать расход» → items: `[{amount: 5000, description: 'Сбер-кабинет', mechanics: 'ADVANCE', recipient: 'self'}, {amount: 3000, description: 'Light Lab', mechanics: 'ADVANCE', recipient: 'svetlana'}]`, source=BLAGOROST_POOL | форма валидна |
| 2 | `master` | submit + signact1 | proposal.status = `created` |
| 3 | `council[]` | authorize | proposal.status = `authorized` |
| 4 | `cashier` | `/voskhod/expenses/cashier`, оплатить item(a) → 2012 | item(a).status = `paid`, notification → master |
| 5 | `cashier` | оплатить item(b) → 2012 | item(b).status = `paid`, notification → svetlana |
| 6 | `master` | login → `/voskhod/expenses/my/advances` → item(a) → «Приложить чек» (FileUploader → MinIO → `reportexp`) | item(a).status = `reported` |
| 7 | `svetlana` | login → `/voskhod/expenses/my/advances` → item(b) → чек → reportexp | item(b).status = `reported` |
| 8 | `master` | submitreport (2013) | proposal.status = `report_submitted` |
| 9 | `council[]` | authorize (2014) | proposal.status = `closed` |

**Ledger2 assertions:**
- `ADVANCE_PAYOUT` × 2 (5000 для master, 3000 для svetlana), Д71 / К51
- `ADVANCE_REPORTED` × 2, Д08 / К71

**Document2 assertions:**
- type=2010, items=2
- type=2011
- type=2012 × 2
- expense_files (MinIO) × 2 (чеки от master и svetlana)
- type=2013, type=2014

## 3. Common helpers

```ts
// cy.task / page.evaluate стороне
// 1. loginAs(account: 'igor' | 'master' | 'svetlana')
// 2. seedBlagorostPool(amount: number)
// 3. mockCouncilAuthorize(proposal_hash: string)
// 4. fixturePaymentSlip(): File   // 2012
// 5. fixtureReceipt(): File       // expense_file
// 6. assertLedgerOp({ action_code, amount, debit, credit })
// 7. assertDocument2({ type, signed_by, ... })
```

## 4. Performance gates

- Каждый сценарий ≤ 3 мин на CI runner (Acceptance Criteria).
- Локально `pnpm test:e2e` запускает оба сценария параллельно (если фреймворк поддерживает) или последовательно с reuse-session.

## 5. Зависимости (порядок написания spec'ов)

| # | Должно быть зелёным до старта C28-34 |
|---|---|
| C28-28 | ledger2 action-codes зарегистрированы (иначе assertion `DIRECT_PAYMENT`/`ADVANCE_PAYOUT`/`ADVANCE_REPORTED` падает) |
| C28-29 | контракт `expenses` + capital trigger |
| C28-30 | ✅ document2 2010/2011 (готово); нужны ещё 2012/2013/2014 (отдельные тикеты, не входят в C28-30) |
| C28-31 | backend GraphQL — без него Cypress не получит данные для assertion |
| C28-32 | UI расшит (страницы из stub'а → реальные таблицы/формы) |
| C28-33 | Notification Center подключён к 9 событиям шасси |

## 6. Когда расшивается C28-34

1. Получить ack на выбор фреймворка (Cypress vs Playwright).
2. Поднять test-e2e инфраструктуру в desktop (config, runner, fixtures, helpers).
3. Перенести §1 и §2 в spec-файлы:
   - `test-e2e/expenses/journey-a-direct.cy.ts` (или `.spec.ts`)
   - `test-e2e/expenses/journey-b-advance.cy.ts`
4. Завести seed-фикстуру `voskhod-e2e` с тремя аккаунтами + пул.
5. CI workflow `e2e-expenses` в Gitea-runner (DinD), артефакт — видеозаписи (на падении).
6. Прогон в CI на каждый PR в `dev`.
