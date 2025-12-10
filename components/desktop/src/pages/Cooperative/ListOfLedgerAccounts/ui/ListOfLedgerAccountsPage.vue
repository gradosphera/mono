<template lang="pug">
div
  // Контент страницы кошельков
  router-view
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, computed, markRaw } from 'vue';
import { useHeaderActions } from 'src/shared/hooks';
import { RouteMenuButton } from 'src/shared/ui';

// Массив кнопок меню для шапки
const menuButtons = computed(() => [
  {
    id: 'ledger-accounts-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'ledger-accounts',
      label: 'Кошельки кооператива',
    },
    order: 1,
  },
  {
    id: 'ledger-history-menu',
    component: markRaw(RouteMenuButton),
    props: {
      routeName: 'ledger-history',
      label: 'История операций',
    },
    order: 2,
  },
]);

// Регистрируем кнопки меню в header
const { registerAction: registerHeaderAction, clearActions } = useHeaderActions();

// Регистрируем действия в header
onMounted(() => {
  // Регистрируем кнопки меню
  menuButtons.value.forEach(button => {
    registerHeaderAction(button);
  });
});

// Явно очищаем кнопки при уходе со страницы
onBeforeUnmount(() => {
  clearActions();
});
</script>
