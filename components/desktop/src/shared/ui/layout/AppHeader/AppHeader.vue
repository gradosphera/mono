<template>
  <header class="topbar" role="banner">
    <!-- Бургер слева (canon HTML: [≡] crumb · · · действия │ глобальные) -->
    <button
      v-if="showMenuButton"
      class="icon-btn"
      type="button"
      aria-label="Меню"
      @click="emit('toggle-menu')"
    >
      <q-icon name="menu" />
    </button>

    <!-- Крошка: либо одиночный `<b>title</b>`, либо breadcrumb с chevron'ами -->
    <div class="topbar__crumb">
      <slot name="crumb">
        <template v-if="breadcrumbs && breadcrumbs.length">
          <template v-for="(crumb, idx) in breadcrumbs" :key="idx">
            <component
              :is="crumb.route ? 'router-link' : 'span'"
              :to="crumb.route"
            >
              <template v-if="idx === breadcrumbs.length - 1">
                <b>{{ crumb.label }}</b>
              </template>
              <template v-else>{{ crumb.label }}</template>
            </component>
            <q-icon v-if="idx < breadcrumbs.length - 1" name="chevron_right" />
          </template>
        </template>
        <template v-else-if="title"><b>{{ title }}</b></template>
      </slot>
    </div>

    <!-- Page-scoped действия: CTA + overflow. Через слот, чтобы страница сама вкладывала свой набор. -->
    <div v-if="hasActions" class="topbar__actions">
      <slot name="actions" />
    </div>

    <!-- Глобальные действия справа: уведомления, тема, профиль.
         Mini-wallet СПЕЦИАЛЬНО НЕ ПРИСУТСТВУЕТ — баланс пайщика отображается
         в RailUserCard (нижняя часть AppDrawer), дублировать его в шапке
         нет смысла. В правой части шапки только глобальные действия. -->
    <div v-if="hasRight" class="topbar__right">
      <slot name="right">
        <slot name="notifications" />
        <slot name="theme" />
        <slot name="profile" />
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { AppHeaderProps } from './AppHeader.types';

withDefaults(defineProps<AppHeaderProps>(), {
  showMenuButton: true,
});

const emit = defineEmits<{
  'toggle-menu': [];
}>();

const slots = useSlots();
const hasActions = computed(() => !!slots.actions);
const hasRight = computed(
  () => !!(slots.right || slots.notifications || slots.theme || slots.profile),
);
</script>
