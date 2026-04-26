// Сценарий: «Адаптация» — приём советом целевых потребительских программ
// и сопутствующих документов, необходимых для работы Благороста.
//
// Это не «адаптация председателя» (он не адаптируется): председатель
// оркестрирует процесс приёма документов советом — нажимает кнопки,
// которые формируют вопросы на повестку с уже наполненными фабричными
// документами, после чего совет голосует.
//
// prepare:
//   capital:01-programs — без программ УХД (id=3) и Капитализация (id=4)
//                         страница адаптации не покажется (нечего принимать).
//
// Идемпотентно: повторный прогон без --reboot ничего не ломает.

import { loginAsChairman } from '../../lib/harness.mjs';

export const meta = {
  title: 'Адаптация Благороста',
  docPath: 'new/blagorost/adaptation.md',
  assetsDir: 'assets/new/blagorost/adaptation',
  role: 'chairman',
  fixture: 'ant',
  prepare: ['capital:01-programs'],
};

export default async ({ page, context, shot, env }) => {
  // --- Шаг 1. Логин председателя (он оркестрирует адаптацию). ---
  await loginAsChairman(page, context);

  // --- Шаг 2. Любой /capital/* до завершения адаптации перенаправляет на
  //            /capital/registration — это и есть страница приёма документов. ---
  await page.goto(`${env.BASE_URL}/${env.COOPNAME}/capital/projects`, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('text=Адаптация к работе с программой', { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  // Тосты онбординга на инструктивном скриншоте — мусор.
  await page.evaluate(() => {
    document.querySelectorAll('.q-notification').forEach((n) => n.remove());
    document.querySelectorAll('.q-notifications__list > *').forEach((n) => n.remove());
  });
  await page.waitForTimeout(500);

  await shot(
    page,
    '01-overview',
    'Страница «Адаптация»: пять документов программы Благорост, которые должны быть приняты советом. Напротив каждого пункта, готового к запуску, кнопка «Объявить собрание совета» — она формирует фабричный документ и выносит вопрос на повестку.',
  );
};
