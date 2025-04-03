<template lang="pug">
div
  q-list(
    v-if="filteredRoutes"
    class="second-menu"
  )

    q-item(
      v-for="route in filteredRoutes"
      :key="route.name"
      clickable
      v-ripple
      :active="isActive(route)"
      active-class="bg-gradient-dark text-white"
      @click="navigate(route)"
    )

      q-item-section
        q-item-label.no-select
          span {{ route.meta.title }}

      // показываем иконку замка с цветом если требуется роль не user
      q-icon(v-if="route.meta.roles && !route.meta.roles.includes('user') && route.meta.roles.length > 0" name="fa-solid fa-lock-open" :color="context.userRole == 'member' ? 'orange' : 'teal' ")

  </template>

  <script lang="ts" setup>
  import { useCurrentUserStore } from 'src/entities/User';
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useDesktopStore } from 'src/entities/Desktop/model';
  import { type IRoute } from 'src/entities/Desktop/model/types';
  import { useSystemStore } from 'src/entities/System/model';

  const desktop = useDesktopStore();
  const route = useRoute();
  const router = useRouter();
  const user = useCurrentUserStore();
  const { info } = useSystemStore();

  const evaluateCondition = (condition: string, context: Record<string, any>): boolean => {
    try {
      const func = new Function(...Object.keys(context), `return ${condition};`);
      return func(...Object.values(context));
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  };

  const context = computed(() => {
    const isCoop = user.userAccount?.type === 'organization' &&
      user.userAccount?.private_data &&
      'type' in user.userAccount.private_data &&
      user.userAccount.private_data.type === 'coop';

    const userRole = user.userAccount?.role || 'user';

    return {
      isCoop,
      userRole,
      userAccount: user.userAccount,
      coopname: info.coopname,
    };
  });

  const filteredRoutes = computed(() => {
    const secondLevelRoutes = desktop.getSecondLevel(route) as unknown as IRoute[];

    return secondLevelRoutes.filter((route) => {
      const rolesMatch = route.meta?.roles?.includes(context.value.userRole) || route.meta?.roles?.length === 0;
      const conditionMatch = route.meta?.conditions
        ? evaluateCondition(route.meta.conditions, context.value)
        : true; // Если условия нет, пропускаем проверку
      return rolesMatch && conditionMatch;
    });
  });

  // Функция проверки активного маршрута
  const isActive = (routeToCheck: IRoute) => {
    return route.name === routeToCheck.name;
  };

  // Функция навигации при клике на элемент
  const navigate = (routeToNavigate: IRoute) => {
    router.push({ name: routeToNavigate.name, params: { coopname: info.coopname } });
  };
  </script>

  <style>
  .second-menu .q-item-label {
    font-size: 12px !important;
  }

  .custom-ripple {
    position: relative;
    overflow: hidden;
  }

  .custom-ripple::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.1);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease-out;
    z-index: 0;
  }

  .custom-ripple:active::before {
    transform: scaleX(1);
  }
  </style>
