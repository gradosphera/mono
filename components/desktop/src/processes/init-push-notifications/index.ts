import { useWebPushNotifications } from 'src/features/WebPushNotifications';
import { useSessionStore } from 'src/entities/Session';

/**
 * Процесс инициализации push уведомлений
 */
export async function useInitPushNotificationsProcess() {
  const { initialize, autoSubscribeIfSupported } = useWebPushNotifications();
  const session = useSessionStore();

  try {
    // Инициализируем систему push уведомлений
    await initialize();

    // Если пользователь авторизован, пробуем автоматически подписаться
    if (session.isAuth) {
      await autoSubscribeIfSupported();
    }
  } catch (error) {
    console.error('Ошибка инициализации push уведомлений:', error);
    // Не прерываем загрузку приложения из-за ошибки push уведомлений
  }
}
