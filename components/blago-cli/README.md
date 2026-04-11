# @coopenomics/blago-cli

CLI синхронизации артефактов Благорост (проекты, задачи, требования) с бэкендом через `@coopenomics/sdk`.

## Базовый каталог и корень копии

**Базовый каталог**: путь активной копии из **`~/.claude/config/blago/config.yaml`** (`active_workspace_env` и `workspaces`), если в этом каталоге уже есть **`.blago/config.json`**; иначе используется текущий рабочий каталог (**cwd**).

**Корень рабочей копии** — каталог, в котором (или выше по дереву от базового каталога) лежит `.blago/config.json`. Поиск идёт вверх от базы, пока не найден файл.

Команда **`blago init [directory]`** создаёт глобальный конфиг и дерево `~/blago/dev|testnet|production`, копирует в **`~/.claude/config/blago/`** (helpers, templates из `ai/config/`, `ai/templates/`). Опциональный **`[directory]`** — дополнительная копия: `.blago` в `path.resolve(cwd, directory)`.

**Скиллы и команды из пакета** (`ai/skills`, `ai/bmad`, `ai/commands` в каталоги `skills/blago`, `skills/blago/bmad`, `commands/blago/commands` под домашним корнем агента) **по умолчанию не копируются**. Чтобы их установить, укажите флаги:

| Флаг | Действие |
|------|----------|
| **`--claude`** | копирование только в **`~/.claude/`** |
| **`--cursor`** | копирование только в **`~/.cursor/`** |
| **`--claude --cursor`** | в оба каталога (как раньше было без флагов) |

Примеры: `blago init --claude`, `blago init --cursor --coopname mycoop`, `blago init --claude --cursor`.

Остальные опции **`init`**: **`--coopname <name>`**, **`--force`** (см. `blago init --help`).

## Справка по командам

```text
blago --help
blago <команда> --help
```

У подкоманд в help выводится блок **Global Options** (в том числе версия), если смотрите справку не с корневого уровня.

В конце help добавляется строка **текущей сессии** (активная среда и пользователь из сохранённого `blago login`), если найдена копия.

## Прочее

- После **`blago init`**: **`~/.claude/config/blago/helpers.md`**, **`~/.claude/config/blago/templates/`** (исходники: `ai/config/`, `ai/templates/`). Скиллы и команды из `ai/skills`, `ai/bmad`, `ai/commands` — только если переданы **`--claude`** и/или **`--cursor`** (см. таблицу выше); в домашнем дереве каталог `ai` не создаётся.
