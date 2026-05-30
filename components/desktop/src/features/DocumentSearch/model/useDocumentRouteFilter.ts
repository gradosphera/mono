import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// query-параметр, которым глобальный поиск «наводит» реестр на конкретный документ.
const DOCUMENT_QUERY_KEY = 'document';

/**
 * Чтение наведённого документа из роута для страницы реестра.
 *
 * Клик по результату поиска кладёт hash документа в `?document=...`, а страница
 * реестра читает его отсюда и фильтрует список до одного документа. Бэкенд уже
 * поддерживает такой фильтр (`filter.document.hash`) — тем же путём пользуется
 * Union-страница, поэтому форму фильтра повторяем 1:1.
 */
export function useDocumentRouteFilter() {
  const route = useRoute();
  const router = useRouter();

  const documentHash = computed<string>(() => {
    const raw = route.query[DOCUMENT_QUERY_KEY];
    return typeof raw === 'string' && raw.length > 0 ? raw : '';
  });

  // hash в реестре хранится в верхнем регистре — приводим, как в Union-фильтре.
  const documentFilter = computed<Record<string, unknown>>(() =>
    documentHash.value ? { document: { hash: documentHash.value.toUpperCase() } } : {},
  );

  function clearDocumentFilter(): void {
    const query = { ...route.query };
    delete query[DOCUMENT_QUERY_KEY];
    void router.replace({ query });
  }

  return { documentHash, documentFilter, clearDocumentFilter };
}

/**
 * Навигация к документу из глобального поиска: добавляет `?document=<hash>` к
 * текущему роуту. Работает на любой странице реестра (совет/пайщик), так как
 * меняет только query, не трогая сам путь.
 */
export function useDocumentNavigation() {
  const route = useRoute();
  const router = useRouter();

  function openDocument(hash: string): void {
    if (!hash) return;
    void router.push({ query: { ...route.query, [DOCUMENT_QUERY_KEY]: hash } });
  }

  return { openDocument };
}
