# Native extensions → Apps Catalog: research-доклад

Документ выполнен на ветке `apps-catalog` от `dev` в mono. Цель — спроектировать **гармоничную** интеграцию каталога приложений (apps-catalog: ca-auth/ca-admin/Nexus + on-chain контракт `apps`) в существующий монолит, **не ломая** сегодняшнюю модель native-extensions (capital/chairman/chatcoop/participant/powerup/reports/soviet).

Документ — план, не реализация. Stories 1.3–1.12 продолжатся в apps-catalog репозитории отдельно.

## 0. Контекст и стейкхолдер

- Пользователь хочет: 7 текущих native extensions **продолжают работать как есть** (bundle, in-memory installer), но **появляются в магазине** как «уже установлено». Новые extension'ы постепенно вытаскиваются из bundle и устанавливаются динамически через каталог по платной/бесплатной модели.
- Чисто заменять одно на другое («ломая всё») запрещено.
- В исследовании надо найти **минимальный шов**, который позволит сосуществовать `bundle` и `remote` режимам.

## 1. As-is: что сейчас в mono

### 1.1. Frontend (desktop)

```
components/desktop/extensions/
├── capital/install.ts        ← IWorkspaceConfig[]
├── chairman/install.ts
├── chatcoop/install.ts
├── participant/install.ts
├── powerup/install.ts
├── reports/install.ts
└── soviet/install.ts
```

- Каждый `install.ts` — экспорт `default async () => IWorkspaceConfig[]`, где `IWorkspaceConfig` = `{ workspace, extension_name, title?, icon?, defaultRoute?, routes }` (`components/desktop/src/shared/lib/types/workspace.ts:24`).
- Bundle-time registry: `components/desktop/src/processes/init-installed-extensions/extensions-registry.ts` импортирует все 7 install-функций и кладёт в `Record<string, () => Promise<IWorkspaceConfig[]>>`.
- Process: `useInitExtensionsProcess(router)` (`processes/init-installed-extensions/index.ts:6`) на старте SSR-приложения вызывает **все** install-функции последовательно и пушит их routes в `desktopStore` + Vue Router. Никаких «не показывать» — все 7 столов всегда зарегистрированы в bundle.
- Видимость столов конкретному кооперативу / роли — отдельный слой (см. backend grants ниже + `meta.roles`/`meta.conditions` в IWorkspaceRoute).

**Существующий UI «магазин»:**
- `components/desktop/src/pages/ExtensionStore/{BaseRoute, ExtensionPage, ExtensionsManagement, ExtensionsShowcase, InstalledExtensions}` — UI для просмотра/«управления» доступными расширениями кооператива. Данные подтягивает из coopback (AppRegistry → GraphQL).
- `components/desktop/src/pages/Marketplace/*` — это **Стол заказов** (Marketplace MVP, другое), путать нельзя.

### 1.2. Backend (controller / coopback)

- `components/controller/src/extensions/extensions.registry.ts` — `AppRegistry: INamedExtension` хардкодит NestJS-модули всех расширений (`soviet`, `chairman`, `capital`, `chatcoop`, `participant`, `powerup`, `reports`, `1ccoop`, `qrpay`, `sberpoll`, `yookassa`, `builtin`).
- Поля `IRegistryExtension`: `is_builtin`, `is_internal`, `is_available`, `desktops`, `external_url`, `title`, `description`, `image`, `class` (NestJS-модуль), `pluginClass` (миграции), `schema` (Zod конфига), `tags`, `readme`/`instructions` (async чтение README/INSTALL.md из директории).
- Концептуально это уже **полу-«пакетная»** модель: есть метаданные пакета, бинарь (тут — компилируемый внутрь monorepo), миграции, конфиг-схема. Просто всё in-process, без выгрузки и pull-tarball.
- Видимость и онбординг столов решает слой grants (см. memory `reference_extension_onboarding_gating`): backend через `getDesktop` отдаёт `DesktopWorkspace.grants`, фронт сверяет `meta.requires`.

### 1.3. On-chain (apps contract)

- Развёрнут в подсетях, в которых живёт Mono (на mono-ai-5 — chain_id `db79c84096…`). 17 actions / 8 tables — pricing, releases, subs, packages, coops, clients, globals.
- Source of truth для **внешнего** каталога; native extensions on-chain пока не существуют.

### 1.4. Apps-catalog (внешний сервис)

- Репозиторий `C9S/apps-catalog`, ветка `dev`. ca-auth (npm-pull-proxy) + ca-admin (publisher control) + Nexus + Postgres. Связь с mono — через `KE_RPC_URL=node:8888` и `MONO_BACKEND_URL=coopback:2998` (docker DNS `mono-shared` сеть).
- Концепция: tenant-кооператив (`romashka`, `voskhod`) → подключается → подписывается на пакет → ca-auth раздаёт tarballs из Nexus только когда on-chain `subs[tenant][package]` активна.

## 2. To-be: целевая модель

Цель — **два класса пакетов** в одном каталоге, разделённые по типу доставки:

| Класс | Доставка | Жизненный цикл | Примеры |
|---|---|---|---|
| **bundle** | Компилируется в SSR-bundle desktop'а / NestJS-модуль coopback'а. Не качается из Nexus. | Версия = версия mono. Обновляется через `git pull && pnpm build`. | Сегодняшние 7 native: soviet, chairman, capital, … |
| **remote** | tarball в Nexus → ca-auth pull-proxy → dynamic import. NestJS-модуль динамически грузится в coopback. | Версия = `setrelease` on-chain. Обновляется без передеплоя mono. | Будущие: новые специализированные столы, форки текущих, частные пакеты кооперативов. |

**Каталог отображает оба класса одинаково** в UI (`ExtensionStore`); внутри строки пакета — поле `kind: bundle | remote`. Для `bundle` кнопка «Установить» скрыта/заменена на «Уже установлено», для `remote` — реальный install-flow через подписку + pull.

## 3. Промежуточный слой совместимости (dual mode)

### 3.1. Регистрация bundle-пакетов в каталоге как «pre-installed»

**Минимальный шов** на стороне apps-catalog:
- Добавить на on-chain контракт `apps` (или в admin-проекцию ca-admin) **флаг bundle** или отдельную таблицу `bundled_packages[coopname, package_id, mono_version]`. Запись означает: «этот кооператив получает пакет в составе bundle Mono, в каталоге показываем как already-installed, подписки не требуем».
- ca-auth при запросе на pull проверяет: bundle → отказ с понятной ошибкой (или редирект на «уже встроено»).

**Источник истинности — каталог**, не Mono:
- Mono при старте `useInitExtensionsProcess` помимо bundle-загрузки **посылает в ca-admin** список своих bundled-пакетов (POST `/v1/admin/bundled-packages/sync` с api-key или mTLS).
- ca-admin записывает их с `kind='bundle'` и `compatible_subnets=[mono.chain_id]`.

**Регистрация bundle-пакетов в каталоге** — однократная (idempotent на mono_version + chain_id), не требует Nexus-репозитория.

### 3.2. Маркировка native extension'ов в коде

В каждом из 7 extension'ов завести **manifest-файл** (mirror к [apps-catalog/libs/core/manifest/package-manifest.schema.ts](../../../../apps-catalog/libs/core/manifest/package-manifest.schema.ts)):

```jsonc
// components/desktop/extensions/soviet/package.json
{
  "name": "@coopenomics/soviet",
  "version": "0.1.0",
  "catalog": {
    "kind": "bundle",
    "title": "Стол Совета",
    "icon": "fa-solid fa-gavel",
    "workspaces": ["soviet"],
    "roles": ["chairman", "member"],
    "mono_min_version": "0.0.0"
  }
}
```

Скрипт `tools/sync-bundled-packages.ts` собирает все 7 manifest'ов + chain_id + mono version → POST в ca-admin.

### 3.3. Динамическая загрузка (для remote-класса)

**Frontend:**
- Расширить `extensionsRegistry` чтобы значения могли быть `() => Promise<IWorkspaceConfig[]>` (как сейчас, bundle) **или** `{ kind: 'remote', tarballUrl, version }` — резолвер сам качает tarball через ca-auth proxy, распаковывает в Quasar Boot-script хранилище, dynamic-import'ит `install.ts` из распакованного бандла, кэширует.
- Vue Router добавление routes остаётся то же (`router.addRoute('base', r)`).

**Backend (coopback):**
- Аналогично — `extensions.registry.ts` принимает динамические записи. При первом запросе кооператива на remote-package coopback:
  1. Через `MonoBackendPort` (либо прямой HTTP к ca-auth) проверяет подписку on-chain.
  2. Качает tarball через ca-auth (с JWT кооперативного backend'а).
  3. Распаковывает в `/var/lib/coopback/extensions/<package>@<version>/`.
  4. `dynamic import` ESM-модуля; регистрирует Module через NestJS dynamic module pattern (тот же паттерн, что у текущих PluginModule).

**Изоляция:** для безопасности — sandbox через VM2/Workers или хотя бы хеш-проверку tarball'а (Nexus отдаёт SHA-256, on-chain `releases` фиксирует ожидаемый hash).

### 3.4. Coexistence rules

- Один и тот же `package_id` не может одновременно быть `bundle` и `remote` для одного кооператива. Если on-chain появилась подписка на `@coopenomics/soviet` (remote), а в bundle есть тот же package_id — **bundle wins** до явного выключения через `bundled_packages.disabled_at`.
- Когда extension мигрирует из bundle → remote (см. п. 4): сначала выпускается `remote` версия в каталог, тестируется на одном пилоте, потом `disabled_at` ставится в `bundled_packages` Mono'а, и bundle-fallback гасится.

## 4. План миграции по extension'ам (поштучно)

| Extension | Сложность | Зависимости | Кандидат №… |
|---|---|---|---|
| **chatcoop** | низкая — изолированный чат-стол, минимум интеграции с core | core ws-bridge, member-info | **№1 (пилот)** |
| **reports** | низкая-средняя — read-only отчёты | analytics endpoints | №2 |
| **powerup** | средняя — затрагивает ledger | wallet | №3 |
| **chairman** | высокая — связан с onboarding + agreements | grants, agreements | №4 |
| **soviet** | высокая — управление повесткой совета, on-chain actions | proposals, agreements | №5 |
| **participant** | высокая — base extension для пайщика | accounts | №6 |
| **capital** | максимальная — финансовые операции, capital_issues | ledger2, time-tracking | №7 (последний) |

Каждая миграция = отдельная story в apps-catalog репозитории (Epic 9 в дополнении), parallel — story в mono (вытаскивание extension'а в отдельный pnpm-workspace пакет + tarball-сборка через `pnpm publish` в Nexus).

## 5. Bootstrap-пакет

Для подтверждения трубы — `@voskhod/test-app`:
- Сегодня уже зарегистрирован через POST `/v1/admin/package` (smoke-стенд, request_id `98b1d8ac-…`).
- В рамках Bootstrap-стори:
  - Сгенерировать минимальный tarball (1 page, 1 route) с `package.json` манифестом.
  - `npm publish --registry=http://ca-auth:3001/v1/registry/` (с tenant JWT кооператива voskhod).
  - `apps::setrelease` on-chain.
  - Проверить, что desktop'у через `loadExtensionRoutes('@voskhod/test-app')` action раздаёт routes из remote tarball.

Bootstrap не претендует на «настоящий» сценарий — это инфра-проверка трубы для последующей реальной миграции (Кандидат №1 = chatcoop).

## 6. Открытые вопросы

1. **Где живёт `package_id` для bundle?** Предложение: `@coopenomics/<name>` (org scope = монорепозиторий). Если кооператив хочет форкнуть — он публикует под своим scope `@voskhod/<name>` с другим bundle'ом.
2. **Можно ли остановить bundle-загрузку extension'а в Mono per кооператив?** Сегодня bundle грузится всегда; видимость регулируется backend grants. То есть мы можем ВЫПИЛИВАТЬ extension из bundle и заменить на remote — но не для одного кооператива из десяти. Возможный путь — feature-flag через ENV на инстансе mono (один Mono = один кооператив сегодня).
3. **Sandbox для remote-модулей.** Без изоляции remote-extension с правами NestJS-модуля = админ-доступ к coopback. Нужен или подписанный паблишер (allowlist on-chain `apps::pubpub`), или VM2-sandbox, или статический анализ tarball'а перед запуском.
4. **Миграции схемы БД для remote-extension.** Сегодня `pluginClass.runMigrations(schema)` запускается на старте монолита. Для remote — нужен hook на «новый extension установлен» с автоматическим прогоном миграций. Open question: что если миграция падает? Откат subscription on-chain невозможен (releases immutable).
5. **Версия Mono ↔ совместимость extension'а.** `catalog.mono_min_version` в манифесте; ca-admin при `setrelease` проверяет совместимость с активной mono_version подсетей `compatible_subnets`.
6. **UX миграции для уже-установленных native.** Когда extension переезжает bundle → remote, пользователь должен:
   - Увидеть в каталоге, что обновлена доставка (info badge «теперь обновляется отдельно»).
   - НЕ потерять данные / config (миграция identifiers in БД).
   - Иметь fallback на bundle, если remote tarball недоступен (offline mode).

## 7. Что НЕ входит в этот research

- Конкретный код миграции какого-либо extension'а (это будут отдельные stories).
- Решение об IDE/sandbox/изоляции — это отдельное исследование безопасности.
- Дизайн UI «магазина» в ExtensionStore (мы переиспользуем существующие страницы, только добавляем kind/version поля).
- Pricing / биллинг внутри Mono — каталог уже это решает (контракт apps + ca-admin).

## 8. Следующие шаги (порядок)

1. **Bootstrap-пакет @voskhod/test-app** — закрыть инфра-проверку.
2. **Manifest для одного native extension'а (chatcoop)** в mono — добавить `package.json` с `catalog.kind=bundle`.
3. **POST /v1/admin/bundled-packages/sync** — endpoint в apps-catalog (новый, добавляется в Epic 9).
4. **Скрипт `tools/sync-bundled-packages.ts`** в mono — собирает 7 manifest'ов и шлёт в ca-admin.
5. **Поле `kind` в pages/ExtensionStore** — рендерит "уже установлено" для bundle, "Подписаться" для remote.
6. **Миграция chatcoop bundle → remote** — pilot story (отдельная ветка от apps-catalog в mono).

Каждый шаг = отдельный коммит в зонтичной ветке `apps-catalog` mono'а + parallel story в apps-catalog репо (Epic 9 «Bundle/remote coexistence»).
