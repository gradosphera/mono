# @coopenomics/blago-cli

CLI синхронизации артефактов Благорост (проекты, задачи, требования) с бэкендом через `@coopenomics/sdk`.

## Базовый каталог и корень копии

**Базовый каталог**: путь активной копии из **`~/.claude/config/blago/config.yaml`** (`active_workspace_env` и `workspaces`), если в этом каталоге уже есть **`.blago/config.json`**; иначе используется текущий рабочий каталог (**cwd**).

**Корень рабочей копии** — каталог, в котором (или выше по дереву от базового каталога) лежит `.blago/config.json`. Поиск идёт вверх от базы, пока не найден файл.

Команда **`blago init [directory]`** создаёт глобальный конфиг, дерево `~/blago/dev|testnet|production`, копирует в `~/.claude/config/blago/` (helpers, templates) и в `~/.claude/skills/blago/` содержимое `ai/` пакета; опциональный **`[directory]`** — дополнительная копия: `.blago` в `path.resolve(cwd, directory)`.

## Справка по командам

```text
blago --help
blago <команда> --help
```

У подкоманд в help выводится блок **Global Options** (в том числе версия), если смотрите справку не с корневого уровня.

В конце help добавляется строка **текущей сессии** (активная среда и пользователь из сохранённого `blago login`), если найдена копия.

## Прочее

- После **`blago init`**: **`~/.claude/config/blago/helpers.md`**, **`~/.claude/config/blago/templates/`** (исходники в пакете: `ai/config/`, `ai/templates/`) и содержимое **`ai/`** в **`~/.claude/skills/blago/`** (`skills/bmm/…`, `commands/` и т.д.; каталог `ai` в пути не создаётся).
