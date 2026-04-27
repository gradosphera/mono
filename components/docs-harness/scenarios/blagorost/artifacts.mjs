// Сценарий: «Артефакты» — вкладка component-requirements / project-requirements.
//
// Логин ivanpetrov → /capital/components/<MVP_HASH>/requirements → пустой
// список (на seed-данных артефакты не создаются — это для документации
// просто показ UI-страницы с кнопкой «Создать»).
//
// prepare:
//   01..07 — стандартный пайплайн до состояния «компонент с мастером и
//   планом», достаточно для отображения вкладки «Артефакты».
//
// Кадры:
//   01-component-artifacts — вкладка «Артефакты» компонента
//   02-project-artifacts   — вкладка «Артефакты» проекта

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loginAs, dismissOnboardingDialogs } from '../../lib/harness.mjs';

// fixture-source: state/participants/ivanpetrov.json

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJECT_HASH = createHash('sha256').update('blago:project:48').digest('hex');
const COMPONENT_HASH = createHash('sha256').update('blago:project:49').digest('hex');

export const meta = {
  title: 'Артефакты',
  docPath: 'new/blagorost/artifacts.md',
  assetsDir: 'assets/new/blagorost/artifacts',
  role: 'participant',
  fixture: 'ivanpetrov',
  fixtures: ['ivanpetrov', 'ekaterina'],
  prepare: [
    'capital:01-programs',
    'capital:02-extension-config',
    'capital:04-contributor',
    'capital:05-additional-contributors',
    'capital:06-create-project-koshelek',
    'capital:07-master-and-plan',
  ],
};

function loadFixture(username) {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, `../../state/participants/${username}.json`), 'utf8'),
  );
}

async function clearNotifications(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.q-notification').forEach((n) => n.remove());
    document.querySelectorAll('.q-notifications__list > *').forEach((n) => n.remove());
  });
}

export default async ({ page, shot, env }) => {
  const fixture = loadFixture('ivanpetrov');

  await loginAs(page, fixture);
  await dismissOnboardingDialogs(page);

  // --- Кадр 1: вкладка «Артефакты» компонента ---
  await page.goto(
    `${env.BASE_URL}/${env.COOPNAME}/capital/components/${COMPONENT_HASH}/requirements`,
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await clearNotifications(page);
  await page.waitForTimeout(800);
  await shot(
    page,
    '01-component-artifacts',
    'Вкладка «Артефакты» компонента «MVP v1»: список артефактов компонента, кнопка создания нового. Здесь живут описания требований, диаграммы и схемы конкретного компонента.',
  );

  // --- Кадр 2: вкладка «Артефакты» проекта ---
  await page.goto(
    `${env.BASE_URL}/${env.COOPNAME}/capital/projects/${PROJECT_HASH}/requirements`,
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await clearNotifications(page);
  await page.waitForTimeout(800);
  await shot(
    page,
    '02-project-artifacts',
    'Вкладка «Артефакты» проекта «Кошелёк пайщика»: артефакты, видимые всем компонентам проекта — общая концепция, словарь, архитектурный обзор.',
  );
};
