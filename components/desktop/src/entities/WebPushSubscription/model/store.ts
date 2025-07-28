import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  IWebPushSubscription,
  ISubscriptionState,
  IPushNotificationSupport,
} from './types';

export const useWebPushSubscriptionStore = defineStore(
  'webPushSubscription',
  () => {
    // Состояние
    const subscriptions = ref<IWebPushSubscription[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const support = ref<IPushNotificationSupport>({
      isSupported: false,
      hasPermission: false,
      permission: 'default',
      hasServiceWorker: false,
      canSubscribe: false,
    });

    // Состояние диалога разрешения уведомлений
    const isPermissionDialogVisible = ref(false);
    const isPermissionDialogProcessing = ref(false);

    // Computed свойства
    const activeSubscription = computed(() =>
      subscriptions.value.find((sub) => sub.isActive),
    );

    const isSubscribed = computed(() => Boolean(activeSubscription.value));

    const subscriptionState = computed<ISubscriptionState>(() => ({
      isSubscribed: isSubscribed.value,
      subscription: activeSubscription.value || null,
      isLoading: isLoading.value,
      error: error.value,
      support: support.value,
    }));

    return {
      // Состояние
      subscriptions,
      isLoading,
      error,
      support,

      // Состояние диалога разрешения уведомлений
      isPermissionDialogVisible,
      isPermissionDialogProcessing,

      // Computed
      activeSubscription,
      isSubscribed,
      subscriptionState,
    };
  },
);
