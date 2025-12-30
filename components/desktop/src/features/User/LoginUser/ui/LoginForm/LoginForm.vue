<template lang="pug">
form.full-width(@submit.prevent='submit')
  q-input.full-width.q-mt-lg(
    v-model='email',
    label='Введите электронную почту',
    color='primary',
    hint='',
    standout='bg-teal text-white',
    autocorrect='off',
    autocapitalize='off',
    autocomplete='off',
    spellcheck='false'
  )

  q-input.full-width(
    v-model='privateKey',
    label='Введите ключ доступа',
    color='primary',
    hint='',
    standout='bg-teal text-white',
    type='password',
    autocorrect='off',
    autocapitalize='off',
    autocomplete='on',
    spellcheck='false'
  )

  q-btn.full-width(
    type='submit',
    label='Войти',
    color='primary',
    :loading='loading',
    :disable='!privateKey'
  )
</template>
<script lang="ts" setup>
import { useSessionStore } from 'src/entities/Session';
import { useLoginUser } from 'src/features/User/LoginUser';
import { useNotificationPermissionDialog } from 'src/features/NotificationPermissionDialog';
import { FailAlert } from 'src/shared/api';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { LocalStorage } from 'quasar';
import { updateOpenReplayUser } from 'src/shared/config';
import { useSystemStore } from 'src/entities/System/model';

const router = useRouter();
const system = useSystemStore();

const email = ref('');
const privateKey = ref('');
const loading = ref(false);
const session = useSessionStore();

// Диалог разрешения уведомлений
const { showDialog } = useNotificationPermissionDialog();

/**
 * Функция для перехода по сохраненному URL после успешного входа
 */
function navigateToSavedUrl() {
  if (process.env.CLIENT) {
    // Проверяем наличие сохраненного URL для редиректа
    const redirectUrl = LocalStorage.getItem('redirectAfterLogin') as string;
    console.log('login form redirect url', redirectUrl);

    if (redirectUrl) {
      // Удаляем сохраненный URL
      LocalStorage.remove('redirectAfterLogin');

      try {
        // Проверяем, является ли URL hash-URL (начинается с #)
        if (redirectUrl.startsWith('#')) {
          // Для hash-URL используем router.push напрямую
          const hashPath = redirectUrl.substring(1); // Убираем #
          console.log('Navigating with router to hash path', hashPath);
          router.push(hashPath);
        } else {
          // Для полных URL пытаемся распарсить
          const url = new URL(redirectUrl);
          const path = url.pathname + url.search;
          console.log('Navigating with router to', path);
          router.push(path);
        }
      } catch (e) {
        console.error('Error parsing URL, using direct navigation', e);
        // В крайнем случае используем window.location
        window.location.href = redirectUrl;
      }

      return true;
    }
  }
  return false;
}

const submit = async () => {
  loading.value = true;

  // Включаем лоадер сразу в начале процесса входа
  const desktops = useDesktopStore();
  desktops.setWorkspaceChanging(true);

  try {
    const { login } = useLoginUser();
    await login(email.value, privateKey.value);

    // Обновляем данные пользователя в OpenReplay tracker
    updateOpenReplayUser({
      username: session.username,
      coopname: system.info.coopname,
      cooperativeDisplayName: system.cooperativeDisplayName,
    });

    if (!session.isRegistrationComplete) {
      // Если регистрация не завершена, выключаем лоадер и идем на signup
      desktops.setWorkspaceChanging(false);
      router.push({ name: 'signup' });
    } else {
      // Дожидаемся завершения загрузки данных пользователя (включая роль)
      let attempts = 0;
      const maxAttempts = 50; // 5 секунд максимум

      while (!session.loadComplete && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      // Пробуем перейти по сохраненному URL
      if (!navigateToSavedUrl()) {
        // Если сохраненного URL нет, переходим на страницу по умолчанию
        // Теперь selectDefaultWorkspace будет работать с актуальными данными о роли
        // Передаем ignoreSaved=true чтобы пересчитать рабочий стол на основе новой роли
        desktops.selectDefaultWorkspace(true);
        desktops.goToDefaultPage(router);
      }

      // Проверяем, если данные уже загружены, выключаем лоадер
      if (session.loadComplete) {
        desktops.setWorkspaceChanging(false);
      }
      // Иначе лоадер выключится в init-wallet после завершения инициализации
    }

    loading.value = false;

    // Показываем диалог разрешения уведомлений после успешного входа
    setTimeout(() => {
      showDialog();
    }, 1000);
  } catch (e: any) {
    console.error(e);
    loading.value = false;
    // Выключаем лоадер при ошибке
    desktops.setWorkspaceChanging(false);
    FailAlert(e);
  }
};
</script>
