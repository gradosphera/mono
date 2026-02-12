import { ref, type Ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';
import { FailAlert } from 'src/shared/api/alerts';

export type IEditProjectInput =
  Mutations.Capital.EditProject.IInput['data'];

export function useEditProject() {
  const initialEditProjectInput: IEditProjectInput = {
    coopname: '',
    project_hash: '',
    title: '',
    description: '',
    invite: '',
    meta: '',
    data: '',
  };

  const editProjectInput = ref<IEditProjectInput>({
    ...initialEditProjectInput,
  });

  // Состояния для авто-сохранения
  const isAutoSaving = ref(false);
  const autoSaveError = ref<string | null>(null);

  // Таймер для debounce
  let autoSaveTimeout: ReturnType<typeof setTimeout> | null = null;

  // Универсальная функция для сброса объекта к начальному состоянию
  function resetInput(
    input: Ref<IEditProjectInput>,
    initial: IEditProjectInput,
  ) {
    Object.assign(input.value, initial);
  }

  async function editProject(data: IEditProjectInput) {
    const transaction = await api.editProject(data);

    // Сбрасываем editProjectInput после выполнения editProject
    resetInput(editProjectInput, initialEditProjectInput);

    return transaction;
  }

  // Функция debounce для отложенного сохранения
  function debounceSave(data: IEditProjectInput, delay = 2000) {
    // Очищаем предыдущий таймер
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Устанавливаем новый таймер
    autoSaveTimeout = setTimeout(async () => {
      await performAutoSave(data);
    }, delay);
  }

  // Выполнение авто-сохранения
  async function performAutoSave(data: IEditProjectInput) {
    if (isAutoSaving.value) return;

    try {
      isAutoSaving.value = true;
      autoSaveError.value = null;

      await editProject(data);
    } catch (error) {
      console.error('Auto-save failed:', error);
      autoSaveError.value = 'Ошибка авто-сохранения';
      FailAlert('Не удалось автоматически сохранить изменения');
    } finally {
      isAutoSaving.value = false;
    }
  }

  // Функция для немедленного сохранения (отменяет debounce)
  async function saveImmediately(data: IEditProjectInput) {
    // Очищаем таймер debounce
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = null;
    }

    return await performAutoSave(data);
  }

  return {
    editProject,
    editProjectInput,
    // Авто-сохранение
    debounceSave,
    saveImmediately,
    isAutoSaving,
    autoSaveError,
  };
}
