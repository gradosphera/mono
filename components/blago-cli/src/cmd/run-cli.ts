// Commander: подкоманды; корень — BLAGO_WORKSPACE или поиск .blago/config.json вверх.

import * as path from 'node:path'

import { Command } from 'commander'

import pkg from '../../package.json'

import {
  type BlagoConfigFile,
  type BlagoRemoteProfile,
  getActiveProfile,
  initBlagoWorkspace,
  loadConfig,
  saveConfig,
} from '../config/index.js'
import { findBlagoRoot } from '../config/paths.js'
import { runCreateIssue } from '../create/run-create-issue.js'
import { runCreateStory } from '../create/run-create-story.js'
import { writeLlmDocs } from '../llm-docs/index.js'
import { applySession, createClient, ensureAuthenticatedContext, loginInteractive, promptLine } from '../session/index.js'
import { runAdd } from '../sync/add.js'
import { runClean } from '../sync/clean.js'
import { runDiff } from '../sync/diff.js'
import { normalizeRelativePath } from '../sync/index-store.js'
import { runPull } from '../sync/pull.js'
import { runPush } from '../sync/push.js'
import { runClearStaging, runRemove } from '../sync/remove.js'
import { runRestore } from '../sync/restore.js'
import { runStatus } from '../sync/status.js'
import { error, formatThrownValue, success, warn } from '../ui/output.js'

function startDir(): string {
  if (process.env.BLAGO_WORKSPACE) {
    return path.resolve(process.env.BLAGO_WORKSPACE)
  }
  return process.cwd()
}

function requireRoot(): string {
  const root = findBlagoRoot(startDir())
  if (!root) {
    throw new Error('Не найдена рабочая копия blago (.blago/config.json). Выполните «blago init» в корне проекта.')
  }
  return root
}

export async function runCli(argv: string[]): Promise<void> {
  const program = new Command()
    .name('blago')
    .description(
      'Синхронизация артефактов Благорост (проекты, задачи, требования) через GraphQL SDK. Корень копии: каталог с .blago/ или переменная BLAGO_WORKSPACE.',
    )
    .version(pkg.version)
    .addHelpText(
      'after',
      `
Типовой цикл: init → env set / env use → login → pull → правки → add → push; create issue|req — черновик без сети; remove / restore — staging и откат файла с сервера; clean — сброс копии по индексу.
Корень копии: каталог с .blago/config.json (поиск вверх от текущего каталога) или BLAGO_WORKSPACE.
Форматы сущностей: blago docs. Справка по команде: blago <команда> --help`,
    )

  program
    .command('init')
    .description('Создать .blago/config.json в текущем или указанном каталоге')
    .argument('[directory]', 'каталог для инициализации', '.')
    .option(
      '--coopname <name>',
      'записать это имя кооператива во все среды в config (потом можно развести по-разному в JSON)',
    )
    .option('--force', 'перезаписать config.json значениями по умолчанию')
    .option('--with-llm-docs', 'создать BLAGO-FORMATS.md и BLAGO-COMMITS.md в корне')
    .action(async (directory: string, opts: { coopname?: string, force?: boolean, withLlmDocs?: boolean }) => {
      const base = path.resolve(startDir(), directory)
      await initBlagoWorkspace(base, { coopname: opts.coopname, force: opts.force })
      if (opts.withLlmDocs) {
        await writeLlmDocs(base)
      }
      success(`Инициализировано: ${path.join(base, '.blago')}`)
    })

  const createCmd = program
    .command('create')
    .description(
      'Локальный черновик задачи или требования (без сети). Файл попадает в staging; первый push — мутация create на сервере.',
    )

  createCmd
    .command('issue')
    .description('Создать файл задачи (type: issue) и запись в .blago/pending-create.json')
    .argument('<basePath>', 'каталог проекта/компонента или путь к project.md / component.md')
    .argument('<title>', 'заголовок')
    .option(
      '--set-self',
      'добавить username из сессии активной среды первым в creators (нужен blago login); created_by не задаётся',
    )
    .option(
      '--creators <list>',
      'список создателей через запятую; с --set-self — после текущего пользователя; без флагов — creators: []',
    )
    .option('--submaster <username>', 'явный submaster (только с этим флагом)')
    .action(
      async (
        basePath: string,
        title: string,
        opts: { setSelf?: boolean, creators?: string, submaster?: string },
      ) => {
        const root = requireRoot()
        const cfg = await loadConfig(root)
        const { relativePath } = await runCreateIssue(root, cfg, basePath, title, {
          setSelf: opts.setSelf,
          creatorsCsv: opts.creators,
          submaster: opts.submaster,
        })
        success(`Создан черновик задачи: ${relativePath} (добавлено в staging)`)
      },
    )

  createCmd
    .command('req')
    .alias('requirement')
    .description('Создать файл требования / story (type: story)')
    .argument('<basePath>', 'каталог проекта/компонента или путь к project.md / component.md')
    .argument('<title>', 'заголовок')
    .option(
      '--set-self',
      'заполнить created_by username из сессии активной среды (нужен blago login)',
    )
    .option(
      '--format <name>',
      'содержимое: markdown | mermaid | drawio | bpmn',
      'markdown',
    )
    .action(
      async (basePath: string, title: string, opts: { setSelf?: boolean, format?: string }) => {
        const root = requireRoot()
        const cfg = await loadConfig(root)
        const { relativePath } = await runCreateStory(root, cfg, basePath, title, {
          setSelf: opts.setSelf,
          format: opts.format,
        })
        success(`Создан черновик требования: ${relativePath} (добавлено в staging)`)
      },
    )

  program
    .command('login')
    .description('Интерактивный вход (email + WIF); сохраняет сессию для активной среды')
    .action(async () => {
      const root = requireRoot()
      const cfg = await loadConfig(root)
      const profile = getActiveProfile(cfg)
      const client = createClient(profile)
      const session = await loginInteractive(client, root, cfg.activeEnv)
      await applySession(client, session)
      success('Вход выполнен, сессия сохранена в .blago/')
    })

  program
    .command('pull')
    .description('Скачать с сервера проекты, задачи и требования (coopname в config или из blago init)')
    .action(async () => {
      const root = requireRoot()
      const cfg = await loadConfig(root)
      const ctx = await ensureAuthenticatedContext(root, cfg)
      await runPull(ctx)
      success('pull завершён')
    })

  program
    .command('add')
    .description(
      'Добавить в staging только изменённые относительно индекса .md (или без записи в индексе); каталог рекурсивно',
    )
    .argument('<paths...>', 'пути относительно корня рабочей копии')
    .action(async (paths: string[]) => {
      const root = requireRoot()
      const { stagedPaths, skippedUnchanged, skippedIgnored } = await runAdd(root, paths)
      success(
        `Staging обновлён: в списке ${stagedPaths.length} путь(ей). Пропущено без изменений относительно индекса: ${skippedUnchanged}; по .blagoignore: ${skippedIgnored}.`,
      )
    })

  program
    .command('remove')
    .alias('rm')
    .description('Убрать файлы .md из staging (каталог — рекурсивно все .md внутри)')
    .option('-a, --all', 'очистить staging целиком')
    .argument('[paths...]', 'пути относительно корня рабочей копии')
    .action(async (paths: string[], opts: { all?: boolean }) => {
      const root = requireRoot()
      if (opts.all) {
        await runClearStaging(root)
        success('Staging очищен (--all).')
        return
      }
      const { removedCount, remainingPaths, notStagedCount } = await runRemove(root, paths)
      success(
        `Из staging убрано путей: ${removedCount}. Осталось в списке: ${remainingPaths.length}. Не было в staging: ${notStagedCount}.`,
      )
    })

  program
    .command('restore')
    .description('Восстановить один .md с сервера по пути из индекса (перезапись файла и обновление индекса)')
    .argument('<path>', 'относительный путь к файлу, например 2-proekt-2/project.md')
    .action(async (filePath: string) => {
      const root = requireRoot()
      const cfg = await loadConfig(root)
      const ctx = await ensureAuthenticatedContext(root, cfg)
      await runRestore(ctx, filePath)
      success(`Восстановлено с сервера: ${normalizeRelativePath(filePath)}`)
    })

  program
    .command('push')
    .description('Отправить staged файлы на сервер (проверка версии, без тихой перезаписи)')
    .action(async () => {
      const root = requireRoot()
      const cfg = await loadConfig(root)
      const ctx = await ensureAuthenticatedContext(root, cfg)
      await runPush(ctx)
      success('push завершён')
    })

  program
    .command('status')
    .description('Показать staging и файлы с локальными изменениями относительно индекса')
    .action(async () => {
      const root = requireRoot()
      await runStatus(root)
    })

  program
    .command('diff')
    .description('Файлы, где содержимое разошлось с индексом: SHA256 и превью строк (не сравнение с сервером)')
    .action(async () => {
      const root = requireRoot()
      await runDiff(root)
    })

  program
    .command('clean')
    .description(
      'Удалить верхнеуровневые каталоги проектов из индекса (целиком) и обнулить index/staging; .blago не трогает',
    )
    .action(async () => {
      const root = requireRoot()
      const line = await promptLine(
        'Будут удалены каталоги проектов (по индексу) и очищены index/staging. Введите yes для подтверждения: ',
      )
      if (line.trim().toLowerCase() !== 'yes') {
        warn('Отменено.')
        return
      }
      await runClean(root)
      success('Индекс и staging очищены, каталоги проектов удалены.')
    })

  const envCmd = program.command('env').description('Управление именованными средами (URL API и блокчейна)')

  envCmd
    .command('use')
    .description('Сделать среду активной')
    .argument('<name>', 'имя среды')
    .action(async (name: string) => {
      const root = requireRoot()
      const cfg = await loadConfig(root)
      if (!cfg.environments[name]) {
        throw new Error(`Среда «${name}» не описана. Сначала: blago env set ${name} …`)
      }
      const next: BlagoConfigFile = { ...cfg, activeEnv: name }
      await saveConfig(root, next)
      success(`Активная среда: ${name}`)
    })

  envCmd
    .command('set')
    .description('Задать параметры среды')
    .argument('<name>', 'имя среды')
    .requiredOption('--api-url <url>', 'URL GraphQL, например http://127.0.0.1:2998/v1/graphql')
    .requiredOption('--chain-url <url>', 'URL ноды EOSIO')
    .option('--chain-id <id>', 'CHAIN_ID сети')
    .option('--label <text>', 'подпись для человека')
    .action(async (name: string, opts: { apiUrl: string, chainUrl: string, chainId?: string, label?: string }) => {
      const root = requireRoot()
      const cfg = await loadConfig(root)
      const prev: BlagoRemoteProfile = cfg.environments[name] ?? {
        api_url: '',
        chain_url: '',
        chain_id: '',
      }
      const profile: BlagoRemoteProfile = {
        api_url: opts.apiUrl,
        chain_url: opts.chainUrl,
        chain_id: opts.chainId ?? prev.chain_id ?? '',
        label: opts.label ?? prev.label,
      }
      const next: BlagoConfigFile = {
        ...cfg,
        environments: { ...cfg.environments, [name]: profile },
      }
      await saveConfig(root, next)
      success(`Среда «${name}» обновлена`)
    })

  program
    .command('docs')
    .description('Записать в корень копии BLAGO-FORMATS.md и BLAGO-COMMITS.md')
    .action(async () => {
      const root = requireRoot()
      await writeLlmDocs(root)
      success('Документы для LLM обновлены')
    })

  try {
    await program.parseAsync(argv, { from: 'node' })
  }
  catch (e) {
    error(formatThrownValue(e))
    process.exitCode = 1
  }
}
