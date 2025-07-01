<template lang="pug">
div
  q-list.second-menu(v-if='filteredRoutes')
    q-item(
      v-for='route in filteredRoutes',
      :key='route.name',
      clickable,
      v-ripple,
      :active='isActive(route)',
      active-class='bg-gradient-dark text-white',
      @click='navigate(route)'
    )
      q-item-section
        q-item-label.no-select
          span {{ route.meta.title }}
      //- q-icon(
      //-   v-if="route.meta.roles && !route.meta.roles.includes('user') && route.meta.roles.length > 0"
      //-   name="fa-solid fa-lock-open"
      //-   :color="context.userRole === 'member' ? 'orange' : 'teal'"
      //- )
</template>

<script lang="ts" setup>
import { useCurrentUser } from 'src/entities/Session';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { useSystemStore } from 'src/entities/System/model';
import type { IRoute } from 'src/entities/Desktop/model/types';

const desktop = useDesktopStore();
const router = useRouter();
const user = useCurrentUser();
const { info } = useSystemStore();

// Функция для проверки условия
const evaluateCondition = (
  condition: string,
  context: Record<string, any>,
): boolean => {
  try {
    const func = new Function(...Object.keys(context), `return ${condition};`);
    return func(...Object.values(context));
  } catch (error) {
    console.error('Error evaluating condition:', error);
    return false;
  }
};

// Контекст для evaluateCondition и проверки ролей
const context = computed(() => {
  const isCoop =
    user.privateAccount.value?.type === 'organization' &&
    user.privateAccount.value?.organization_data &&
    'type' in user.privateAccount.value.organization_data &&
    user.privateAccount.value.organization_data.type === 'coop';
  // Роль берем из computed свойств session
  const userRole = user.isChairman
    ? 'chairman'
    : user.isMember
      ? 'member'
      : 'user';
  return {
    isCoop,
    userRole,
    userAccount: user.privateAccount.value,
    coopname: info.coopname,
  };
});

// Используем активный второй уровень из store
const filteredRoutes = computed<IRoute[]>(() => {
  return (desktop.activeSecondLevelRoutes as unknown as IRoute[]).filter(
    (r) => {
      const rolesMatch =
        r.meta?.roles?.includes(context.value.userRole) ||
        (r.meta?.roles && r.meta.roles.length === 0);
      const conditionMatch = r.meta?.conditions
        ? evaluateCondition(r.meta.conditions, context.value)
        : true;
      return rolesMatch && conditionMatch;
    },
  );
});

// Проверка активного маршрута
const isActive = (routeToCheck: IRoute) => {
  return router.currentRoute.value.name === routeToCheck.name;
};

// Навигация при клике
const navigate = (routeToNavigate: IRoute) => {
  router.push({
    name: routeToNavigate.name,
    params: { coopname: info.coopname },
  });
};
</script>

<style>
.second-menu .q-item-label {
  font-size: 12px !important;
}
</style>
