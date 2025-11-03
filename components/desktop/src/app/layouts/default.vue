<template lang="pug">
q-layout(view='lHh LpR fff')
  Header(:showDrawer='showDrawer', @toggle-left-drawer='toggleLeftDrawer')

  q-drawer(
    v-if='showDrawer && loggedIn',
    v-model='leftDrawerOpen',
    side='left',
    bordered,
    persistent,
    :width='200'
  )
    LeftDrawerMenu

  // Кнопка открытия drawer (снаружи)
  q-btn.fixed-top-right(
    v-if='rightDrawerActions.length > 0 && !rightDrawerOpen',
    :style='buttonStyle',
    dense,

    flat
    icon='fas fa-chevron-left',
    @click='toggleRightDrawer'
  )

  q-drawer.drawer-right(
    v-if='rightDrawerActions.length > 0',
    v-model='rightDrawerOpen',
    side='right',
    bordered,
    :width='250'
  )
    // Кнопка закрытия drawer (внутри)
    .div
      q-btn(
        dense,
        :style='buttonStyle',
        flat,
        icon='fas fa-chevron-right',
        @click='toggleRightDrawer'
      )

    // Инжектированные компоненты действий
    template(v-for='action in rightDrawerActions', :key='action.id')
      component(:is='action.component', v-bind='action.props')

  q-footer(v-if='!loggedIn && system.info.system_status !== "install"', :class='headerClass', bordered)
    ContactsFooter(:text='footerText')

  q-page-container
    q-page
      WindowLoader(v-if='desktop?.isWorkspaceChanging')
      router-view(v-else)

</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Header } from 'src/widgets/Header/CommonHeader';
import { LeftDrawerMenu } from 'src/widgets/Desktop/LeftDrawerMenu';
import { ContactsFooter } from 'src/shared/ui/Footer';

import { useDesktopStore } from 'src/entities/Desktop/model';
import { useSystemStore } from 'src/entities/System/model';
import { useDefaultLayoutLogic } from './useDefaultLayoutLogic';
import { usePWAThemeColor } from 'src/shared/lib/composables/usePWAThemeColor';
import { useRightDrawerReader } from 'src/shared/hooks/useRightDrawer';
import { WindowLoader } from 'src/shared/ui/Loader';
const desktop = useDesktopStore();
const system = useSystemStore();
const { rightDrawerActions } = useRightDrawerReader();

// Настраиваем автоматическое обновление PWA theme-color
usePWAThemeColor();

const {
  leftDrawerOpen,
  rightDrawerOpen,
  showDrawer,
  headerClass,
  footerText,
  loggedIn,
  isMobile,
  toggleLeftDrawer,
  toggleRightDrawer,
} = useDefaultLayoutLogic();

const buttonStyle = computed(() => ({
  width: isMobile.value ? '45px' : '56px',
  height: isMobile.value ? '30px' : '50px'
}));
</script>

<style lang="scss">
.drawer-right {
  border-left: 1px solid #00800038 !important;
}

.drawer-left {
  border-right: 1px solid #00800038 !important;
}

.fixed-top-right {
  position: fixed !important;
  top: 51px; // Под header'ом
  right: 0px;
  z-index: 10;
}

.drawer-close-btn {
  position: absolute !important;
  top: 16px;
  right: 16px;
  z-index: 10;
}
</style>
