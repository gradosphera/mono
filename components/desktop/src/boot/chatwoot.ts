import { boot } from 'quasar/wrappers';
import { createChatWoot, useChatWoot } from '@productdevbook/chatwoot/vue';
import { useActionsStore } from 'src/shared/lib/stores/actions.store';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { ref } from 'vue';

export default boot(async ({ app }) => {
  // ChatWoot работает только на клиенте
  if (process.env.SERVER) {
    return;
  }

  try {
    // Глобальная инициализация ChatWoot
    const chatwoot = createChatWoot({
      init: {
        websiteToken: '5Fk9KiCGW3HaSD6qj8Rijgho',
        baseUrl: 'https://support.coopenomics.world'
      },
      settings: {
        locale: 'ru',
        position: 'right',
        launcherTitle: '',
        hideMessageBubble: true
      },
      partytown: false,
    });

    app.use(chatwoot);

    // Регистрируем действие для открытия чата
    const actionsStore = useActionsStore();

    // Ждем готовности SDK перед регистрацией действия
    const waitForChatWootReady = () => {
      return new Promise((resolve) => {
        if (window.chatwootSDK) {
          resolve(true);
          return;
        }

        const checkReady = () => {
          if (window.chatwootSDK) {
            resolve(true);
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });
    };

    await waitForChatWootReady();

    const { toggle, setUser, setCustomAttributes } = useChatWoot();

    // Получаем доступ к stores
    const sessionStore = useSessionStore();
    const systemStore = useSystemStore();

    // Устанавливаем кастомные атрибуты
    const customAttributes: Record<string, string> = {};

    if (sessionStore.username) {
      customAttributes.username = sessionStore.username;
    }

    if (systemStore.info?.coopname) {
      customAttributes.coopname = systemStore.info.coopname;
    }

    if (sessionStore.privateAccount?.type) {
      customAttributes.account_type = sessionStore.privateAccount.type;
    }

    if (sessionStore.displayName) {
      customAttributes.full_name = sessionStore.displayName;
    }

    // Добавляем текущий сайт
    if (typeof window !== 'undefined' && window.location) {
      customAttributes.current_url = window.location.href;
      customAttributes.origin = window.location.origin;
    }

    // Устанавливаем информацию о пользователе
    if (sessionStore.username) {
      setUser(sessionStore.username, {
        email: sessionStore.providerAccount?.email || '',
        name: sessionStore.displayName || sessionStore.username,
        avatar_url: '',
        identifier_hash: '',
        company_name: systemStore.cooperativeDisplayName || '',
        description: JSON.stringify(customAttributes)
      });
    }

    // Устанавливаем кастомные атрибуты контакта
    if (Object.keys(customAttributes).length > 0) {
      setCustomAttributes(customAttributes);
    }

    // Состояние чата для реализации toggle функциональности
    const isChatOpen = ref(false);

    actionsStore.registerAction('toggleSupportChat', () => {
      isChatOpen.value = !isChatOpen.value;
      toggle(isChatOpen.value ? 'open' : 'close');
    });

    console.log('ChatWoot initialized globally and action registered');
  } catch (error) {
    console.error('Failed to initialize ChatWoot globally:', error);
  }
});
