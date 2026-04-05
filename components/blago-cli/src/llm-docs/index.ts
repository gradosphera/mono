// BLAGO-FORMATS.md / BLAGO-COMMITS.md в корень копии.

import * as fs from 'node:fs/promises'
import * as path from 'node:path'

const FORMATS = `# Форматы файлов blago-cli

Синхронизируются типы: **project**, **issue**, **story**. Тип **result** через CLI не синхронизируется.

Все файлы — Markdown с YAML frontmatter между тройными дефисами (---) в первой строке файла. Поле **hash** — стабильный идентификатор сущности; **не менять вручную**.

## project (каталог '<capital_id>-<slug>/project.md' или '…/components/<capital_id>-<slug>/component.md')

Порядок: **type**, **id**, **title**; у компонента сразу подряд **parent_title** и **parent_hash**; далее **coopname**, **status**; **hash**; даты.

- **type:** project
- **id** — числовой ID проекта/компонента в Capital (информация; не менять для push)
- **title** — название
- у компонента: **parent_title** (текст родителя с бэкенда) и **parent_hash** подряд после **title**
- **coopname**, **status**
- **hash** — перед датами
- **created_at**, **updated_at** — ISO-8601
- Тело: описание проекта (Markdown)

## issue (issues/<issue_id>-<slug>.md — уникальность по человекочитаемому id задачи)

Порядок: **type**, **id**, **title** (название задачи), затем **project_title** / **component_title**; далее **status**, **priority**, **estimate**, **creators**, **labels**, **cycle_id**, **submaster**; внизу **hash** и **project_hash** перед датами.

- **type:** issue
- **id** — человекочитаемый ID задачи (PREFIX-N) или запасной идентификатор
- **title** — название задачи (выше контекста проекта)
- **project_title** — корневой проект
- **component_title** — компонент, если есть
- **status**, **priority**, **estimate** (число), **creators** (массив строк), **labels** (массив строк)
- опционально: **cycle_id**, **submaster**
- **hash**, **project_hash** — перед **created_at** / **updated_at**
- Поля **created_by** и **sort_order** в файле не выводятся; при push **sort_order** на сервер уходит как 0, если в YAML нет
- Тело: описание задачи

## story (requirements/<2chars_id>-<slug>.md или issues/<issue_id>-<issueSlug>-requirements/<2chars_id>-<slug>.md — первые 2 буквенно-цифровых символа из _id)

Порядок: **type**, при наличии **id** (_id с бэкенда), затем остальное.

- **type:** story
- **id** — внутренний '_id' записи требования в Capital (строка), если есть
- **title**, **hash**, **content_format** (например MARKDOWN), **status**, **created_by**, **sort_order**
- **project_hash** и/или **issue_hash**
- Тело: текст требования

После правок: **blago add** добавляет в staging только **изменённые** относительно индекса .md (и файлы без записи в индексе), затем **blago push**. Просмотр отличий от эталона индекса: blago diff; краткий статус: blago status.
`

const COMMITS = `# Сообщения коммитов в репозитории кода (FR-012)

В **прикладном** Git-репозитории с кодом указывайте в сообщении коммита как минимум:

1. **username** участника (блокчейн-аккаунт / логин в кооперативе)
2. **hash задачи** из frontmatter файла задачи (поле **hash** в issue)

Расширенный вариант (до четырёх параметров): username, проект, компонент, задача — для однозначной трассировки.

Примеры:

- ant CAPITAL-42 правка API оплат
- ant | проект blago-cli | задача CAPITAL-12 | фикс валидации

Username берите из контекста входа; hash задачи — из выгруженного файла issues/…md.
`

export async function writeLlmDocs(root: string): Promise<void> {
  await fs.writeFile(path.join(root, 'BLAGO-FORMATS.md'), FORMATS, 'utf8')
  await fs.writeFile(path.join(root, 'BLAGO-COMMITS.md'), COMMITS, 'utf8')
}
