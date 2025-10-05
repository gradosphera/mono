import { ref, watch } from 'vue';
import { api } from '../api';
import type { IContributor, IContributorsPagination } from '../model/types';

export interface IContributorSearchOptions {
  projectHash?: string;
  coopname?: string;
  multiSelect?: boolean;
  placeholder?: string;
}

export function useContributorSearch(options: IContributorSearchOptions = {}) {
  const isSearching = ref(false);
  const selectedContributors = ref<IContributor[]>([]);
  const filteredContributors = ref<IContributor[]>([]);
  const allContributors = ref<IContributor[]>([]); // Локальное хранилище всех вкладчиков для этого селектора

  // Гарантируем, что selectedContributors всегда является массивом
  watch(selectedContributors, (newValue) => {
    if (!Array.isArray(newValue)) {
      console.warn('useContributorSearch: selectedContributors was set to non-array value', newValue);
      selectedContributors.value = [];
    }
  });

  // Загрузка вкладчиков с фильтрами
  const loadContributors = async (searchQuery?: string): Promise<IContributorsPagination | null> => {
    if (isSearching.value) return null;

    isSearching.value = true;
    try {
      const result = await api.loadContributors({
        filter: {
          project_hash: options.projectHash,
          display_name: searchQuery || undefined,
        },
        pagination: {
          page: 1,
          limit: 50, // Ограничиваем количество для поиска
        },
      });

      // Сохраняем все вкладчиков локально
      if (result.items) {
        allContributors.value = result.items;
        filteredContributors.value = result.items;
      }

      return result;
    } catch (error) {
      console.error('Ошибка при загрузке вкладчиков:', error);
      return null;
    } finally {
      isSearching.value = false;
    }
  };

  // Предзагрузка вкладчиков
  const preloadContributors = async (): Promise<IContributorsPagination | null> => {
    if (isSearching.value) return null;

    isSearching.value = true;
    try {
      const result = await api.loadContributors({
        filter: {
          project_hash: options.projectHash,
        },
        pagination: {
          page: 1,
          limit: 10, // Предзагружаем 10 вкладчиков
          sortBy: '_created_at',
          descending: true, // Новые сначала
        },

      });

      // Сохраняем все вкладчиков локально
      if (result.items) {
        allContributors.value = result.items;
        filteredContributors.value = result.items;
      }

      return result;
    } catch (error) {
      console.error('Ошибка при предзагрузке вкладчиков:', error);
      return null;
    } finally {
      isSearching.value = false;
    }
  };

  // Функция для поиска (используется q-select)
  const filterFn = async (val: string, update: (callback: () => void) => void) => {
    update(() => {
      if (val.length < 2) {
        // Для коротких запросов показываем предзагруженные данные
        filteredContributors.value = allContributors.value;
      } else {
        // Делаем запрос на бэкенд с фильтром
        loadContributors(val);
        // Пока идет загрузка, показываем локальные данные отфильтрованные локально
        filteredContributors.value = allContributors.value.filter(contributor =>
          contributor && (
            contributor.display_name?.toLowerCase().includes(val.toLowerCase()) ||
            contributor.username?.toLowerCase().includes(val.toLowerCase())
          )
        );
      }
    });
  };

  // Удаление выбранного вкладчика
  const removeContributor = (contributorId: string) => {
    if (!Array.isArray(selectedContributors.value)) {
      console.warn('useContributorSearch: selectedContributors is not an array', selectedContributors.value);
      selectedContributors.value = [];
      return;
    }
    selectedContributors.value = selectedContributors.value.filter(c => String(c?.id) !== contributorId);
  };

  // Очистка поиска
  const clearSearch = () => {
    selectedContributors.value = [];
  };

  return {
    // Реактивные данные
    isSearching,
    selectedContributors,
    filteredContributors,

    // Методы
    loadContributors,
    preloadContributors,
    filterFn,
    removeContributor,
    clearSearch,
  };
}
