import { ref, onBeforeUnmount, type Component, markRaw } from 'vue';

export interface RightDrawerAction {
  id: string;
  component: Component;
  props?: Record<string, any>;
  order?: number;
}

const rightDrawerActions = ref<RightDrawerAction[]>([]);

export const useRightDrawer = () => {
  const registeredActions = ref<string[]>([]);

  const registerAction = (action: RightDrawerAction) => {
    // Проверяем, не зарегистрирован ли уже такой ID
    const existingIndex = rightDrawerActions.value.findIndex(
      (a) => a.id === action.id,
    );

    // Создаем действие с markRaw для компонента
    const actionWithMarkRaw = {
      ...action,
      component: markRaw(action.component),
    };

    if (existingIndex > -1) {
      // Обновляем существующий
      rightDrawerActions.value[existingIndex] = actionWithMarkRaw;
    } else {
      // Добавляем новый
      rightDrawerActions.value.push(actionWithMarkRaw);
    }

    // Сортируем по порядку
    rightDrawerActions.value.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Запоминаем что мы зарегистрировали
    if (!registeredActions.value.includes(action.id)) {
      registeredActions.value.push(action.id);
    }
  };

  const unregisterAction = (actionId: string) => {
    const index = rightDrawerActions.value.findIndex((a) => a.id === actionId);
    if (index > -1) {
      rightDrawerActions.value.splice(index, 1);
    }

    const registeredIndex = registeredActions.value.indexOf(actionId);
    if (registeredIndex > -1) {
      registeredActions.value.splice(registeredIndex, 1);
    }
  };

  const clearActions = () => {
    // Очищаем только те действия, которые зарегистрировал этот компонент
    registeredActions.value.forEach((actionId) => {
      unregisterAction(actionId);
    });
    registeredActions.value = [];
  };

  // Автоматически очищаем при размонтировании компонента
  onBeforeUnmount(() => {
    clearActions();
  });

  return {
    registerAction,
    unregisterAction,
    clearActions,
  };
};

// Отдельный composable для чтения состояния (для default.vue)
export const useRightDrawerReader = () => {
  return {
    rightDrawerActions,
  };
};
