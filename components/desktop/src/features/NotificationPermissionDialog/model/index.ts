import { computed } from 'vue';
import { LocalStorage } from 'quasar';
import { useSessionStore } from 'src/entities/Session';
import { useWebPushSubscriptionStore } from 'src/entities/WebPushSubscription';
import { useWebPushNotifications } from 'src/features/WebPushNotifications/model';

const PERMISSION_CHOICE_KEY = 'notification_permission_choice';

export interface INotificationPermissionChoice {
  hasDecided: boolean;
  choice: 'granted' | 'denied' | null;
  timestamp: number;
}

export function useNotificationPermissionDialog() {
  const sessionStore = useSessionStore();
  const store = useWebPushSubscriptionStore();
  const { subscribe, updateSupport, support } = useWebPushNotifications();

  // Получаем сохраненный выбор пользователя
  const getSavedChoice = (): INotificationPermissionChoice => {
    const saved = LocalStorage.getItem(PERMISSION_CHOICE_KEY);
    if (saved && typeof saved === 'object') {
      return saved as INotificationPermissionChoice;
    }
    return {
      hasDecided: false,
      choice: null,
      timestamp: 0,
    };
  };

  // Сохраняем выбор пользователя
  const saveChoice = (choice: 'granted' | 'denied') => {
    const choiceData: INotificationPermissionChoice = {
      hasDecided: true,
      choice,
      timestamp: Date.now(),
    };
    LocalStorage.setItem(PERMISSION_CHOICE_KEY, choiceData);
  };

  // Проверяем, нужно ли показывать диалог
  const shouldShowDialog = computed(() => {
    // Пользователь должен быть авторизован
    if (!sessionStore.isAuth) return false;

    // Обновляем поддержку
    updateSupport();

    // Браузер должен поддерживать push уведомления
    if (!support.value.isSupported) return false;

    // Проверяем сохраненный выбор
    const savedChoice = getSavedChoice();
    if (savedChoice.hasDecided) return false;

    // Браузер не должен уже иметь разрешение
    if (support.value.hasPermission) return false;

    // Должна быть возможность показать диалог запроса разрешения
    if (support.value.permission === 'denied') return false;

    return true;
  });

  // Показать диалог
  const showDialog = () => {
    if (shouldShowDialog.value) {
      store.isPermissionDialogVisible = true;
    }
  };

  // Скрыть диалог
  const hideDialog = () => {
    store.isPermissionDialogVisible = false;
  };

  // Обработка согласия пользователя
  const handleAllow = async () => {
    try {
      store.isPermissionDialogProcessing = true;

      // Подписываемся на уведомления (это включает запрос разрешения)
      const success = await subscribe();

      if (success) {
        saveChoice('granted');
        hideDialog();
      } else {
        // Если подписка не удалась, но пользователь согласился,
        // все равно сохраняем выбор чтобы не показывать диалог снова
        saveChoice('denied');
        hideDialog();
      }
    } catch (error) {
      console.error('Ошибка при разрешении уведомлений:', error);
      saveChoice('denied');
      hideDialog();
    } finally {
      store.isPermissionDialogProcessing = false;
    }
  };

  // Обработка отказа пользователя
  const handleDeny = () => {
    saveChoice('denied');
    hideDialog();
  };

  // Сброс выбора (для тестирования)
  const resetChoice = () => {
    LocalStorage.removeItem(PERMISSION_CHOICE_KEY);
  };

  return {
    // Состояние
    isDialogVisible: computed(() => store.isPermissionDialogVisible),
    isProcessing: computed(() => store.isPermissionDialogProcessing),
    shouldShowDialog,

    // Методы
    showDialog,
    hideDialog,
    handleAllow,
    handleDeny,
    resetChoice,
    getSavedChoice,
  };
}
