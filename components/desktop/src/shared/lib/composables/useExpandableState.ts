import { ref } from 'vue';
import { LocalStorage } from 'quasar';

/**
 * Композабл для управления состоянием развернутости элементов с сохранением в LocalStorage
 * @param storageKey - Ключ для сохранения состояния в LocalStorage
 * @param itemsGetter - Функция, возвращающая массив текущих элементов для очистки устаревших записей
 * @param itemKeyGetter - Функция, извлекающая ключ из элемента
 * @returns Объект с состоянием expanded и методами для работы с ним
 */
export function useExpandableState<T>(
  storageKey: string,
  itemsGetter?: () => T[] | undefined,
  itemKeyGetter?: (item: T) => string,
) {
  // Состояние развернутости элементов
  const expanded = ref<Record<string, boolean>>({});

  /**
   * Загружает сохраненное состояние из LocalStorage
   */
  const loadExpandedState = () => {
    const saved = LocalStorage.getItem(storageKey);
    if (saved && typeof saved === 'object') {
      Object.entries(saved).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          expanded.value[key] = value;
        }
      });
    }
  };

  /**
   * Сохраняет текущее состояние в LocalStorage
   */
  const saveExpandedState = () => {
    LocalStorage.set(storageKey, { ...expanded.value });
  };

  /**
   * Очищает устаревшие записи из expanded состояния
   * Удаляет записи для элементов, которых больше нет в текущем списке
   */
  const cleanupExpandedState = () => {
    // Работает только если переданы itemsGetter и itemKeyGetter
    if (!itemsGetter || !itemKeyGetter) return;

    const currentItems = itemsGetter();
    if (!currentItems) return;

    const currentItemKeys = new Set(currentItems.map(itemKeyGetter));
    const expandedKeys = Object.keys(expanded.value);

    // Удаляем из expanded элементы, которых больше нет в списке
    expandedKeys.forEach((key) => {
      if (!currentItemKeys.has(key)) {
        delete expanded.value[key];
      }
    });

    // Сохраняем очищенное состояние
    saveExpandedState();
  };

  /**
   * Переключает состояние развернутости для указанного элемента
   * @param itemKey - Ключ элемента
   */
  const toggleExpanded = (itemKey: string) => {
    expanded.value[itemKey] = !(expanded.value[itemKey] || false);
    saveExpandedState();
  };

  /**
   * Устанавливает состояние развернутости для указанного элемента
   * @param itemKey - Ключ элемента
   * @param isExpanded - Новое состояние
   */
  const setExpanded = (itemKey: string, isExpanded: boolean) => {
    expanded.value[itemKey] = isExpanded;
    saveExpandedState();
  };

  /**
   * Получает состояние развернутости для указанного элемента
   * @param itemKey - Ключ элемента
   * @returns true если элемент развернут, false в противном случае
   */
  const isExpanded = (itemKey: string): boolean => {
    return expanded.value[itemKey] || false;
  };

  /**
   * Очищает устаревшие записи из expanded состояния по массиву актуальных ключей
   * Удаляет записи для элементов, которых нет в переданном массиве
   */
  const cleanupExpandedByKeys = (currentKeys: string[]) => {
    const currentKeysSet = new Set(currentKeys);
    const expandedKeys = Object.keys(expanded.value);

    // Удаляем из expanded элементы, которых больше нет в списке
    expandedKeys.forEach((key) => {
      if (!currentKeysSet.has(key)) {
        delete expanded.value[key];
      }
    });

    // Сохраняем очищенное состояние
    saveExpandedState();
  };

  /**
   * Очищает все состояния развернутости
   */
  const clearAllExpanded = () => {
    Object.keys(expanded.value).forEach(key => delete expanded.value[key]);
    LocalStorage.remove(storageKey);
  };

  return {
    expanded,
    loadExpandedState,
    saveExpandedState,
    cleanupExpandedState,
    cleanupExpandedByKeys,
    toggleExpanded,
    setExpanded,
    isExpanded,
    clearAllExpanded,
  };
}
