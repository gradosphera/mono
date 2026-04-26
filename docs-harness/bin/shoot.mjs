#!/usr/bin/env node
// Orchestrator: pre-flight + автопочинка типовых грабель + прогон сценария.
// Один вход для doc-shoot скилла: `node bin/shoot.mjs <scenario>` делает всё,
// что иначе пришлось бы дёргать руками (build dist, restart desktop, create fixture).
//
// Что НЕ делает:
//   - не поднимает chain/parser/controller (это докер-стек, его держит пользователь)
//   - не пишет прозу в draft.md (это работа Claude по фактам со скриншотов)
//   - не запускает install.mjs (запись в components/docs/, оставляем под ручной контроль)

import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HARNESS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(HARNESS_ROOT, '..');

const scenario = process.argv[2];
if (!scenario) {
  console.error('Usage: node bin/shoot.mjs <scenario>   (например auth/signin)');
  process.exit(2);
}

// Известные тестовые пайщики — один раз создаются на свежей цепочке,
// дальше их WIF лежит в state/participants/<name>.json и переиспользуется.
// Имена ТОЛЬКО человеческие (см. doc-shoot/SKILL.md «Фиксированные конвенции»).
const KNOWN_FIXTURES = {
  ivanpetrov: { email: 'ivan.petrov@example.com', firstName: 'Иван', lastName: 'Петров', middleName: 'Сергеевич' },
};

const log = (m) => console.error(`◇ ${m}`);
const ok = (m) => console.error(`✓ ${m}`);
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readDotEnv() {
  const out = {};
  const file = path.join(REPO_ROOT, '.env');
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function readPgEnv() {
  // Postgres креды берём из controller/.env — там единственное надёжное место,
  // где зафиксированы хост-порт, юзер и пароль для локальной сборки.
  const file = path.join(REPO_ROOT, 'components/controller/.env');
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function curlOk(url, method = 'GET', body = null) {
  const args = ['-sf', '-m', '3', '-o', '/dev/null', url];
  if (method !== 'GET') args.push('-X', method);
  if (body) args.push('-H', 'Content-Type: application/json', '-d', body);
  return spawnSync('curl', args, { stdio: 'ignore' }).status === 0;
}

const dotenv = readDotEnv();
const PORTS = {
  chain: dotenv.NODE_HTTP_PORT || '8888',
  controller: dotenv.COOPBACK_HOST_PORT || '2998',
  desktop: dotenv.DESKTOP_HOST_PORT || '2999',
  postgres: dotenv.PG_HOST_PORT || '5532',
  mongo: dotenv.MONGO_HOST_PORT || '27017',
};

// 1. Стек, который держит пользователь (без него бессмысленно)
function checkStack() {
  log('Проверяю стек (chain/controller/parser)...');
  if (!curlOk(`http://127.0.0.1:${PORTS.chain}/v1/chain/get_info`)) {
    die(`chain :${PORTS.chain} не отвечает — подними docker compose up -d node`);
  }
  if (!curlOk(`http://127.0.0.1:${PORTS.controller}/v1/graphql`, 'POST', '{"query":"{__typename}"}')) {
    die(`controller :${PORTS.controller}/v1/graphql не отвечает — docker compose up -d coopback`);
  }
  const parser = spawnSync('docker', ['compose', 'ps', 'cooparser', '--format', 'json'], { cwd: REPO_ROOT, encoding: 'utf8' });
  if (parser.status !== 0 || !/"State":"running"/.test(parser.stdout)) {
    die('parser (cooparser) не запущен — docker compose up -d cooparser');
  }
  ok('chain, controller, parser живы');
}

// 2. cooptypes/sdk dist — без них desktop отдаёт спиннер, скриншоты пустые
function ensureDist() {
  log('Проверяю собранные cooptypes и sdk...');
  const targets = [
    { name: 'cooptypes', filter: 'cooptypes', dist: path.join(REPO_ROOT, 'components/cooptypes/dist/index.mjs') },
    { name: 'sdk', filter: '@coopenomics/sdk', dist: path.join(REPO_ROOT, 'components/sdk/dist/index.mjs') },
  ];
  const missing = targets.filter((t) => !fs.existsSync(t.dist));
  if (missing.length === 0) { ok('cooptypes и sdk собраны'); return false; }
  log(`Нет dist: ${missing.map((t) => t.name).join(', ')} — собираю через pnpm...`);
  for (const t of missing) {
    const r = spawnSync('pnpm', ['--filter', t.filter, 'build'], { cwd: REPO_ROOT, stdio: 'inherit' });
    if (r.status !== 0) die(`pnpm --filter ${t.filter} build упал`);
  }
  ok('Сборка готова');
  return true;
}

// 3. desktop dev: поднимаем если нет; если только что собрали dist и dev уже работал —
//    рестартуем, иначе vite-plugin-checker держит кэш «no module» и vue-tsc overlay
//    перехватывает клики в playwright (видел на 989-9, фикс через рестарт).
async function ensureDesktop(distRebuilt) {
  log(`Проверяю desktop :${PORTS.desktop}...`);
  const wasUp = curlOk(`http://127.0.0.1:${PORTS.desktop}`);
  if (wasUp && !distRebuilt) { ok('desktop dev живой'); return; }
  if (wasUp && distRebuilt) {
    log('Перезапускаю desktop dev (после билда dist нужен fresh vue-tsc cache)...');
    spawnSync('pkill', ['-f', 'quasar.js dev'], { stdio: 'ignore' });
    await sleep(2000);
  } else {
    log('desktop dev не запущен, поднимаю в фоне...');
  }
  const logFile = '/tmp/desktop-dev.log';
  const out = fs.openSync(logFile, 'a');
  const child = spawn('pnpm', ['run', 'dev'], {
    cwd: path.join(REPO_ROOT, 'components/desktop'),
    detached: true,
    stdio: ['ignore', out, out],
  });
  child.unref();
  log(`Жду пока :${PORTS.desktop} начнёт отвечать (до 180с, лог в ${logFile})...`);
  for (let i = 0; i < 90; i++) {
    await sleep(2000);
    if (curlOk(`http://127.0.0.1:${PORTS.desktop}`)) { ok('desktop dev готов'); return; }
  }
  die(`desktop dev не поднялся за 180с — проверь ${logFile}`);
}

// 4. Фикстура пайщика. Сценарий читает state/participants/<name>.json напрямую
//    (см. signin.mjs), поэтому если файла нет — сценарий упадёт с ENOENT.
//    Создаём через add-plain-participant, JSON-вывод сохраняем в state.
function ensureFixture() {
  const scenarioPath = path.join(HARNESS_ROOT, 'scenarios', `${scenario}.mjs`);
  if (!fs.existsSync(scenarioPath)) die(`сценарий не найден: ${scenarioPath}`);
  const src = fs.readFileSync(scenarioPath, 'utf8');
  const m = src.match(/state\/participants\/([\w-]+)\.json/);
  if (!m) { ok('сценарий не требует фикстуру'); return; }
  const name = m[1];
  const fixturePath = path.join(HARNESS_ROOT, 'state/participants', `${name}.json`);
  if (fs.existsSync(fixturePath)) { ok(`фикстура ${name} есть`); return; }
  const profile = KNOWN_FIXTURES[name];
  if (!profile) {
    die(`фикстура «${name}» не описана в KNOWN_FIXTURES (bin/shoot.mjs). Добавь профиль или создай файл вручную через add-plain-participant.ts.`);
  }
  log(`Создаю фикстуру ${name} через add-plain-participant...`);
  const pg = readPgEnv();
  const env = {
    ...process.env,
    MONGO_URI: `mongodb://127.0.0.1:${PORTS.mongo}/cooperative-x`,
    POSTGRES_HOST: '127.0.0.1',
    POSTGRES_PORT: PORTS.postgres,
    POSTGRES_USERNAME: pg.POSTGRES_USERNAME || 'postgres',
    POSTGRES_PASSWORD: pg.POSTGRES_PASSWORD || 'postgres!23!23',
    POSTGRES_DATABASE: pg.POSTGRES_DATABASE || 'voskhod',
  };
  const r = spawnSync('pnpm', [
    '--filter', '@coopenomics/boot', 'exec', 'esno',
    'src/scripts/add-plain-participant.ts',
    name, profile.email, profile.firstName, profile.lastName, profile.middleName,
  ], { cwd: REPO_ROOT, env, encoding: 'utf8' });
  if (r.status !== 0) {
    die(`add-plain-participant упал:\nstderr:\n${r.stderr}\nstdout:\n${r.stdout}`);
  }
  // stdout: служебные логи в stderr, JSON-результат — последняя непустая строка stdout.
  const lastLine = r.stdout.split('\n').filter((l) => l.trim()).pop();
  if (!lastLine || !lastLine.startsWith('{')) {
    die(`не нашёл JSON в выводе add-plain-participant:\n${r.stdout}`);
  }
  fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
  fs.writeFileSync(fixturePath, lastLine + '\n');
  ok(`фикстура ${name} создана: ${path.relative(REPO_ROOT, fixturePath)}`);
}

// 5. Прогон + 6. Скелет draft.md если его ещё нет
function runScenario() {
  log(`Прогоняю сценарий ${scenario}...`);
  const r = spawnSync('node', ['run.mjs', scenario], { cwd: HARNESS_ROOT, stdio: 'inherit' });
  if (r.status !== 0) die(`сценарий упал — смотри shots/${scenario}/FAIL.png и console.log`);
}

function ensureDraft() {
  const manifestPath = path.join(HARNESS_ROOT, 'shots', scenario, 'manifest.json');
  const draftPath = path.join(HARNESS_ROOT, 'shots', scenario, 'draft.md');
  if (fs.existsSync(draftPath)) { ok('draft.md уже есть — не перегенерирую'); return; }
  log('Генерирую скелет draft.md...');
  const r = spawnSync('node', ['lib/render-md.mjs', manifestPath], { cwd: HARNESS_ROOT, stdio: 'inherit' });
  if (r.status !== 0) die('render-md.mjs упал');
}

(async () => {
  checkStack();
  const distRebuilt = ensureDist();
  await ensureDesktop(distRebuilt);
  ensureFixture();
  runScenario();
  ensureDraft();
  console.error('');
  console.error('✓ Готово.');
  console.error(`  PNG:   docs-harness/shots/${scenario}/`);
  console.error(`  draft: docs-harness/shots/${scenario}/draft.md  (правь прозу здесь)`);
  console.error(`  install: node lib/install.mjs ${scenario} --md  (когда проза готова)`);
})().catch((e) => die(e.stack || e.message));
