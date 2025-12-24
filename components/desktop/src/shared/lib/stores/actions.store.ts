import { defineStore } from 'pinia';
import { ref } from 'vue';

const namespace = 'shared-actions';

export const useActionsStore = defineStore(namespace, () => {
  // State
  const actions = ref<Record<string, () => void>>({});

  // Methods
  const registerAction = (actionName: string, action: () => void) => {
    actions.value[actionName] = action;
  };

  const executeAction = (actionName: string) => {
    const action = actions.value[actionName];
    if (action) {
      action();
    } else {
      console.warn(`Action "${actionName}" not found`);
    }
  };

  const removeAction = (actionName: string) => {
    delete actions.value[actionName];
  };

  return {
    actions,
    registerAction,
    executeAction,
    removeAction,
  };
});
