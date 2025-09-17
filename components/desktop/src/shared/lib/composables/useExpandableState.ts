import { reactive } from 'vue';
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
  itemsGetter: () => T[] | undefined,
  itemKeyGetter: (item: T) => string,
) {
  // Состояние развернутости элементов
  const expanded = reactive(new Map<string, boolean>());

  /**
   * Загружает сохраненное состояние из LocalStorage
   */
  const loadExpandedState = () => {
    const saved = LocalStorage.getItem(storageKey);
    if (saved && typeof saved === 'object') {
      Object.entries(saved).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          expanded.set(key, value);
        }
      });
    }
  };

  /**
   * Сохраняет текущее состояние в LocalStorage
   */
  const saveExpandedState = () => {
    const state = Object.fromEntries(expanded);
    LocalStorage.set(storageKey, state);
  };

  /**
   * Очищает устаревшие записи из expanded состояния
   * Удаляет записи для элементов, которых больше нет в текущем списке
   */
  const cleanupExpandedState = () => {
    const currentItems = itemsGetter();
    if (!currentItems) return;

    const currentItemKeys = new Set(currentItems.map(itemKeyGetter));
    const expandedKeys = Array.from(expanded.keys());

    // Удаляем из expanded элементы, которых больше нет в списке
    expandedKeys.forEach((key) => {
      if (!currentItemKeys.has(key)) {
        expanded.delete(key);
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
    expanded.set(itemKey, !expanded.get(itemKey));
    saveExpandedState();
  };

  /**
   * Устанавливает состояние развернутости для указанного элемента
   * @param itemKey - Ключ элемента
   * @param isExpanded - Новое состояние
   */
  const setExpanded = (itemKey: string, isExpanded: boolean) => {
    expanded.set(itemKey, isExpanded);
    saveExpandedState();
  };

  /**
   * Получает состояние развернутости для указанного элемента
   * @param itemKey - Ключ элемента
   * @returns true если элемент развернут, false в противном случае
   */
  const isExpanded = (itemKey: string): boolean => {
    return expanded.get(itemKey) || false;
  };

  /**
   * Очищает все состояния развернутости
   */
  const clearAllExpanded = () => {
    expanded.clear();
    LocalStorage.remove(storageKey);
  };

  return {
    expanded,
    loadExpandedState,
    saveExpandedState,
    cleanupExpandedState,
    toggleExpanded,
    setExpanded,
    isExpanded,
    clearAllExpanded,
  };
}
