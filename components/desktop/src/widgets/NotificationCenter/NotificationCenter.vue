<template lang="pug">
#notification-inbox.notification-container
</template>

<script setup lang="ts">
import { useSessionStore } from 'src/entities/Session';
import { useQuasar } from 'quasar';
import { env } from 'src/shared/config';
import { NotifyAlert } from 'src/shared/api';
import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue';

const session = useSessionStore();
const $q = useQuasar();
const isDark = computed(() => $q.dark.isActive);

// Определяем роль пользователя
// const userRole = computed((): string => {
//   if (session.isChairman) {
//     return 'chairman';
//   }
//   if (session.isMember) {
//     return 'member';
//   }
//   return 'user';
// });

// // Создаем статические табы с правильными фильтрами
// function createNotificationTabs() {
//   return [
//     {
//       label: 'Пайщик',
//       filter: {
//         // Вкладка "Пользователь" показывает все уведомления
//         tags: ['user', 'member', 'chairman'],
//       },
//     },
//     {
//       label: 'Член совета',
//       filter: {
//         // Вкладка "Член совета" показывает только member воркфлоу
//         tags: ['member'],
//       },
//     },
//     {
//       label: 'Председатель',
//       filter: {
//         // Вкладка "Председатель" показывает только chairman воркфлоу
//         tags: ['chairman'],
//       },
//     },
//   ];
// }

let novuUI: any = null;
let novu: any = null;
const unsubscribeFunctions = ref<Array<() => void>>([]);

/** Novu не участвует в критическом пути загрузки: монтируем после idle / с небольшой отсрочкой. */
function scheduleMountNovu() {
  if (typeof window === 'undefined') return;
  const run = () => {
    void mountNovu();
  };
  const ric = window.requestIdleCallback;
  if (typeof ric === 'function') {
    ric(run, { timeout: 10_000 });
  } else {
    window.setTimeout(run, 1);
  }
}

async function mountNovu() {
  try {
    // Отписываемся от предыдущих подписок при перемонтировании
    unsubscribeFromNotifications();

    // Динамический импорт только на клиенте
    const { NovuUI } = await import('@novu/js/ui');
    const { Novu } = await import('@novu/js');
    const { dark } = await import('@novu/js/themes');

    // Получаем данные подписчика из providerAccount
    const providerAccount = session.providerAccount;

    if (!providerAccount?.subscriber_id || !providerAccount?.subscriber_hash) {
      console.error(
        'Не удалось получить данные подписчика NOVU из providerAccount. Повторите попытку.',
      );
      return;
    }

    const { subscriber_id, subscriber_hash } = providerAccount;

    // Создаем базовый экземпляр Novu для работы с API и событиями
    novu = new Novu({
      applicationIdentifier: env.NOVU_APP_ID,
      subscriber: subscriber_id,
      subscriberHash: subscriber_hash,
      apiUrl: env.NOVU_BACKEND_URL,
      socketUrl: env.NOVU_SOCKET_URL,
    });

    // Создаем статические табы с правильными фильтрами
    // const tabs = createNotificationTabs();

    // console.log(
    //   'Текущая роль пользователя:',
    //   userRole.value,
    //   'Созданные табы:',
    //   tabs.map((tab) => tab.label),
    // );

    const el = document.getElementById('notification-inbox');
    if (el) el.innerHTML = '';

    // Создаем экземпляр NovuUI и передаем в него экземпляр Novu
    novuUI = new NovuUI({
      novu: novu, // Передаем готовый экземпляр Novu
      options: {
        applicationIdentifier: env.NOVU_APP_ID,
        subscriber: subscriber_id,
        subscriberHash: subscriber_hash,
        apiUrl: env.NOVU_BACKEND_URL,
        socketUrl: env.NOVU_SOCKET_URL,
      },
      // tabs: tabs, // Добавляем tabs для фильтрации по ролям
      appearance: {
        baseTheme: isDark.value ? dark : undefined,
      },
      localization: {
        'inbox.filters.dropdownOptions.unread': 'Только непрочитанные',
        'inbox.filters.dropdownOptions.default': 'Все сообщения',
        'inbox.filters.dropdownOptions.archived': 'Архив',
        'inbox.filters.labels.unread': 'Непрочитанные',
        'inbox.filters.labels.default': 'Входящие',
        'inbox.filters.labels.archived': 'Архив',
        'notifications.emptyNotice': 'Здесь пока тихо. Загляните позже.',
        'notifications.actions.readAll': 'Прочитать все',
        'notifications.actions.archiveAll': 'Архивировать все',
        'notifications.actions.archiveRead': 'Архивировать прочитанные',
        'notifications.newNotifications': ({
          notificationCount,
        }: {
          notificationCount: number;
        }) => `Новых уведомлений: ${notificationCount}`,
        'notification.actions.read.tooltip': 'Отметить как прочитанное',
        'notification.actions.unread.tooltip': 'Отметить как непрочитанное',
        'notification.actions.archive.tooltip': 'В архив',
        'notification.actions.unarchive.tooltip': 'Из архива',
        'preferences.title': 'Настройки',
        'preferences.emptyNotice': 'Пока нет настроек уведомлений.',
        'preferences.global': 'Общие настройки',
        'preferences.workflow.disabled.notice':
          'Обратитесь к администратору для управления подпиской на это важное уведомление.',
        'preferences.workflow.disabled.tooltip':
          'Для изменения обратитесь к администратору',
        locale: 'ru-RU',
        dynamic: {
          'comment-on-post': 'Комментарии к записи',
          'new-agenda-item': 'Новый вопрос на повестке',
        },
      },
    });

    novuUI.mountComponent({
      name: 'Inbox',
      props: {},
      element: el as HTMLDivElement,
    });

    // Подписываемся на события уведомлений через базовый экземпляр Novu
    subscribeToNotifications();
  } catch (error) {
    console.error('Ошибка при монтировании NOVU:', error);
  }
}

function subscribeToNotifications() {
  if (!novu) return;

  // Подписываемся на получение новых уведомлений
  const unsubscribeNotificationReceived = novu.on(
    'notifications.notification_received',
    (event: any) => {
      console.log('🔔 Получено новое уведомление от NOVU:', event);
      console.log('📄 Тело уведомления:', event.result);

      const notification = event.result;

      // Показываем всплывающее уведомление
      NotifyAlert(
        notification.subject || 'Новое уведомление',
        notification.body || '',
        notification.avatar,
      );
    },
  );

  // Сохраняем все функции отписки
  unsubscribeFunctions.value = [unsubscribeNotificationReceived];
}

function unsubscribeFromNotifications() {
  // Отписываемся от всех событий
  unsubscribeFunctions.value.forEach((unsubscribe) => {
    if (typeof unsubscribe === 'function') {
      unsubscribe();
    }
  });
  unsubscribeFunctions.value = [];
}

onMounted(() => {
  if (process.env.CLIENT) {
    scheduleMountNovu();
  }
});

onBeforeUnmount(() => {
  unsubscribeFromNotifications();
});

watch(isDark, () => {
  scheduleMountNovu();
});
</script>

<style scoped>
.notification-container {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 10px;
}

:deep(.notification-bell-component) {
  height: 24px;
  width: 24px;
}
</style>
