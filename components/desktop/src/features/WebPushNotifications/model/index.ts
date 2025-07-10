import { ref, computed } from 'vue';
import { useWebPushSubscriptionStore } from 'src/entities/WebPushSubscription';
import { webPushSubscriptionApi } from 'src/entities/WebPushSubscription';
import { webPushNotificationsMutations } from '../api';
import { useSessionStore } from 'src/entities/Session';
import { SuccessAlert, FailAlert } from 'src/shared/api/alerts';
import { env } from 'src/shared/config';
import type {
  ICreateSubscriptionData,
  IPushNotificationSupport,
  IGetUserSubscriptionsInput,
} from 'src/entities/WebPushSubscription';

export function useWebPushNotifications() {
  const store = useWebPushSubscriptionStore();
  const sessionStore = useSessionStore();

  const isProcessing = ref(false);

  // Computed свойства
  const canSubscribe = computed(
    () =>
      store.support.canSubscribe && sessionStore.isAuth && !store.isSubscribed,
  );

  const canUnsubscribe = computed(
    () => store.isSubscribed && sessionStore.isAuth,
  );

  const subscriptionStatus = computed(() => {
    if (!store.support.isSupported) return 'unsupported';
    if (!store.support.hasPermission) return 'permission_denied';
    if (store.isSubscribed) return 'subscribed';
    return 'not_subscribed';
  });

  // Методы работы с состоянием
  const checkPushNotificationSupport = (): IPushNotificationSupport => {
    const result: IPushNotificationSupport = {
      isSupported: false,
      hasPermission: false,
      permission: 'default',
      hasServiceWorker: false,
      canSubscribe: false,
    };

    try {
      // Проверяем поддержку Push API
      if (!('serviceWorker' in navigator)) {
        result.error = 'Service Worker не поддерживается';
        return result;
      }

      if (!('PushManager' in window)) {
        result.error = 'Push API не поддерживается';
        return result;
      }

      if (!('Notification' in window)) {
        result.error = 'Notifications API не поддерживается';
        return result;
      }

      result.isSupported = true;
      result.hasServiceWorker = true;
      result.permission = Notification.permission;
      result.hasPermission = Notification.permission === 'granted';
      result.canSubscribe = result.hasPermission && result.isSupported;
    } catch (err) {
      result.error = `Ошибка проверки поддержки: ${err}`;
    }

    return result;
  };

  const updateSupport = () => {
    store.support = checkPushNotificationSupport();
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      if (!store.support.isSupported) {
        throw new Error('Push уведомления не поддерживаются');
      }

      const permission = await Notification.requestPermission();
      store.support.permission = permission;
      store.support.hasPermission = permission === 'granted';
      store.support.canSubscribe =
        store.support.hasPermission && store.support.isSupported;

      if (permission === 'granted') {
        SuccessAlert('Разрешение на уведомления получено');
      } else {
        FailAlert('Разрешение на уведомления отклонено');
      }

      return permission === 'granted';
    } catch (err) {
      store.error = `Ошибка запроса разрешения: ${err}`;
      FailAlert(err);
      return false;
    }
  };

  /**
   * Сброс разрешения для тестирования
   * Программно полностью сбросить разрешение браузера нельзя,
   * но можно форсировать запрос нового разрешения
   */
  const resetPermission = async (): Promise<void> => {
    try {
      // Сбрасываем состояние в store
      store.support.permission = 'default';
      store.support.hasPermission = false;
      store.support.canSubscribe = false;

      // Отписываемся от текущих подписок
      const registration = await getServiceWorkerRegistration();
      if (registration) {
        const browserSubscription =
          await registration.pushManager.getSubscription();
        if (browserSubscription) {
          await browserSubscription.unsubscribe();
        }
      }

      // Очищаем подписки в store
      store.subscriptions = [];

      console.log(
        'Разрешение сброшено. Теперь можно запросить новое разрешение.',
      );
      SuccessAlert(
        'Разрешение сброшено. Теперь можно запросить новое разрешение.',
      );
    } catch (error) {
      console.error('Ошибка сброса разрешения:', error);
      FailAlert(error);
    }
  };

  /**
   * Форсированный запрос разрешения (игнорирует текущее состояние)
   */
  const forceRequestPermission = async (): Promise<boolean> => {
    try {
      if (!store.support.isSupported) {
        throw new Error('Push уведомления не поддерживаются');
      }

      console.log('Форсированный запрос разрешения...');
      const permission = await Notification.requestPermission();

      store.support.permission = permission;
      store.support.hasPermission = permission === 'granted';
      store.support.canSubscribe =
        store.support.hasPermission && store.support.isSupported;

      if (permission === 'granted') {
        SuccessAlert('Разрешение на уведомления получено');
      } else {
        FailAlert('Разрешение на уведомления отклонено');
      }

      return permission === 'granted';
    } catch (err) {
      store.error = `Ошибка запроса разрешения: ${err}`;
      FailAlert(err);
      return false;
    }
  };

  const loadUserSubscriptions = async () => {
    if (!sessionStore.isAuth || !sessionStore.username) return;

    try {
      store.isLoading = true;
      store.error = null;

      const data: IGetUserSubscriptionsInput = {
        username: sessionStore.username,
      };

      store.subscriptions =
        await webPushSubscriptionApi.getUserWebPushSubscriptions(data);
    } catch (err) {
      store.error = `Ошибка загрузки подписок: ${err}`;
      console.error('Ошибка загрузки подписок:', err);
    } finally {
      store.isLoading = false;
    }
  };

  /**
   * Преобразование base64 URL в Uint8Array для VAPID ключа
   */
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  /**
   * Получение service worker registration
   */
  const getServiceWorkerRegistration =
    async (): Promise<ServiceWorkerRegistration | null> => {
      try {
        if (!('serviceWorker' in navigator)) {
          throw new Error('Service Worker не поддерживается');
        }

        // Добавляем timeout для navigator.serviceWorker.ready
        const registration = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(new Error('Service Worker не готов в течение 5 секунд'));
            }, 5000);
          }),
        ]);

        return registration;
      } catch (error) {
        console.error('Ошибка получения Service Worker:', error);
        return null;
      }
    };

  /**
   * Создание push подписки в браузере
   */
  const createBrowserSubscription =
    async (): Promise<PushSubscription | null> => {
      try {
        const registration = await getServiceWorkerRegistration();
        if (!registration) {
          throw new Error('Service Worker не готов');
        }

        // Проверяем существующую подписку
        const existingSubscription =
          await registration.pushManager.getSubscription();
        if (existingSubscription) {
          return existingSubscription;
        }

        // Получаем VAPID ключ из окружения
        const vapidPublicKey = env.VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          throw new Error('VAPID_PUBLIC_KEY не найден в конфигурации');
        }

        // Конвертируем VAPID ключ в Uint8Array
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

        // Создаем новую подписку
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        });

        return subscription;
      } catch (error) {
        console.error('Ошибка создания подписки в браузере:', error);
        throw error;
      }
    };

  /**
   * Преобразование PushSubscription в ICreateSubscriptionData
   */
  const convertPushSubscriptionToData = (
    subscription: PushSubscription,
  ): ICreateSubscriptionData => {
    const p256dh = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    if (!p256dh || !auth) {
      throw new Error('Не удалось получить ключи подписки');
    }

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dh))),
        auth: btoa(String.fromCharCode(...new Uint8Array(auth))),
      },
      userAgent: navigator.userAgent,
    };
  };

  /**
   * Подписка на push уведомления
   */
  const subscribe = async (): Promise<boolean> => {
    if (isProcessing.value) return false;

    try {
      isProcessing.value = true;

      // Проверяем поддержку
      if (!store.support.isSupported) {
        throw new Error(
          store.support.error || 'Push уведомления не поддерживаются',
        );
      }
      console.log('store.support.hasPermission', store.support.hasPermission);
      // Запрашиваем разрешение если нужно
      if (!store.support.hasPermission) {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      // Создаем подписку в браузере
      const browserSubscription = await createBrowserSubscription();
      if (!browserSubscription) {
        throw new Error('Не удалось создать подписку в браузере');
      }

      // Преобразуем в формат для сервера
      const subscriptionData =
        convertPushSubscriptionToData(browserSubscription);

      // Сохраняем на сервере
      const result =
        await webPushNotificationsMutations.createWebPushSubscription(
          subscriptionData,
          sessionStore.username,
        );

      if (result.success && result.subscription) {
        // Ищем существующую подписку с таким же endpoint
        const existingIndex = store.subscriptions.findIndex(
          (sub) => sub.endpoint === result.subscription.endpoint,
        );

        if (existingIndex !== -1) {
          // Обновляем существующую подписку
          store.subscriptions[existingIndex] = result.subscription;
        } else {
          // Добавляем новую подписку
          store.subscriptions.push(result.subscription);
        }

        SuccessAlert('Подписка на уведомления успешно создана');
        return true;
      } else {
        throw new Error(result.message || 'Ошибка создания подписки');
      }
    } catch (error) {
      console.error('Ошибка подписки:', error);
      FailAlert(error);
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * Отписка от push уведомлений
   */
  const unsubscribe = async (): Promise<boolean> => {
    if (isProcessing.value) return false;

    try {
      isProcessing.value = true;

      // Получаем текущую браузерную подписку
      const registration = await getServiceWorkerRegistration();
      if (!registration) {
        throw new Error('Service Worker не найден');
      }

      const browserSubscription =
        await registration.pushManager.getSubscription();
      if (!browserSubscription) {
        throw new Error('Браузерная подписка не найдена');
      }

      // Ищем соответствующую подписку в store по endpoint
      const correspondingSubscription = store.subscriptions.find(
        (sub) => sub.endpoint === browserSubscription.endpoint && sub.isActive,
      );

      if (!correspondingSubscription) {
        throw new Error('Соответствующая подписка в store не найдена');
      }

      // Деактивируем на сервере
      await webPushNotificationsMutations.deactivateWebPushSubscription(
        correspondingSubscription.id,
      );

      // Обновляем локальное состояние
      correspondingSubscription.isActive = false;

      // Отписываемся в браузере
      await browserSubscription.unsubscribe();

      SuccessAlert('Подписка на уведомления отключена');
      return true;
    } catch (error) {
      console.error('Ошибка отписки:', error);
      FailAlert(error);
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  /**
   * Инициализация системы push уведомлений
   */
  const initialize = async () => {
    updateSupport();
    if (sessionStore.isAuth) {
      await loadUserSubscriptions();
    }
  };

  /**
   * Автоматическая подписка при первом входе (если поддерживается)
   */
  const autoSubscribeIfSupported = async (): Promise<void> => {
    try {
      console.log('=== Начало autoSubscribeIfSupported ===');

      // Проверяем поддержку
      updateSupport();

      if (!store.support.isSupported || store.isSubscribed) {
        console.log('Подписка не поддерживается или уже есть, выходим');
        return;
      }
      console.log('store.', store);

      // Не запрашиваем разрешение автоматически, только если уже есть
      if (store.support.hasPermission) {
        console.log('Автоматическая подписка на push уведомления...');

        // Проверяем готовность Service Worker с timeout
        if ('serviceWorker' in navigator) {
          console.log('Service Worker поддерживается, проверяем готовность...');

          // Проверяем статус Service Worker
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          console.log('Текущие регистрации Service Worker:', registrations);

          if (registrations.length === 0) {
            console.log('Service Worker не зарегистрирован');
            return;
          }

          const isServiceWorkerReady = await Promise.race([
            navigator.serviceWorker.ready.then(() => {
              console.log('Service Worker готов');
              return true;
            }),
            new Promise<boolean>((resolve) => {
              setTimeout(() => {
                console.log(
                  'Timeout: Service Worker не готов в течение 3 секунд',
                );
                resolve(false);
              }, 3000);
            }),
          ]);

          if (!isServiceWorkerReady) {
            console.log(
              'Service Worker не готов, пропускаем автоматическую подписку',
            );
            return;
          }
        } else {
          console.log('Service Worker не поддерживается браузером');
          return;
        }

        console.log('Вызываем subscribe...');
        await subscribe();
      } else {
        console.log('Нет разрешения на уведомления');
      }
    } catch (error) {
      console.error('Ошибка автоматической подписки:', error);
      // Не показываем пользователю ошибку автоматической подписки
    }
  };

  return {
    // Состояние
    isProcessing,
    subscriptionState: store.subscriptionState,
    support: computed(() => store.support),

    // Computed
    canSubscribe,
    canUnsubscribe,
    subscriptionStatus,

    // Методы
    initialize,
    updateSupport,
    requestPermission,
    resetPermission,
    forceRequestPermission,
    subscribe,
    unsubscribe,
    autoSubscribeIfSupported,
    loadUserSubscriptions,
  };
}
