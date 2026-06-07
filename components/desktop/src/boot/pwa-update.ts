import { boot } from 'quasar/wrappers';
import { UpdateAlert } from 'src/shared/api/alerts';

// Связывает событие service worker'а ('sw:update-available' из
// src-pwa/register-service-worker.ts) с канон-тостом. SW не может звать Quasar
// Notify напрямую — только через window-событие. По «Обновить» зовём
// window.applyUpdate() → SKIP_WAITING → controllerchange → reload (см. register-service-worker.ts).
export default boot(() => {
  if (typeof window === 'undefined') return; // SSR-safe: только клиент

  // Флаг гасит ДУБЛИ одного и того же обновления (registration.update()
  // дёргается на каждый visibilitychange). При «Позже» сбрасываем — чтобы
  // СЛЕДУЮЩИЙ релиз снова показал тост. «Обновить» перезагружает страницу.
  let shown = false;
  window.addEventListener('sw:update-available', () => {
    if (shown) return;
    shown = true;
    UpdateAlert(
      () => {
        const w = window as unknown as { applyUpdate?: () => void };
        if (typeof w.applyUpdate === 'function') {
          w.applyUpdate();
        } else {
          window.location.reload();
        }
      },
      () => {
        shown = false; // отклонил → разрешаем показать при следующем релизе
      },
    );
  });
});
