<template lang="pug">
div.menu-container
  div.menu-items
    q-btn(
      v-for="route in menuRoutes" :key="route.path"
      v-ripple
      flat
      class="cursor-pointer btn-menu"
      :class="headerClass(route)"
      @click="open(route)"
    )
      q-icon(:name="route.meta.icon").btn-icon.q-pt-xs
      span.btn-font {{ route.meta.title }}

  div.control-buttons

    q-btn(flat @click="$q.dark.toggle()" ).btn-menu
      q-icon(:name="isDark ? 'brightness_7' : 'brightness_3'").q-pt-xs.btn-icon
      span.btn-font {{ isDark ? 'светлая' : 'тёмная' }}

    q-btn(flat class="cursor-pointer btn-menu" @click="logout")
      q-icon( color="red" name="logout").q-pt-xs.btn-icon
      div.btn-font Выход

</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { COOPNAME } from 'src/shared/config'
import { useLogoutUser } from 'src/features/Registrator/Logout'
import { FailAlert } from 'src/shared/api'
import { useCurrentUserStore } from 'src/entities/User'
import { type IRoute } from 'src/entities/Desktop/model/types'
import { useDesktopStore } from 'src/entities/Desktop/model'

const $q = useQuasar()

const isDark = computed(() => $q.dark.isActive)

const router = useRouter()
const route = useRoute()
const user = useCurrentUserStore()

const isRouteActive = (currentRoute: IRoute) => {
  return route.matched.find(r => r.path === currentRoute.path) || route.name == currentRoute.name
}

const headerClass = (route: IRoute) => {
  const isActive = isRouteActive(route)
  return isActive ? (isDark.value ? 'text-white bg-teal' : 'text-white bg-teal') : ''
}

const desktop = useDesktopStore()

const open = (route: IRoute) => {
  if (route.children)
    router.push({ name: route.children[0].name, params: { coopname: COOPNAME } })
  else router.push({ name: route.name, params: { coopname: COOPNAME } })

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
  const userRole = user.userAccount?.role || 'user';

  return desktop.firstLevel.filter(
    (route) => route.meta.roles.includes(userRole) || route.meta.roles.length === 0
  );

})

</script>

<style lang="scss" scoped>
.btn-menu {
  height: 54px;
  width: 65px;
}

.btn-icon {
  font-size: 20px !important;
}

.btn-font {
  font-size: 7px !important;
}

.logout-btn {
  position: fixed;
  bottom: 54px;
  width: 100%;
}

.menu-container {
  display: flex;
  // flex-direction: column;
  height: 100%;
}

.menu-items {
  flex: 1;
}

.control-buttons {
  margin-top: auto;
}
</style>
