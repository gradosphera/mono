# Expenses Extension — UI шасси расходов (C28-32)

**Статус:** scaffold-stub (route map + page placeholders). Реализация ждёт C28-31 (backend GraphQL + SDK Zeus types).

## Скоуп расширения

Desktop UI для **шасси системы расходов** (MVP-SINGLE) Цифрового Кооператива. Расширение наполняет 7 страниц + 1 dialog по [issue C28-32](../../../../_blago/.../C28-32...md).

## Структура страниц

| Маршрут | Компонент | Назначение | Аудитория |
|---|---|---|---|
| `/:coopname/expenses` | `ExpensesRegistryPage` | Глобальный реестр расходов с фильтрами | все |
| `/:coopname/expenses/:hash` | `ExpenseDetailPage` | Экран доказательств: document2 + expense_files + ledger2 timeline | все |
| `/:coopname/expenses/admin/approve` | `ExpensesAdminApprovePage` | Очередь «Ждут одобрения председателя» | председатель |
| `/:coopname/expenses/admin/authorize` | `ExpensesAdminAuthorizePage` | Очередь «На авторизацию совета» | председатель |
| `/:coopname/expenses/cashier` | `CashierPage` | 4 таба кассира (готово к оплате / ждут отчёта / ждут утверждения / закрыто) | председатель |
| `/:coopname/expenses/my/advances` | `MyAdvancesPage` | Мои авансы — приложить чек | пайщик |
| dialog (без маршрута) | `ExpenseProposalCreateDialog` | Форма-конструктор СЗ с массивом items | все |

## Зависимости (порядок сборки)

1. **C28-28** — P0 ledger2 коды (БЛОКИРУЕТ контракт).
2. **C28-29** — контракт `expenses` + cooptypes types.
3. **C28-30** — ✅ document2 2010/2011 (готово).
4. **C28-31** — backend extension `expenses` + GraphQL → SDK Zeus generation.
5. **C28-32** (этот модуль) — UI scaffold готов, страницы-stub; **дозаливка содержимого после C28-31**.
6. **C28-33** — интеграция Благороста.
7. **C28-34** — e2e Cypress.

## Регистрация в `extensions-registry`

**ПОКА НЕ ЗАРЕГИСТРИРОВАН** в `src/processes/init-installed-extensions/extensions-registry.ts`. Регистрация = следующий шаг после того, как:
- C28-31 закроет backend и SDK Zeus получит типы `Queries.Expenses.*` / `Mutations.Expenses.*`;
- страницы-stub получат реальный контент (вместо `<EmptyState>`).

До тех пор расширение **лежит в столе** — не ломает живой desktop, не появляется в drawer.

После C28-31 в `extensions-registry.ts` добавить:
```ts
import expensesInstall from '../../../extensions/expenses/install';
// ...
export const extensionsRegistry = {
  // ...
  expenses: expensesInstall,
};
```

## Канон вёрстки (`/home/admin/.claude/skills/mono-desktop-canon/`)

Каждая страница строится **строго** из `shared/ui/{base,domain,layout}`:

- **base:** `BaseTable`, `BaseChip`/`BaseBadge`, `BaseBanner`/`.banner--info`, `BaseDialog`, `BaseInput`, `BaseSelect`, `BaseForm`, `BaseButton`, `BaseCard`, `EmptyState`, `TableSkeleton`.
- **domain:** `<DocumentRow>`, `<DocumentSignatures>`, `<DataRow>`, `<VerticalStepper>`, `<AmountInput>`, `<FileUploader>`, `<RequisitesPicker>` (новый, под C28-32 — TBA в `shared/ui/domain/RequisitesPicker/`).
- **layout:** `<PageHead>`, `<PageTabs>`, `<AppDrawer>`.

Иконки **только Material** `q-icon`: `receipt_long`, `payments`, `construction`, `gavel`, `upload_file`. FontAwesome (`fa-*`) запрещён (отличие от capital/reports extensions, где FA — legacy).

Spacing/радиусы/цвета — токены `--p-*` и utility (`bg-primary`/`text-positive`). Никаких hex/inline px.

## Структура файлов

```
extensions/expenses/
├── README.md                                    ← этот файл
├── install.ts                                   ← IWorkspaceConfig (routes + meta)
├── index.ts                                     ← экспорты для extensions-registry
└── pages/
    ├── index.ts
    ├── ExpensesRegistryPage.vue                 ← /expenses
    ├── ExpenseDetailPage.vue                    ← /expenses/:hash
    ├── ExpensesAdminApprovePage.vue             ← /expenses/admin/approve
    ├── ExpensesAdminAuthorizePage.vue           ← /expenses/admin/authorize
    ├── CashierPage.vue                          ← /expenses/cashier
    ├── MyAdvancesPage.vue                       ← /expenses/my/advances
    └── ExpenseProposalCreateDialog.vue          ← dialog (вызывается из ExpensesRegistryPage)
```

Дальше внутри каждой страницы — стандартная FSD-структура (`api/`, `model/`, `ui/`), но **до C28-31 запрещено** добавлять `api/index.ts` с raw GraphQL — канон monorepo (`mono-ai-2/CLAUDE.md`, секция «Никаких raw GraphQL-строк в desktop»).

## GraphQL-зависимости (из C28-31)

UI-страницы будут потреблять (через SDK Zeus, после C28-31):

```ts
import { Queries, Mutations } from '@coopenomics/sdk';

// Реестр + детали
Queries.Expenses.ExpenseProposals.query    // /expenses
Queries.Expenses.ExpenseProposalDetails.query  // /expenses/:hash
Queries.Expenses.ExpenseFiles.query

// Кассир + админ
Mutations.Expenses.PayExpenseItem.mutation
Mutations.Expenses.SubmitExpenseReport.mutation
// Авторизация/отклонение СЗ — решение совета (повестка), мутаций нет
Mutations.Expenses.ReturnExpenseItem.mutation
Mutations.Expenses.UploadExpenseFile.mutation

// Создание (через capital extension, не expenses!)
Mutations.Capital.CreateProgramExpenseProposal.mutation
```

## Когда расшивается C28-31

Каждая страница-stub расшивается по списку:

1. **`ExpensesRegistryPage`** — `BaseTable` с фильтр-баром `<FilterBar>`, polling через `useDataPoller(POLL_INTERVALS.MEDIUM)`, статусы через `<BaseBadge variant>`, низ — `.table-foot` с «Загрузить ещё».
2. **`ExpenseDetailPage`** — `<PageHead>` + статус-чип, секции: проект-карточка → item-table → цепочка артефактов (`<DocumentRow>` 2010/2011 + `<FileUploader>`-показ файлов) → `<VerticalStepper>` lifecycle.
3. **`ExpensesAdminApprovePage`** / **`ExpensesAdminAuthorizePage`** — canon-таблицы со столбцом действий (одобрить/отклонить/авторизовать/декланировать). Decline-модалка: `<BaseDialog>` с `<BaseInput textarea>` для reason.
4. **`CashierPage`** — `<PageTabs>` с 4 вкладками; каждая = `BaseTable`. Действие «Оплатил, приложить чек» = `<BaseDialog>` с `<FileUploader>` (multipart → MinIO через `Mutations.Expenses.UploadExpenseFile` → следом `Mutations.Expenses.PayExpenseItem`).
5. **`MyAdvancesPage`** — `BaseTable` своих `paid AND mechanics=ADVANCE`; действие «Приложить чек» — тот же диалог что в кассире, но с `SubmitExpenseReport` на коммит.
6. **`ExpenseProposalCreateDialog`** — `<BaseDialog>` + `<BaseForm>` с массивом items, добавление/удаление item'ов через `<BaseButton>`. Per-item — `<BaseRadioCard>` для recipient_type {SELF/MEMBER/ORG}, `<BaseSelect>` для mechanics {ADVANCE/DIRECT}, `<AmountInput>` для сумм, `<RequisitesPicker>` (новый компонент в `shared/ui/domain/`) для ADVANCE-получателя.

## Ссылки

- PRD шасси: `13-platforma-tsifrovogo-kooperativa/components/14-versiya-3/requirements/f8-prd-shassi-sistemy-raskhodov-tsifrovogo-kooperativa-v12.md`
- Issue C28-32: `13-platforma-tsifrovogo-kooperativa/components/14-versiya-3/issues/C28-32-shassi-raskhodov-epik-4-ui-shassi-canon-mono-platform-v2.md`
- Канон вёрстки: `/home/admin/.claude/skills/mono-desktop-canon/` + `src/pages/_dev/ui/index.vue`
- HTML SoT: `/home/admin/blago/production/shared/MONO Design System.html`
- Backend плейн: `components/controller/src/extensions/expenses/README.md` (C28-31)
- Document2 templates: 2010 ExpenseProposalStatement, 2011 ExpenseProposalDecision (C28-30 ✅)
