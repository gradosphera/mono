<!-- MainHeader.vue -->
<template lang="pug">
q-header.header(bordered, :class='headerClass')
  q-toolbar
    q-btn(
      v-if='loggedIn',
      stretch,
      icon='menu',
      flat,
      @click='emitToggleLeftDrawer'
    )
    BackButton(v-if='loggedIn')
    q-toolbar-title

    // Добавляем компонент уведомлений, если пользователь авторизован
    NotificationCenter(v-if='loggedIn && isClient')

    SettingsDropdown(
      :isMobile='isMobile',
      :isChairman='isChairman',
      :isMember='isMember'
    )

    template(v-if='!loggedIn')
      q-btn(
        v-if='showRegisterButton && !is("signup") && !is("install")',
        color='primary',
        stretch,
        :size='isMobile ? "sm" : "lg"',
        @click='signup'
      )
        span.q-pr-sm регистрация
        i.fa-solid.fa-right-to-bracket

      q-btn(
        v-if='showRegisterButton && is("signup")',
        color='primary',
        stretch,
        :size='isMobile ? "sm" : "lg"',
        @click='login'
      )
        span.q-pr-sm вход
        i.fa-solid.fa-right-to-bracket
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useCurrentUser } from 'src/entities/Session';
import { useSessionStore } from 'src/entities/Session';
import config from 'src/app/config';
import { useWindowSize } from 'src/shared/hooks';
import { SettingsDropdown } from 'src/widgets/Header/SettingsDropdown';
import { BackButton } from 'src/widgets/Header/BackButton';
import { NotificationCenter } from 'src/widgets/NotificationCenter';
import './HeaderStyles.scss';
import { useSystemStore } from 'src/entities/System/model';
// import { env } from 'src/shared/config'

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { info } = useSystemStore();
const session = useSessionStore();
const { isMobile } = useWindowSize();
const emit = defineEmits(['toggle-left-drawer']);

const isClient = computed(
  () => typeof process !== 'undefined' && process.env.CLIENT,
);

// Получаем информацию для навигации назад
// const coopTitle = computed(() => env.COOP_SHORT_NAME)

const isDark = computed(() => $q.dark.isActive);
const headerClass = computed(() =>
  isDark.value ? 'text-white bg-dark' : 'text-black bg-light',
);
const currentUser = useCurrentUser();
const loggedIn = computed(() => {
  console.log(
    'on loggedIn',
    currentUser.isRegistrationComplete.value,
    session.isAuth,
    currentUser,
  );
  return currentUser.isRegistrationComplete.value && session.isAuth;
});

const isChairman = computed(() => currentUser.isChairman);
const isMember = computed(() => currentUser.isMember);

const showRegisterButton = computed(() => {
  if (!loggedIn.value) {
    return config.registrator.showRegisterButton;
  }
  return false;
});

const is = (what: string) => route.name === what;

const signup = () => {
  router.push({ name: 'signup', params: { coopname: info.coopname } });
};

const login = () => {
  router.push({ name: 'signin', params: { coopname: info.coopname } });
};

const emitToggleLeftDrawer = () => {
  emit('toggle-left-drawer');
};
</script>
