// Сценарий: «Адаптация» — приём советом целевых потребительских программ
// и сопутствующих документов, необходимых для работы Благороста.
//
// Это не «адаптация председателя» (он не адаптируется): председатель
// оркестрирует процесс приёма документов советом — нажимает кнопки,
// которые формируют вопросы на повестку с уже наполненными фабричными
// документами, после чего совет голосует.
//
// prepare:
//   capital:01-programs — без программ УХД (id=3) и Благорост (id=4)
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

// Подписываем wallet-онбординг до тех пор, пока на странице не появится
// заголовок «Адаптация к работе с программой». На свежей цепочке диалоги
// «Прочитайте и подпишите документ» прилетают по одному с задержкой 1-3 сек
// каждый — простое 12-секундное ожидание первого диалога не годится: он
// может появиться уже после того как CapitalRegistrationPage примонтировалась.
async function signWalletOnboardingUntilAdaptation(page) {
  const adaptationVisible = async () =>
    page.locator('text=Адаптация к работе с программой').first()
      .isVisible().catch(() => false);

  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (await adaptationVisible()) return;

    // Ждём появления активной кнопки «Подписать» в любом видимом портал-диалоге.
    const btnReady = await page.waitForFunction(
      () => {
        const portals = Array.from(document.querySelectorAll('[id^="q-portal--dialog--"]'))
          .filter((p) => getComputedStyle(p).display !== 'none');
        for (const p of portals) {
          const btn = Array.from(p.querySelectorAll('button'))
            .find((b) => b.textContent?.trim() === 'Подписать' && !b.disabled);
          if (btn) return true;
        }
        return false;
      },
      { timeout: 8000 },
    ).then(() => true).catch(() => false);
    if (!btnReady) continue;

    const clicked = await page.evaluate(() => {
      const portals = Array.from(document.querySelectorAll('[id^="q-portal--dialog--"]'))
        .filter((p) => getComputedStyle(p).display !== 'none');
      for (const p of portals) {
        const btn = Array.from(p.querySelectorAll('button'))
          .find((b) => b.textContent?.trim() === 'Подписать' && !b.disabled);
        if (btn) {
          btn.scrollIntoView({ block: 'center', behavior: 'instant' });
          btn.click();
          return true;
        }
      }
      return false;
    });
    if (!clicked) continue;
    // Подписание занимает 2-4 сек: формируется новый документ или закрывается
    // диалог. Дать chain'у подтвердить.
    await page.waitForTimeout(3500);
  }
}

export default async ({ page, context, shot, env }) => {
  // --- Шаг 1. Логин председателя (он оркестрирует адаптацию). ---
  await loginAsChairman(page, context);

  // --- Шаг 2. Любой /capital/* до завершения адаптации перенаправляет на
  //            /capital/registration — это и есть страница приёма документов. ---
  await page.goto(`${env.BASE_URL}/${env.COOPNAME}/capital/projects`, { waitUntil: 'domcontentloaded' });

  // На свежей цепочке у председателя ещё нет кошелька — сначала честно
  // подписываем базовый wallet-онбординг (Положение о ЦПП Кошелёк, ЭП,
  // политика, пользовательское соглашение). Без этих 4 подписей страница
  // «Адаптация» закрыта диалогом «Прочитайте и подпишите». Capital-документы
  // (Generation/Storage/Blagorost/Generator) после этого появятся уже не как
  // диалоги, а как пункты на самой странице «Адаптация» — их не трогаем.
  await signWalletOnboardingUntilAdaptation(page);

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
