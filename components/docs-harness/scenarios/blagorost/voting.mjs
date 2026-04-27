// Сценарий: «Голосование по компоненту» — вкладка voting внутри карточки компонента.
//
// Логин ivanpetrov → /capital/components/<MVP_HASH>/voting → видит страницу
// голосования: суммы (на распределении / голосующая), список участников
// (сегменты), и для разворачивает один сегмент чтобы показать SegmentVotesWidget.
//
// prepare:
//   01..09 — стандартный пайплайн (программы, контрибьюторы, проект, план)
//   10-commits-and-voting — два коммита приняты + проект в статусе VOTING
//
// После phase 10 голосование «открыто» — но никто ещё не голосовал. Идеально для
// документации: видно правила и участников, но без чужих голосов.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loginAs, dismissOnboardingDialogs } from '../../lib/harness.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../state/participants/ivanpetrov.json'), 'utf8'),
);

// Хеш компонента «MVP v1» — детерминированный, такой же как в seed-фазах.
const COMPONENT_HASH = createHash('sha256').update('blago:project:49').digest('hex');

export const meta = {
  title: 'Голосование по компоненту',
  docPath: 'new/blagorost/voting.md',
  assetsDir: 'assets/new/blagorost/voting',
  role: 'participant',
  fixture: FIXTURE.username,
  prepare: [
    'capital:01-programs',
    'capital:02-extension-config',
    'capital:04-contributor',
    'capital:05-additional-contributors',
    'capital:06-create-project-koshelek',
    'capital:07-master-and-plan',
    'capital:08-investments',
    'capital:09-tasks',
    'capital:10-commits-and-voting',
  ],
};

export default async ({ page, shot, env }) => {
  // --- Логин пайщика ---
  await loginAs(page, FIXTURE);
  await dismissOnboardingDialogs(page);

  // --- Открываем страницу голосования по компоненту ---
  await page.goto(
    `${env.BASE_URL}/${env.COOPNAME}/capital/components/${COMPONENT_HASH}/voting`,
    { waitUntil: 'domcontentloaded' },
  );

  // Ждём пока загрузится — должна появиться карточка «На распределении» или текст одного из участников.
  await page.waitForSelector('text=На распределении', { timeout: 60000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('.q-notification').forEach((n) => n.remove());
    document.querySelectorAll('.q-notifications__list > *').forEach((n) => n.remove());
  });
  await page.waitForTimeout(800);

  // --- Кадр 1: общий вид страницы голосования ---
  // Видны: вкладки компонента (Описание / Задачи / Артефакты / План / Голосование / Результаты),
  // суммы «На распределении» и «Голосующая сумма», список участников с полями
  // ввода голосов и слайдерами, заметка «нельзя голосовать за себя» у текущего пайщика,
  // кнопка «Проголосовать» внизу справа и FAB «Принять участие (J)».
  await shot(
    page,
    '01-overview',
    'Страница «Голосование» компонента «MVP v1»: участники проекта с полями голосов, сумма «На распределении» и «Голосующая сумма» в шапке. Текущий пайщик не может голосовать сам за себя.',
  );
};
