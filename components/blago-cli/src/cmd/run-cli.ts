// Commander: подкоманды; базовый каталог — активная копия из ~/.claude/config/blago/config.yaml (если есть .blago), иначе cwd; корень копии — поиск .blago/config.json вверх от базы.

import * as os from 'node:os'
import * as path from 'node:path'

import { Command } from 'commander'

import pkg from '../../package.json'

import { refreshGlobalAgentMirrorAsync } from '../config/agent-mirror.js'
import {
  type BlagoConfigFile,
  type BlagoRemoteProfile,
  getActiveProfile,
  globalBlagoConfigPath,
  initBlagoGlobalLayout,
  initBlagoWorkspace,
  loadConfig,
  resolveActiveWorkspaceRoot,
  resolveCoopname,
  saveConfig,
} from '../config/index.js'
import { blagoDir, findBlagoRoot, sessionPath } from '../config/paths.js'
import { resolveBlagoStartDir } from '../config/start-dir.js'
import { syncGlobalActiveWorkspaceAfterEnvUse } from '../config/sync-workspace-env.js'
import { runCreateIssue } from '../create/run-create-issue.js'
import { runCreateStory } from '../create/run-create-story.js'
import { applySession, createClient, ensureAuthenticatedContext, loginInteractive, promptLine } from '../session/index.js'
import {
  describeBlagoSessionLine,
  formatBlagoSessionStatusHelpExtra,
  readSessionUsernameSync,
} from '../session/status-text.js'
import { runAdd } from '../sync/add.js'
import { runClean } from '../sync/clean.js'
import { runDiff } from '../sync/diff.js'
import { runPull } from '../sync/pull.js'
import { runPush } from '../sync/push.js'
import { runClearStaging, runRemove } from '../sync/remove.js'
import { runRestore } from '../sync/restore.js'
import { runStatus } from '../sync/status.js'
import { error, formatThrownValue, info, success, warn } from '../ui/output.js'

function startDir(): string {
  return resolveBlagoStartDir()
}

function requireRoot(): string {
  const root = findBlagoRoot(startDir())
  if (!root) {
    throw new Error(
      'Не найдена рабочая копия blago (.blago/config.json). Выполните «blago init» и проверьте ~/.claude/config/blago/config.yaml (active_workspace_env, workspaces.*).',
    )
  }
  return root
}

export async function runCli(argv: string[]): Promise<void> {
  const program = new Command()
    .name('blago')
    // .description('Синхронизация проектов, задач и требований Благорост с бэкендом (GraphQL SDK). Подробности: README пакета.')
    // .configureHelp({ showGlobalOptions: true })
    .version(pkg.version)
    .addHelpText('afterAll', () => formatBlagoSessionStatusHelpExtra())

  program
    .command('init')
    .description(
      'Глобальный конфиг ~/.claude/config/blago/config.yaml; при наличии в пакете — ai/skills → skills/blago, ai/bmad → skills/blago/bmad, ai/commands → commands/blago/commands (в ~/.claude и ~/.cursor); каталоги ~/blago/dev|testnet|production и .blago/config.json в каждом; опционально — ещё одна копия в указанном каталоге',
    )
    .argument(
      '[directory]',
      'дополнительно: инициализировать ещё один корень копии blago (помимо каталогов из глобального config)',
    )
    .option(
      '--coopname <name>',
      'записать это имя кооператива во все среды в config (потом можно развести по-разному в JSON)',
    )
    .option('--force', 'перезаписать config.json значениями по умолчанию')
    .action(async (directory: string | undefined, opts: { coopname?: string, force?: boolean }) => {
      const { global } = await initBlagoGlobalLayout({
        coopname: opts.coopname,
        force: opts.force,
      })
      let extraRoot: string | null = null
      if (directory !== undefined && directory.trim().length > 0) {
        extraRoot = path.resolve(startDir(), directory)
        await initBlagoWorkspace(extraRoot, { coopname: opts.coopname, force: opts.force })
      }
      success(`Глобальный конфиг агента: ${globalBlagoConfigPath()}`)
      success(
        `Скиллы blago: ${path.join(os.homedir(), '.claude', 'skills', 'blago')} · ${path.join(os.homedir(), '.cursor', 'skills', 'blago')}`,
      )
      success(
        `Скиллы BMAD: ${path.join(os.homedir(), '.claude', 'skills', 'blago', 'bmad')} · ${path.join(os.homedir(), '.cursor', 'skills', 'blago', 'bmad')}`,
      )
      success(
        `Команды blago: ${path.join(os.homedir(), '.claude', 'commands', 'blago', 'commands')} · ${path.join(os.homedir(), '.cursor', 'commands', 'blago', 'commands')}`,
      )
      const active = resolveActiveWorkspaceRoot(global)
      if (active) {
        success(
          `Активная рабочая копия (active_workspace_env=${global.active_workspace_env}): ${active}`,
        )
      }
      success(`Каталоги синхронизации: ${Object.keys(global.workspaces).sort().map(k => `${k} → ${global.workspaces[k]}`).join('; ')}`)
      if (extraRoot) {
        success(`Дополнительно инициализировано: ${path.join(extraRoot, '.blago')}`)
      }
      const activeRoot = resolveActiveWorkspaceRoot(global)
      if (activeRoot) {
        const cfg = await loadConfig(activeRoot)
        await refreshGlobalAgentMirrorAsync(activeRoot, cfg)
      }
    })

  const createCmd = program
    .command('create')
    .description(
      'Задача (issue) и требование (req): сразу мутация на сервере (нужны сеть и blago login); .md с id/hash с сервера, в индексе и staging.',
    )

  createCmd
    .command('issue')
    .description(
      'Создать задачу на сервере (CreateIssue); опционально тело описания вторым аргументом; файл в индексе и staging',
    )
    .argument(
      '<basePathOrId>',
      'id проекта/компонента (число из project.md / component.md) или каталог / путь к project.md | component.md',
    )
    .argument('<title>', 'заголовок')
    .argument(
      '[description]',
      'необязательно: описание (markdown) — уходит в description на сервере и в тело .md',
    )
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
        basePathOrId: string,
        title: string,
        description: string | undefined,
        opts: { setSelf?: boolean, creators?: string, submaster?: string },
      ) => {
        const root = requireRoot()
        const cfg = await loadConfig(root)
        const ctx = await ensureAuthenticatedContext(root, cfg)
        const { relativePath } = await runCreateIssue(ctx, basePathOrId, title, {
          description: description ?? '',
          setSelf: opts.setSelf,
          creatorsCsv: opts.creators,
          submaster: opts.submaster,
        })
        success(`Задача создана на сервере: ${relativePath} (добавлено в staging)`)
      },
    )

  createCmd
    .command('req')
    .alias('requirement')
    .description(
      'Создать требование на сервере (CreateStory); id в .md с сервера; опционально тело вторым аргументом',
    )
    .argument(
      '<basePathOrId>',
      'id проекта/компонента (число) или каталог / путь к project.md | component.md (родительский проект/компонент)',
    )
    .argument('<title>', 'заголовок')
    .argument(
      '[description]',
      'необязательно: описание (содержимое по --format) — на сервер сразу',
    )
    .option(
      '--format <name>',
      'содержимое: markdown | mermaid | drawio | bpmn',
      'markdown',
    )
    .option(
      '--issue-hash <hash>',
      'привязать к задаче: issue_hash из frontmatter задачи (файл задачи должен быть в индексе)',
    )
    .action(
      async (
        basePathOrId: string,
        title: string,
        description: string | undefined,
        opts: { format?: string, issueHash?: string },
      ) => {
        const root = requireRoot()
        const cfg = await loadConfig(root)
        const ctx = await ensureAuthenticatedContext(root, cfg)
        const { relativePath } = await runCreateStory(ctx, basePathOrId, title, description ?? '', {
          format: opts.format,
          issueHash: opts.issueHash,
        })
        success(`Требование создано на сервере: ${relativePath} (добавлено в staging)`)
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
      success(
        `Вход выполнен.\nРабочая копия: ${root}\nФайл сессии: ${sessionPath(root, cfg.activeEnv)}`,
      )
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
      'Добавить в staging только изменённые относительно индекса .md (или без записи в индексе); каталог рекурсивно. Число — все .md под workspace проекта/компонента с этим id; уникальный id из frontmatter задачи или требования (story); иначе «projId-issueId» — Capital id проекта и числовой id в .md задачи. Пути …/messages/ и …/meetings/ в staging не попадают.',
    )
    .argument(
      '<targets...>',
      'пути, id проекта (только цифры), id issue/story из frontmatter или projectId-issueId',
    )
    .action(async (paths: string[]) => {
      const root = requireRoot()
      const { stagedPaths, skippedUnchanged, skippedIgnored, skippedPullOnlyArtifacts } = await runAdd(root, paths)
      success(
        `Staging обновлён: в списке ${stagedPaths.length} путь(ей). Пропущено без изменений относительно индекса: ${skippedUnchanged}; по .blagoignore: ${skippedIgnored}; артефакты только pull (messages/ и meetings/): ${skippedPullOnlyArtifacts}.`,
      )
    })

  program
    .command('remove')
    .alias('rm')
    .description('Убрать файлы .md из staging (каталог — рекурсивно; цели — как у add)')
    .option('-a, --all', 'очистить staging целиком')
    .argument(
      '[targets...]',
      'пути, id проекта, id issue/story из frontmatter или projectId-issueId',
    )
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
    .description(
      'Восстановить один .md с сервера (путь из индекса, id маркера, id issue/story из frontmatter или projectId-issueId)',
    )
    .argument('<pathOrId>', 'путь к .md, id маркера, id issue/story из frontmatter или projectId-issueId')
    .action(async (pathOrId: string) => {
      const root = requireRoot()
      const cfg = await loadConfig(root)
      const ctx = await ensureAuthenticatedContext(root, cfg)
      const restoredRel = await runRestore(ctx, pathOrId)
      success(`Восстановлено с сервера: ${restoredRel}`)
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
    .description(
      'Показать staging и локальные изменения относительно индекса; у каждой строки — путь и id (project/issue/story), где возможно',
    )
    .action(async () => {
      const root = requireRoot()
      await runStatus(root)
    })

  program
    .command('diff')
    .description('Файлы, где содержимое разошлось с индексом: SHA256 и превью строк (не сравнение с сервером)')
    .action(async () => {
      const root = requireRoot()
      await runDiff(root, blagoDir(root))
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

  const envCmd = program
    .command('env')
    .description(
      'Управление именованными средами (URL API и блокчейна). Без подкоманды — показать активную среду и сессию.',
    )

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
      const { effectiveRoot, globalSynced } = await syncGlobalActiveWorkspaceAfterEnvUse(name, root, next)
      success(
        globalSynced
          ? `Активная среда: ${name}. Рабочая копия (global): ${effectiveRoot}`
          : `Активная среда: ${name}`,
      )
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
      await refreshGlobalAgentMirrorAsync(root, next)
      success(`Среда «${name}» обновлена`)
    })

  envCmd.action(async () => {
    const root = requireRoot()
    const cfg = await loadConfig(root)
    await refreshGlobalAgentMirrorAsync(root, cfg)
    info(`Рабочая копия: ${root}`)
    info(`Метаданные и сессии: ${blagoDir(root)}`)
    info(
      describeBlagoSessionLine(
        cfg,
        readSessionUsernameSync(root, cfg.activeEnv),
        resolveCoopname(cfg),
      ),
    )
    info(`Среды в config: ${Object.keys(cfg.environments).sort().join(', ')}`)
  })

  try {
    await program.parseAsync(argv, { from: 'node' })
  }
  catch (e) {
    error(formatThrownValue(e))
    process.exitCode = 1
  }
}
