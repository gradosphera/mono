<template>
  <q-header class="app-q-header" :bordered="false">
    <AppHeader
      :show-menu-button="loggedIn"
      :title="!loggedIn && coopTitle ? coopTitle : undefined"
      @toggle-menu="emit('toggle-left-drawer')"
    >
      <template v-if="loggedIn" #crumb>
        <BackButton />
      </template>

      <template v-if="loggedIn && headerActions.length" #actions>
        <component
          :is="action.component"
          v-for="action in headerActions"
          :key="action.id"
          v-bind="action.props"
        />
      </template>

      <template v-if="loggedIn && isClient" #notifications>
        <NotificationCenter />
      </template>

      <template #theme>
        <ToogleDarkLight :is-mobile="isMobile" :show-text="false" :as-button="true" />
      </template>

      <template v-if="!loggedIn" #profile>
        <BaseButton
          v-if="showRegisterButton && !is('signup') && !is('install')"
          variant="primary"
          @click="signup"
        >
          Регистрация
        </BaseButton>
        <BaseButton
          v-if="showRegisterButton && is('signup')"
          variant="primary"
          @click="login"
        >
          Вход
        </BaseButton>
      </template>
    </AppHeader>
  </q-header>
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
</style>
