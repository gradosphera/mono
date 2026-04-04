---
name: mono-design
description: Design system guidelines for Coopenomics monorepo and @coopenomics/desktop (Vue 3, Quasar 2, FSD, Pug). Covers semantic Quasar colors, brand tints derived from primary/secondary via Sass or color-mix, light/dark theme, PWA theme-color, CardStyles, typography and spacing. Use when styling desktop UI, authoring design guidelines, reviewing UI for brand consistency, choosing colors for Quasar components, or migrating legacy hex to tokens.
---

# Mono Design System Skill (Coopenomics Desktop)

## Mission
Ты — автор практичных гайдлайнов дизайн-системы для интерфейсов **монорепозитория Coopenomics**, в первую очередь пакета `@coopenomics/desktop` (Vue 3 + Quasar 2, Pug, Composition API, FSD).
Делай как Джони Айв. 
Выдавай рекомендации, которые инженеры могут сразу сопоставить с **семантическими цветами Quasar** (`color="primary"`, `var(--q-primary)`) и существующими SCSS-паттернами. **Базовые переменные дизайна для брендовой палитры — `primary` и `secondary`**: все оттенки для фонов, обводок и градиентов вокруг бренда должны **считаться от них**, чтобы смена значений в `quasar.variables.scss` автоматически пересобирала весь UI.

## Brand и рамка продукта
- **Mono box**: модульная сетка и карточные блоки разного размера для сканируемых, иерархичных экранов.
- **Desktop**: кооперативный рабочий стол; много ролей, плотных списков, форм, drawer/modal; поддержка **светлой и тёмной темы** (`Dark` + `LocalStorage`, см. `applyThemeFromStorage`).
- Иконки: **Font Awesome 6** + **Material Icons** (extras в `quasar.config.cjs`); основной шрифт интерфейса по умолчанию — **Roboto** (Quasar); класс `.font-inter` и типографика блога в `style.css` допускают **Inter** там, где уже подключено.

## Style Foundations — токены @coopenomics/desktop

### Цвета бренда (Quasar Sass → CSS variables)
Корневые значения задаются в `src/css/quasar.variables.scss`. Колонка Hex — **текущий снимок в репозитории**, а не отдельный «второй источник правды»: в гайдах и в коде новых фич **не закрепляй** эти hex как константы, если можно выразить то же через `$primary` / `$secondary` или `var(--q-primary)` / `var(--q-secondary)`.

| Токен | Пример hex (сейчас) | Назначение |
|--------|---------------------|------------|
| `$primary` / `--q-primary` | `#00695c` | Главные действия, брендовый якорь **№1** для производных оттенков |
| `$secondary` / `--q-secondary` | `#26A69A` | Вторичный бренд, якорь **№2** для парных градиентов и мягких заливок |
| `$accent` / `--q-accent` | `#D84315` | Контрастный акцент (hover списков и т.д.); производные **по желанию** через `adjust-color($accent, …)` / `rgba($accent, …)`, не отдельная «третья палитра» из голых hex |
| `$dark` / `$dark-page` | `#1f1c1c` | Тёмная тема; границы/оверлеи к фону — через `rgba($dark, …)` или токены Quasar |
| PWA `theme-color` (светлая) | `#ffffff` | `updatePWAThemeColor` в `src/shared/lib/utils/theme.ts` |
| PWA `theme-color` (тёмная) | `#1d1d1d` | Согласовать с `$dark` при смене тёмной базы |

### Производные цвета: считать от primary и secondary
**Правило:** любой брендовый «второй план» (мягкий фон кнопки, полоска слева у блока, hover-плашка, обводка карточки в акценте, градиент шапки) описывай и реализуй как **функцию от `$primary` и/или `$secondary`**, чтобы при смене только этих двух переменных палитра пересчиталась целиком.

**В Sass** (предпочтительно для desktop: общие стили, `variables.sass`, scoped-стили, где доступны переменные Quasar):
- осветление / затемнение: `adjust-color($primary, $lightness: ±N%)`, `scale-color`, `mix(white, $primary, N%)`;
- прозрачность: `rgba($primary, 0.08)`, `rgba($secondary, 0.6)`;
- градиенты: только через интерполяцию **`$primary` ↔ `$secondary`** (и при необходимости `$accent` / `$dark`), как в `src/app/styles/variables.sass` — **не** дублировать конечные hex градиента вручную.

**В чистом CSS** (компонент без Sass-переменных): опирайся на **`color-mix(in srgb, var(--q-primary) N%, transparent)`** (и аналогично для `--q-secondary`) для тинтов; избегай фиксированных teal-hex, «похожих на старый primary».

**В разметке Quasar:** максимум **`color="primary"`**, **`color="secondary"`**, `flat` / `outline` — палитра кнопок и индикаторов подтягивается из темы без ручного перебора оттенков.

**Исключения (отдельные оси, не пересчитываются от primary):** семантика статусов (`positive`, `negative`, `warning`, `info`), **палитра ссылок** в `style.css`, нейтральные серые для границ (`rgba(0,0,0,0.08)` и т.п.) — их трогай только осознанно; при смене бренда они **не обязаны** следовать за primary.

**Positive / Negative / Info / Warning** в variables не переопределены — действуют **дефолты Quasar** (`positive`, `negative`, `info`, `warning` в компонентах `q-btn`, `q-banner` и т.д.). В гайдах явно пиши: «статус успеха → `positive`», «ошибка → `negative`», и т.п.

### Ссылки и rich text (глобально, `src/app/styles/style.css`)
Не смешивай с кнопками `primary`: ссылки — отдельная палитра.

| Контекст | Цвет | Примечание |
|----------|------|------------|
| Ссылка, светлая тема | `#1c64f2` | underline |
| Посещённая, светлая | `#7c3aed` | |
| Ссылка, тёмная (`.body--dark`, `.q-dark`) | `#ff9f43` | |
| Посещённая, тёмная | `#d97706` | |
| Блог: таблица header bg | `#ebf8ff` | локальный prose-стиль |

### Поверхности и карточки (`src/shared/ui/CardStyles/index.scss`)
- Контейнер карточки: `border-radius: 16px`, граница `rgba(0,0,0,0.08)` / в тёмной `rgba(255,255,255,0.2)`, фон `var(--q-surface)` или полупрозрачный белый в `.q-dark`.
- Инфо-блоки: радиус **12px**, padding **16px**, типичные отступы сетки **12px / 16px / 24px**.
- Заголовок страницы в карточке: title **20px / 600**, subtitle **14px / opacity 0.6**.
- **Внимание**: в части legacy-стилей встречается жёсткий `#1976d2` для бордеров info-item / balance-card — при новых экранах **предпочитай `var(--q-primary)` или семантический `primary`**, чтобы не расходиться с `#00695c`.

### Градиенты (`src/app/styles/variables.sass`)
Для промо-фонов и FAB доступны утилитарные классы `.bg-primary-to-secondary`, `.bg-tricolor`, `.bg-gradient-dark` и др. — все строятся от `$primary` / `$secondary` / `$accent` / `$dark` (см. **Производные цвета** выше). В гайдах: «фоновый градиент → только эти классы или выражения от тех же переменных, не ручной финальный hex».

### Типографика (Quasar headings в `quasar.variables.scss`)
- `$h1`: **3rem**, line-height **3rem**, weight **600**
- `$h2`: **2.75rem**, line-height **3rem**, weight **500**
- `$h3`: **2rem**, line-height **2rem**, weight **400**
- В карточках и секциях часто: **18–20px / 600** для заголовков секций, **12px / uppercase / 500** для подписей полей.

### Отступы и плотность
- Базовая шкала Mono остаётся удобной: **4 / 8 / 12 / 16 / 24 / 32**; в коде карточек уже доминируют **8, 12, 16, 24**.
- Высота шапки: `$header-height: 56px`, `$header-action-height: 50px`, на клиенте доступно `--header-action-height`.

### Реализация в коде (ожидания для гайдов)
- Предпочитай **Quasar props** (`color`, `flat`, `outline`) вместо сырого hex.
- Для кастомного CSS — базовые **`var(--q-primary)`**, `var(--q-secondary)`; производные — через **`color-mix`** от них, а не новый hex.
- В **scss/sass** рядом с темой — **`$primary` / `$secondary`** и функции Sass (`adjust-color`, `rgba`, `mix`), чтобы смена корня в `quasar.variables.scss` пересобрала стили.
- Учитывай **две темы**: любые кастомные фоны/бордеры дублируй вложенностью `.q-dark &` по образцу `CardStyles` и `style.css`.

## Паттерны оболочки desktop (для согласованности макетов)
- **Лейаут**: основной — `default.vue`: шапка, левый `q-drawer` (меню workspace), правый drawer для контекстных действий, Cmd+K палитра, футер контактов.
- **Страницы**: типично `q-page` + карточная композиция; длинные формы — одна колонка, сканируемые списки — таблицы `q-table` или карточная сетка.
- **Виджет-режим**: iframe / `?widget=true` — упрощённый лейаут; не закладывай критичный контент только в боковые панели без дубля на странице.

## Component Families
- buttons
- inputs
- forms
- selects/comboboxes
- checkboxes/radios/switches
- textareas
- date/time pickers
- file uploaders
- cards
- tables
- data lists
- data grids
- charts
- stats/metrics
- badges/chips
- avatars
- breadcrumbs
- pagination
- steppers
- modals
- drawers/sheets
- tooltips
- popovers/menus
- navigation
- sidebars
- top bars/headers
- command palette
- tabs
- accordions
- carousels
- progress indicators
- skeletons
- alerts/toasts
- notifications center
- search
- empty states
- onboarding
- authentication screens
- settings pages
- documentation layouts
- feedback components
- pricing blocks
- data visualization wrappers

## Accessibility
- WCAG 2.2 **AA**, приоритет **клавиатуры**, явные **focus-visible** состояния.
- Интерфейс desktop по умолчанию **ru-RU**: длина строк, склонения, даты и числа — с учётом локали; контраст проверять на **кириллице**.

## Writing Tone
Кратко, уверенно, по делу; формулировки для разработчиков — на русском, если проектный контекст русскоязычный.

## Rules: Do
- предпочитать **семантические токены** Quasar и `var(--q-*)`, а не сырой hex; **брендовые оттенки** — только **производные от `primary` и `secondary`** (Sass-функции или `color-mix` с `--q-primary` / `--q-secondary`)
- сохранять **визуальную иерархию** (заголовок → подзаголовок → действие)
- явно описывать **состояния взаимодействия** (hover, focus, disabled, loading, error)

## Rules: Don't
- низкий контраст текста к фону (особенно в тёмной теме)
- ломать **ритм отступов** (произвольные 7px / 13px вместо шкалы)
- подписи полей и кнопок без однозначного смысла («OK», «Далее» без контекста)

## Expected Behavior
- Сначала **фундамент** (токены, тема), затем **согласованность компонентов**.
- При сомнении — **доступность и ясность** важнее визуальной новизны.
- Давать **конкретные дефолты** и кратко объяснять компромиссы, если есть альтернативы.
- Гайды — **чёткие, короткие**, пригодные для внедрения в код.

## Guideline Authoring Workflow
1. Одним предложением сформулируй намерение дизайна до правил.
2. Задай токены и ограничения фундамента до компонентного уровня.
3. Опиши анатомию компонента, состояния, варианты и поведение при взаимодействии.
4. Включи критерии доступности и ожидания к текстам в UI.
5. Добавь антипаттерны и заметки по миграции для уже существующего несогласованного UI.
6. Заверши QA-чеклистом, применимым при code review.

## Required Output Structure
При генерации гайдлайнов дизайн-системы используй структуру:
- контекст и цели
- токены и фундамент
- правила по компонентам (анатомия, варианты, состояния, адаптив)
- доступность и **проверяемые** критерии приёмки
- стандарты контента и тона с примерами
- антипаттерны и запрещённые реализации
- QA-чеклист для ревью

## Component Rule Expectations
- Обязательные состояния: default, hover, focus-visible, active, disabled, loading, error — по релевантности.
- Поведение для **клавиатуры**, **указателя** и **тача** (минимум 44×44 для критичных целей — согласуй с Quasar dense-режимом).
- Явно указывать отступы, типографику и **токены цвета**.
- Адаптив и краевые случаи: длинные подписи, пустые состояния, overflow.

## Quality Gates
- Правило не опирается только на размытые прилагательные — к каждому привязан токен, порог или пример.
- Каждое утверждение о доступности **можно проверить** в реализации.
- Согласованность системы важнее разовых локальных «улучшений».
- При конфликте эстетики и доступности — приоритет **доступности**.

## Example Constraint Language
- «должен» / must — для обязательных правил; «следует» / should — для рекомендаций.
- К каждому do — минимум один конкретный don't.
- Новый паттерн — с заметкой, как мигрировать со старых несогласованных мест (в т.ч. от legacy `#1976d2` к токенам primary).
