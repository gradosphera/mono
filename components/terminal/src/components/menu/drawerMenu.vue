<template lang="pug">
div.menu-container
  div.menu-items
    div(v-for="route in menuRoutes" :key="route.path")
      q-btn(
        v-ripple
        flat
        class="cursor-pointer btn-menu"
        :class="headerClass(route)"
        @click="open(route)"
      )
        q-icon(:name="route.meta.icon").btn-icon.q-pt-xs
        span.btn-font {{ t(route.meta.title) }}

  div.control-buttons
    div
      q-btn(flat @click="$q.dark.toggle()").btn-menu
        q-icon(:name="isDark ? 'brightness_7' : 'brightness_3'").btn-icon
        span.btn-font {{ isDark ? 'светлая' : 'тёмная' }}
    div
      q-btn(v-ripple flat class="cursor-pointer btn-menu" @click="logout")
        q-icon( color="red" name="logout").btn-icon.q-pt-xs
        div.btn-font Выход
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import { useMenuStore } from 'src/entities/Menu'
import type { IMenu } from 'src/entities/Menu'
import { COOPNAME } from 'src/shared/config'
import { useLogoutUser } from 'src/features/User/Logout/model'
import { FailAlert } from 'src/shared/api'
import { useCurrentUserStore } from 'src/entities/User'

const $q = useQuasar()

const isDark = computed(() => $q.dark.isActive)

const router = useRouter()
const route = useRoute()

const isRouteActive = (currentRoute: IMenu) => {
  return route.name === currentRoute.name
}

const headerClass = (route: IMenu) => {
  const isActive = isRouteActive(route)
  return isActive ? (isDark.value ? 'text-white bg-teal-8' : 'text-black bg-teal-2') : ''
}

const currentUser = useCurrentUserStore()
const menuStore = useMenuStore()

const { t } = useI18n()

const menu = ref<IMenu[]>([])

menu.value = menuStore.getUserDesktopMenu(currentUser?.userAccount?.role)

const open = (route: IMenu) => {
  router.push({ name: route.name, params: { coopname: COOPNAME } })
}


const logout = async () => {
  const { logout } = useLogoutUser()

  try {
    await logout()
    router.push({ name: 'index' })

  } catch (e: any) {
    console.log(e)
    FailAlert('Ошибка при выходе: ' + e.message)
  }
}

const menuRoutes = computed(() => {
  return menu.value
})
</script>

<style lang="scss" scoped>
.btn-menu {
  height: 70px;
  width: 70px;
}

.btn-icon {
  font-size: 20px !important;
}

.btn-font {
  font-size: 7px !important;
}

.logout-btn {
  position: fixed;
  bottom: 70px;
  width: 100%;
}

.menu-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-items {
  flex: 1;
}

.control-buttons {
  margin-top: auto;
}
</style>
