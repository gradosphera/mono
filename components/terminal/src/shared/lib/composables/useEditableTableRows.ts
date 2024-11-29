// src/shared/composables/useEditableTableRows.ts
import { reactive, watch, UnwrapRef, Ref } from 'vue';

interface UseEditableTableRowsOptions {
  rows: Ref<UnwrapRef<any[]>>;
  rowKey: string;
}

export function useEditableTableRows({ rows, rowKey }: UseEditableTableRowsOptions) {
  const expanded = reactive(new Map<string, boolean>());
  const originalData = reactive(new Map<string, any>());
  const isEdited = reactive(new Map<string, boolean>());
  const watchers = new Map<string, () => void>();

  const toggleExpand = (id: string) => {
    if (!expanded.get(id)) {
      const index = rows.value.findIndex((row) => row[rowKey] === id);
      if (index !== -1) {
        const originalRow = JSON.parse(JSON.stringify(rows.value[index]));
        originalData.set(id, originalRow);
        isEdited.set(id, false);

        const unwatch = watch(
          () => rows.value[index],
          () => {
            checkChanges(id);
          },
          { deep: true }
        );
        watchers.set(id, unwatch);
      } else {
        console.warn(`Строка с id ${id} не найдена.`);
        expanded.set(id, false);
        return;
      }
    } else {
      const unwatch = watchers.get(id);
      if (unwatch) {
        unwatch();
        watchers.delete(id);
      }
      originalData.delete(id);
      isEdited.delete(id);
    }
    expanded.set(id, !expanded.get(id));
  };

  const checkChanges = (id: string) => {
    const originalRow = originalData.get(id);
    const index = rows.value.findIndex((row) => row[rowKey] === id);
    if (originalRow && index !== -1) {
      const currentRow = rows.value[index];
      if (JSON.stringify(originalRow) !== JSON.stringify(currentRow)) {
        isEdited.set(id, true);
      } else {
        isEdited.set(id, false);
      }
    } else {
      isEdited.set(id, false);
    }
  };

  const resetRow = (id: string) => {
    const originalRow = originalData.get(id);
    const index = rows.value.findIndex((row) => row[rowKey] === id);
    if (originalRow && index !== -1) {
      const currentRow = rows.value[index];
      Object.assign(currentRow, JSON.parse(JSON.stringify(originalRow)));
      isEdited.set(id, false);
    }
  };

  const updateOriginalRow = (id: string) => {
    const index = rows.value.findIndex((row) => row[rowKey] === id);
    if (index !== -1) {
      const currentRow = rows.value[index];
      originalData.set(id, JSON.parse(JSON.stringify(currentRow)));
      isEdited.set(id, false);
    }
  };

  return {
    expanded,
    isEdited,
    toggleExpand,
    resetRow,
    updateOriginalRow,
  };
}
