import { ref, watch } from 'vue';
import { useContributorStore } from '../model';
import type { IContributor } from '../model/types';

export interface IContributorSearchOptions {
  projectHash?: string;
  coopname?: string;
  multiSelect?: boolean;
  placeholder?: string;
}

export function useContributorSearch(options: IContributorSearchOptions = {}) {
  const contributorStore = useContributorStore();
  const isSearching = ref(false);
  const selectedContributors = ref<IContributor[]>([]);
  const filteredContributors = ref<IContributor[]>([]);

  // Гарантируем, что selectedContributors всегда является массивом
  watch(selectedContributors, (newValue) => {
    if (!Array.isArray(newValue)) {
      console.warn('useContributorSearch: selectedContributors was set to non-array value', newValue);
      selectedContributors.value = [];
    }
  });

  // Загрузка вкладчиков с фильтрами
  const loadContributors = async (searchQuery?: string) => {
    if (isSearching.value) return;

    isSearching.value = true;
    try {
      await contributorStore.loadContributors({
        filter: {
          project_hash: options.projectHash,
          display_name: searchQuery || undefined,
        },
        pagination: {
          page: 1,
          limit: 50, // Ограничиваем количество для поиска
        },
      });

      // После загрузки обновляем filteredContributors
      if (contributorStore.contributors?.items) {
        filteredContributors.value = contributorStore.contributors.items;
      }
    } catch (error) {
      console.error('Ошибка при загрузке вкладчиков:', error);
    } finally {
      isSearching.value = false;
    }
  };

  // Предзагрузка вкладчиков
  const preloadContributors = async () => {
    if (isSearching.value) return;

    isSearching.value = true;
    try {
      await contributorStore.loadContributors({
        data: {
          filter: {
            coopname: options.coopname || '',
            project_hash: options.projectHash,
          },
          pagination: {
            page: 1,
            limit: 10, // Предзагружаем 10 вкладчиков
            sortBy: '_created_at',
            descending: true, // Новые сначала
          },
        },
      });

      // После загрузки обновляем filteredContributors
      if (contributorStore.contributors?.items) {
        filteredContributors.value = contributorStore.contributors.items;
      }
    } catch (error) {
      console.error('Ошибка при предзагрузке вкладчиков:', error);
    } finally {
      isSearching.value = false;
    }
  };

  // Функция для поиска (используется q-select)
  const filterFn = async (val: string, update: (callback: () => void) => void) => {
    update(() => {
      if (val.length < 2) {
        // Для коротких запросов показываем предзагруженные данные
        filteredContributors.value = contributorStore.contributors?.items || [];
      } else {
        // Делаем запрос на бэкенд с фильтром
        loadContributors(val);
        // Пока идет загрузка, показываем предзагруженные данные отфильтрованные локально
        const allContributors = contributorStore.contributors?.items || [];
        filteredContributors.value = allContributors.filter(contributor =>
          contributor.display_name?.toLowerCase().includes(val.toLowerCase()) ||
          contributor.username?.toLowerCase().includes(val.toLowerCase())
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
