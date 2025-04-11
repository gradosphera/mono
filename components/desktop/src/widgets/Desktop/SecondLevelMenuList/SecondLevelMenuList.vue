<template lang="pug">
  div
    q-list(v-if="filteredRoutes" class="second-menu")
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
        q-icon(
          v-if="route.meta.roles && !route.meta.roles.includes('user') && route.meta.roles.length > 0"
          name="fa-solid fa-lock-open"
          :color="context.userRole === 'member' ? 'orange' : 'teal'"
        )
  </template>

  <script lang="ts" setup>
  import { useCurrentUserStore } from 'src/entities/User'
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useDesktopStore } from 'src/entities/Desktop/model'
  import { useSystemStore } from 'src/entities/System/model'
  import type { IRoute } from 'src/entities/Desktop/model/types'

  const desktop = useDesktopStore()
  const router = useRouter()
  const user = useCurrentUserStore()
  const { info } = useSystemStore()

  // Функция для проверки условия
  const evaluateCondition = (condition: string, context: Record<string, any>): boolean => {
    try {
      const func = new Function(...Object.keys(context), `return ${condition};`)
      return func(...Object.values(context))
    } catch (error) {
      console.error('Error evaluating condition:', error)
      return false
    }
  }

  // Контекст для evaluateCondition и проверки ролей
  const context = computed(() => {
    const isCoop = user.userAccount?.type === 'organization'
      && user.userAccount?.private_data
      && 'type' in user.userAccount.private_data
      && user.userAccount.private_data.type === 'coop'
    const userRole = user.userAccount?.role || 'user'
    return { isCoop, userRole, userAccount: user.userAccount, coopname: info.coopname }
  })

  // Используем активный второй уровень из store
  const filteredRoutes = computed<IRoute[]>(() => {
    return (desktop.activeSecondLevelRoutes as unknown as IRoute[]).filter(r => {
      const rolesMatch = r.meta?.roles?.includes(context.value.userRole) || (r.meta?.roles && r.meta.roles.length === 0);
      const conditionMatch = r.meta?.conditions ? evaluateCondition(r.meta.conditions, context.value) : true;
      return rolesMatch && conditionMatch;
    });
  });


  // Проверка активного маршрута
  const isActive = (routeToCheck: IRoute) => {
    return router.currentRoute.value.name === routeToCheck.name
  }

  // Навигация при клике
  const navigate = (routeToNavigate: IRoute) => {
    router.push({ name: routeToNavigate.name, params: { coopname: info.coopname } })
  }
  </script>

  <style>
  .second-menu .q-item-label {
    font-size: 12px !important;
  }
  </style>
