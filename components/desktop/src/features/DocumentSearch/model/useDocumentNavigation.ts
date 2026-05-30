import { useRoute, useRouter } from 'vue-router';

/**
 * Навигация к отдельной странице документа из глобального поиска.
 *
 * Открываем canon-страницу документа (`DocumentDetailsPage`) по hash — она сама
 * загружает документ и поддерживает прямой переход по ссылке (deep-link). Имя
 * detail-маршрута выводим из текущего раздела (поиск доступен только в реестрах):
 * `documents` (совет) → `document-details`, `user-documents` (пайщик) →
 * `user-document-details` — по аналогии с карточкой собрания meet-details.
 */
export function useDocumentNavigation() {
  const route = useRoute();
  const router = useRouter();

  function openDocument(hash: string): void {
    if (!hash) return;
    const coopname = route.params.coopname as string;
    const name = route.name === 'user-documents' ? 'user-document-details' : 'document-details';
    void router.push({ name, params: { coopname, hash } });
  }

  return { openDocument };
}
