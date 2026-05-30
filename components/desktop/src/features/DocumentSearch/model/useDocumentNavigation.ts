import { useRoute, useRouter } from 'vue-router';
import { useDesktopStore } from 'src/entities/Desktop';

/**
 * Навигация к отдельной странице документа из глобального поиска.
 *
 * Открываем canon-страницу документа (`DocumentDetailsPage`) по hash — она сама
 * загружает документ и поддерживает прямой переход по ссылке (deep-link). Имя
 * маршрута зависит от рабочего стола: совет → `document-details`, пайщик →
 * `user-document-details` (по аналогии с карточкой собрания meet-details).
 */
export function useDocumentNavigation() {
  const route = useRoute();
  const router = useRouter();
  const desktopStore = useDesktopStore();

  function openDocument(hash: string): void {
    if (!hash) return;
    const coopname = route.params.coopname as string;
    const name =
      desktopStore.activeWorkspaceName === 'soviet' ? 'document-details' : 'user-document-details';
    void router.push({ name, params: { coopname, hash } });
  }

  return { openDocument };
}
