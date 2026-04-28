#!/usr/bin/env node
/**
 * Перегенерирует ВСЕ скриншоты blagorost-документации одной командой.
 *
 *   node bin/shoot-blagorost-all.mjs            # без полного reboot — добивает на текущем стенде
 *   node bin/shoot-blagorost-all.mjs --reboot   # с reboot:extra (рекомендуется при изменении seed-данных)
 *   node bin/shoot-blagorost-all.mjs --only=tasks,voting   # выборочно
 *
 * Порядок сценариев — естественный жизненный цикл компонента, чтобы
 * накопительные seed-фазы (idempotent) ложились корректно: голосование и
 * push-result меняют состояние компонента безвозвратно, поэтому они в конце.
 *
 * После каждого успешного сценария — install в components/docs (PNG).
 * draft.md в docs не перезаписываем: проза держится в самом docs/, скрипт
 * только обновляет картинки.
 *
 * Скрипт продолжает прогон при падении отдельного сценария; в конце выводит
 * сводку «pass / fail».
 */
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HARNESS_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SCENARIOS = [
  'blagorost/profile',
  'blagorost/projects-list',
  'blagorost/adaptation',
  'blagorost/project-create',
  'blagorost/master-and-plan',
  'blagorost/clearance',
  'blagorost/artifacts',
  'blagorost/investments',
  'blagorost/tasks',
  'blagorost/commits',
  'blagorost/commits-master',
  'blagorost/voting',
  'blagorost/result-submit',
  'blagorost/results',
];

const args = process.argv.slice(2);
const wantReboot = args.includes('--reboot');
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg
  ? onlyArg.slice('--only='.length).split(',').map((s) => s.trim()).filter(Boolean)
  : null;

const targets = only
  ? SCENARIOS.filter((s) => only.some((o) => s.endsWith(`/${o}`) || s === o))
  : SCENARIOS;

if (targets.length === 0) {
  console.error(`Ни один сценарий не подходит под --only=${only?.join(',')}.`);
  console.error(`Доступные: ${SCENARIOS.map((s) => s.replace('blagorost/', '')).join(', ')}`);
  process.exit(2);
}

const results = [];
let rebootDone = false;

for (let i = 0; i < targets.length; i++) {
  const scenario = targets[i];
  const banner = `[${i + 1}/${targets.length}] ${scenario}`;
  console.error(`\n${'═'.repeat(60)}\n  ${banner}\n${'═'.repeat(60)}`);

  // --reboot применяется ровно один раз — на самом первом сценарии, чтобы
  // дальше все шли по накопительному стенду без переустановки цепочки.
  const shootArgs = ['bin/shoot.mjs', scenario];
  if (wantReboot && !rebootDone) {
    shootArgs.push('--reboot');
    rebootDone = true;
  }

  const shoot = spawnSync('node', shootArgs, { cwd: HARNESS_ROOT, stdio: 'inherit' });
  if (shoot.status !== 0) {
    console.error(`✗ ${scenario} упал — продолжаю остальные`);
    results.push({ scenario, ok: false, step: 'shoot' });
    continue;
  }

  // PNG → components/docs/docs/assets/...
  const install = spawnSync('node', ['lib/install.mjs', scenario], { cwd: HARNESS_ROOT, stdio: 'inherit' });
  if (install.status !== 0) {
    console.error(`✗ install ${scenario} упал`);
    results.push({ scenario, ok: false, step: 'install' });
    continue;
  }

  results.push({ scenario, ok: true });
}

console.error(`\n${'═'.repeat(60)}\n  Сводка\n${'═'.repeat(60)}`);
const pass = results.filter((r) => r.ok);
const fail = results.filter((r) => !r.ok);
for (const r of results) {
  const mark = r.ok ? '✓' : '✗';
  const note = r.ok ? '' : ` (упал на ${r.step})`;
  console.error(`  ${mark} ${r.scenario}${note}`);
}
console.error(`\n${pass.length}/${results.length} сценариев — успех.`);
if (fail.length > 0) {
  console.error('Упавшие сценарии: смотри shots/<scenario>/FAIL.png и console.log.');
  process.exit(1);
}
