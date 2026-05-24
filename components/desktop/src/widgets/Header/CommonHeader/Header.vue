<template lang="pug">
q-header.app-q-header(:bordered='false')
  AppHeader(
    :show-menu-button='loggedIn',
    @toggle-menu="emit('toggle-left-drawer')"
  )
    template(v-if='!loggedIn && coopTitle', #brand)
      span.app-q-header__logo
        span.app-q-header__logo-svg(v-html='logoSvg', aria-hidden='true')
      b {{ coopTitle }}

    template(v-if='loggedIn', #crumb)
      BackButton

    template(v-if='loggedIn && headerActions.length', #actions)
      component(
        v-for='action in headerActions',
        :key='action.id',
        :is='action.component',
        v-bind='action.props'
      )

    template(v-if='loggedIn && isClient', #notifications)
      NotificationCenter

    template(#theme)
      ToogleDarkLight(:is-mobile='isMobile', :show-text='false', :as-button='true')

    template(v-if='!loggedIn', #profile)
      BaseButton(
        v-if="showRegisterButton && !is('signup') && !is('install')",
        variant='primary',
        @click='signup'
      ) Регистрация
      BaseButton(
        v-if="showRegisterButton && is('signup')",
        variant='primary',
        @click='login'
      ) Вход
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Zeus } from '@coopenomics/sdk';
import config from 'src/app/config';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { useWindowSize, useHeaderActionsReader } from 'src/shared/hooks';
import { AppHeader } from 'src/shared/ui/layout/AppHeader';
import { ToogleDarkLight } from 'src/shared/ui/ToogleDarkLight';
import { BackButton } from 'src/widgets/Header/BackButton';
import { NotificationCenter } from 'src/widgets/NotificationCenter';
import logoSvg from 'src/assets/logo.svg?raw';

defineProps({
  showDrawer: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits<{
  'toggle-left-drawer': [];
}>();

const route = useRoute();
const router = useRouter();
const session = useSessionStore();
const systemStore = useSystemStore();
const { isMobile } = useWindowSize();
const { headerActions } = useHeaderActionsReader();

const isClient = computed(() => Boolean(process.env.CLIENT));

const loggedIn = computed(
  () => session.isRegistrationComplete && session.isAuth,
);

const coopTitle = computed<string>(() => {
  const status = systemStore.info.system_status;
  if (
    status === Zeus.SystemStatus.install ||
    status === Zeus.SystemStatus.initialized
  ) {
    return 'УСТАНОВКА';
  }
  return `${systemStore.info.vars?.short_abbr ?? ''} ${systemStore.info.vars?.name ?? ''}`.trim();
});

const showRegisterButton = computed(() => {
  if (loggedIn.value) return false;
  return config.registrator.showRegisterButton;
});

const is = (what: string): boolean => route.name === what;

function signup(): void {
  void router.push({
    name: 'signup',
    params: { coopname: systemStore.info.coopname },
  });
}

function login(): void {
  void router.push({
    name: 'signin',
    params: { coopname: systemStore.info.coopname },
  });
}
</script>

<style scoped>
.app-q-header {
  background: var(--p-canvas);
  color: var(--p-ink);
  box-shadow: none;
}
/* Бренд-логотип на странице без логина — тот же приём, что в личном
   кабинете (WorkspaceSwitcher): inline-SVG через v-html в зелёном квадрате,
   logo.svg на fill:currentColor наследует color. Зелёный одинаков в обеих
   темах, поэтому переключение темы не требуется. */
.app-q-header__logo {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--p-primary-soft);
  color: var(--p-primary);
  border-radius: var(--p-r-sm, 8px);
}
.app-q-header__logo-svg {
  display: inline-flex;
  width: 16px;
  height: 16px;
  line-height: 0;
}
.app-q-header__logo-svg :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
