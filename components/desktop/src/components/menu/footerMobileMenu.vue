<template lang="pug">
div.row.justify-around.full-height
  div(v-for="route in menuRoutes" :key="route.path")
    q-btn(
      v-ripple
      flat
      class="cursor-pointer btn-menu"
      :class="headerClass(route)"
      @click="open(route)"
    )
      q-icon(:name="route.meta.icon").btn-icon.q-pt-xs
      span.btn-font {{ route.meta.title }}

  q-btn(
    v-ripple
    flat
    class="cursor-pointer btn-menu"
    @click="emit('toogleMore')"
  )
    q-icon(name="menu").btn-icon.q-pt-xs
    span.btn-font ещё

  </template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useMenuStore } from 'src/entities/Menu'
import type { IMenu } from 'src/entities/Menu'
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import { useCurrentUserStore } from 'src/entities/User'
const emit = defineEmits(['toogleMore'])
const $q = useQuasar()
const isDark = computed(() => $q.dark.isActive)
const router = useRouter()
const currentUser = useCurrentUserStore()
const menuStore = useMenuStore()

const menuRoutes = computed(() => {
  return menuStore.getUserDesktopMenu(currentUser?.userAccount?.role)
})

const headerClass = (route: IMenu) => {
  const isActive = route.name === router.currentRoute.value.name
  return isActive ? (isDark.value ? 'text-white bg-teal-8' : 'text-black bg-teal-2') : ''
}

const open = (route: IMenu) => {
  router.push({ name: route.name, params: { coopname: info.coopname } })
}
</script>

<style lang="scss" scoped>
.btn-menu {
  height: 60px;
  width: 60px;
}

.btn-icon {
  font-size: 20px !important;
}

.btn-font {
  font-size: 7px !important;
}

.row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.full-height {
  height: 100%;
}
</style>
