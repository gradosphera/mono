# Релизный флоу: FF-промоушн dev → testnet → main

Линейная модель без merge и без конфликтов. Версию бампает `lerna` один раз на
`dev`, и тот же коммит едет вверх по **fast-forward**. `testnet` и `main` не
несут собственных коммитов — это указатели на протестированный коммит `dev`,
поэтому ветки никогда не диверджатся и merge-конфликтов не бывает.

## Как релизить

```bash
# 1. Нарезать релиз на dev (бамп версии lerna, БЕЗ деплоя)
scripts/cut-release.sh

# 2. Промоут на staging (деплой в testnet)
scripts/promote.sh testnet

# 3. Промоут в production (деплой main + npm publish + доки)
scripts/promote.sh main
```

- `cut-release.sh` — строго на `dev`. Считает версию `vYYYY.M.D` (повторный
  релиз того же дня → суффикс `-N`), вызывает `lerna version` (бамп всех
  package.json + lerna.json, коммит `chore(release): publish`, тег, push `dev`).
  **Деплой не запускает** — CI не слушает `dev`.
- `promote.sh testnet|main` — server-side **fast-forward** push
  `origin/<source>` → `origin/<target>`, рабочее дерево не трогается.

## Что триггерит деплой

`.github/workflows/release.yaml` слушает **push в `testnet`/`main` с изменением
`lerna.json`**. lerna.json меняется только при релизном бампе (на `dev`), и этот
коммит входит в диапазон FF-промоушна — поэтому деплоятся именно релизы, а не
обычные feature-пуши.

Окружение определяет **ветка**, не суффикс версии:

| Ветка     | Окружение            | Деплой-webhook         | npm publish / доки |
|-----------|----------------------|------------------------|--------------------|
| `testnet` | staging              | `TESTNET_WEBHOOK_URL`  | нет                |
| `main`    | production           | `PRODUCTION_WEBHOOK_URL` | да (`main`)      |

Версия для образов (`dicoop/*:vX`), webhook-payload и `lerna publish
from-package` читается из закоммиченного `lerna.json` — едет с коммитом по FF.
Для приёмника деплоя (playbooks) ничего не меняется: webhook по-прежнему
получает версию-строку, образы тегаются версией.

## Инварианты (не нарушать)

- **В `testnet`/`main` — только FF-промоушн, никаких прямых коммитов.** Прямой
  коммит сделает ветку не-FF; `promote.sh` тогда отвергнется push'ем (это гард,
  а не баг — выровняй ветку).
- **Версия бампается только на `dev`** (`cut-release.sh`). Никаких повторных
  бампов на `testnet`/`main` — иначе вернутся расхождение и конфликты.
- Тег (`vX`), который вешает `lerna version`, — маркер версии и основа для
  GitHub Release (`scripts/publish-release.sh`); триггером деплоя он **не**
  является.

## Откуда ушли (история)

Старые `publish-alpha.sh`/`publish-prod.sh` бампали версию **на каждой ветке**
(`-alpha-N` на testnet, чистую на main) через `git merge -X theirs` +
back-merge. Два независимых бампа за цикл + merge'и плодили расхождение → 20
package.json регулярно конфликтовали (особенно при гонке push/pull). FF-модель
это устраняет конструктивно.
