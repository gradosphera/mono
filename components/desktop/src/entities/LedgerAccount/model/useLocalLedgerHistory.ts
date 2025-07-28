import { ref, type Ref } from 'vue';
import { api } from '../api';
import type {
  ILedgerHistoryFilter,
  ILedgerOperation,
  ILedgerHistoryPagination,
} from '../types';

/**
 * Композабл для локального состояния истории операций ledger
 * Каждый виджет может использовать свой экземпляр для независимого состояния
 */
export function useLocalLedgerHistory() {
  // Локальное состояние
  const operations = ref<ILedgerOperation[]>([]);
  const loading = ref(false);
  const pagination = ref<ILedgerHistoryPagination>({
    currentPage: 0,
    totalPages: 0,
    totalCount: 0,
  });
  const hasMore = ref(true);
  const filter = ref<ILedgerHistoryFilter | null>(null);

  /**
   * Загрузка первой страницы истории операций
   */
  const loadHistory = async (
    filterParams: ILedgerHistoryFilter,
  ): Promise<void> => {
    try {
      loading.value = true;
      filter.value = { ...filterParams, page: 1, limit: 20 };

      const response = await api.getLedgerHistory(filter.value);

      if (response) {
        operations.value = response.items || [];
        pagination.value = {
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          totalCount: response.totalCount || 0,
        };
        hasMore.value =
          pagination.value.currentPage < pagination.value.totalPages;
      }
    } catch (error) {
      console.error('Ошибка загрузки истории операций:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Загрузка следующей страницы для бесконечного скролла
   */
  const loadMoreHistory = async (): Promise<void> => {
    if (!hasMore.value || loading.value || !filter.value) {
      return;
    }

    try {
      loading.value = true;
      const nextPage = pagination.value.currentPage + 1;

      const nextPageFilter = {
        ...filter.value,
        page: nextPage,
      };

      const response = await api.getLedgerHistory(nextPageFilter);

      if (response && response.items) {
        // Добавляем новые операции к существующим
        operations.value.push(...response.items);
        pagination.value = {
          currentPage: response.currentPage || nextPage,
          totalPages: response.totalPages || pagination.value.totalPages,
          totalCount: response.totalCount || pagination.value.totalCount,
        };
        hasMore.value =
          pagination.value.currentPage < pagination.value.totalPages;
      }
    } catch (error) {
      console.error('Ошибка загрузки следующей страницы:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Сброс состояния
   */
  const resetHistory = (): void => {
    operations.value = [];
    pagination.value = {
      currentPage: 0,
      totalPages: 0,
      totalCount: 0,
    };
    hasMore.value = true;
    filter.value = null;
  };

  /**
   * Изменение фильтров и перезагрузка данных
   */
  const changeFilter = async (
    newFilter: ILedgerHistoryFilter,
  ): Promise<void> => {
    resetHistory();
    await loadHistory(newFilter);
  };

  return {
    // Состояние
    operations: operations as Ref<ILedgerOperation[]>,
    loading: loading as Ref<boolean>,
    pagination: pagination as Ref<ILedgerHistoryPagination>,
    hasMore: hasMore as Ref<boolean>,

    // Методы
    loadHistory,
    loadMoreHistory,
    resetHistory,
    changeFilter,
  };
}
