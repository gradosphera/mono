---
name: blago-cli
description: |
  Синхронизация задач (issue) и требований (story) в копии Благорост через blago CLI — pull, правки, add, push, черновики create, конфликты по updated_at.
  Триггеры: blago, Capital, Благорост, issue.md, story, requirements, staging, push/pull, YAML frontmatter задач.
---

# blago CLI — задачи и требования

Корень копии: `.blago/config.json` вверх от базового каталога. База: `blago --dir <path> …` (в любом месте строки, приоритет над `BLAGO_WORKSPACE`), иначе `BLAGO_WORKSPACE`, иначе cwd. Сетевые команды — готовая сессия у оператора.

В установке путь к этому скиллу: **`…/ai/skills/cli/SKILL.md`**. Каталог **`ai/commands/`** (рядом с `skills/` в дереве `ai/`) — slash-команды и сценарии; в **`ai/skills/`** при необходимости — другие скиллы.

## Поток данных

| Действие | Команды |
|----------|---------|
| Забрать с сервера | `blago pull` |
| Увидеть staging и расхождения с индексом | `blago status`, `blago diff` |
| Пометить изменённые .md к отправке | `blago add <пути…>` (каталог — рекурсия по .md) |
| Отправить | `blago push` (только staging) |
| Убрать из staging | `blago remove <пути…>` или `blago remove --all` |
| Перезаписать файл с сервера | `blago restore <относительный-путь>` |

Цепочка после правок: `add` → `push`. `add` берёт только файлы, изменённые относительно `.blago/index.json`, и новые без записи в индексе.

## Конфликт версий

Если push падает с **другой версией на сервере (updated_at)**:

1. `blago pull`
2. Вручную свести содержимое и frontmatter с актуальным сервером (не трогать `hash` у существующих сущностей без понимания последствий)
3. `blago add …` → `blago push`

Локальный откат одного файла к серверу: `blago restore <path>`.

## Создание

| Сущность | Команда |
|----------|---------|
| Черновик задачи | `blago create issue <basePath> "<title>"` — `basePath`: каталог проекта/компонента или путь к `project.md` / `component.md` |
| Черновик требования (story) | `blago create req <basePath> "<title>"` — опции `--format markdown\|mermaid\|drawio\|bpmn` |

Черновик попадает в staging; первый `push` создаёт сущность на сервере. Опции `--set-self`, `--creators`, `--submaster` (issue) / `--set-self` (req) — см. `blago create … --help`.

## Обновление существующих

1. После `pull` править тело Markdown и допустимые поля frontmatter (см. ниже). **Поле `hash` у уже синхронизированных сущностей не менять.**
2. `blago add <файл>` → `blago push`.

Тип **result** через этот CLI не синхронизируется.

## Frontmatter (YAML между `---` в начале файла)

Общее: все сущности — Markdown + YAML; `hash` — стабильный id сущности на сервере.

### `project` — `…/project.md` или `…/component.md`

Порядок полей: `type`, `id`, `title`; у компонента сразу `parent_title`, `parent_hash`; далее `coopname`, `status`, `hash`, `created_at`, `updated_at` (ISO-8601). Тело — описание.

### `issue` — `issues/<id>-<slug>.md`

Порядок: `type`, `id`, `title`, `project_title`, `component_title`, `status`, `priority`, `estimate`, `creators`, `labels`, опционально `cycle_id`, `submaster`, затем `hash`, `project_hash`, даты. Поля `created_by` и `sort_order` в файле обычно не задаются (при push `sort_order` может уйти как 0). Тело — описание задачи.

### `story` (требование) — `requirements/<prefix>-<slug>.md` или под `issues/…/requirements/…`

`type: story`, при наличии серверного id — поле `id`; далее `title`, `hash`, `content_format` (например `MARKDOWN`), `status`, `created_by`, `sort_order`, привязка `project_hash` и/или `issue_hash`. Тело — текст требования.

## Коммиты в Git репозитория кода (не blago)

В сообщении указывать минимум: **username** участника и **hash задачи** из frontmatter issue.

Примеры: `ant CAPITAL-42 правка API`, `ant | проект x | задача CAPITAL-12 | фикс`.

## Справка в дереве пакета

Полные тексты форматов: `blago docs` в корне копии пишет `BLAGO-FORMATS.md` и `BLAGO-COMMITS.md`.
