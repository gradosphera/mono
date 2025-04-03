<template lang="pug">
div
  q-carousel(
    v-model="slideIndex"
    animated
    infinite
    arrows
    swipeable
    control-type="flat"
    control-color="grey"
    height="100px"
    class="workspace-menu"
  )
    q-carousel-slide(
      v-for="(route, index) in menuRoutes"
      :name="index"
      :key="route.path"
      class="flex flex-center"
    )
      q-btn(
        stack
        flat
        v-ripple
        class="cursor-pointer btn-menu"
        @click="handleClick(route, index)"
        align="center"
      ).full-width
        q-icon(:name="route.meta.icon").btn-icon.q-pt-sm
        span.btn-font {{ route.meta.title }}

  q-dialog(v-model="showDialog")
    q-card(style="min-width: 300px; max-width: 90vw")
      q-bar.bg-primary.text-white
        span Выберите приложение
        q-space
        q-btn(flat dense icon="close" v-close-popup)
          q-tooltip Закрыть

      div.row
        div(
          v-for="(route, index) in menuRoutes"
          :key="route.path"
        ).col-6
          q-btn(
            stack
            flat
            class="full-width q-pa-sm btn-menu"
            :class="headerClass(route)"
            @click="selectFromDialog(index)"
          )
            q-icon(:name="route.meta.icon").btn-icon
            div.btn-font.text-center {{ route.meta.title }}
</template>

  <script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useQuasar } from 'quasar'

  import { useSystemStore } from 'src/entities/System/model'
  import { useCurrentUserStore } from 'src/entities/User'
  import { type IRoute } from 'src/entities/Desktop/model/types'
  import { useDesktopStore } from 'src/entities/Desktop/model'
  import { useSessionStore } from 'src/entities/Session'

  const $q = useQuasar()
  const router = useRouter()
  const route = useRoute()

  const isDark = computed(() => $q.dark.isActive)
  const user = useCurrentUserStore()
  const session = useSessionStore()
  const desktop = useDesktopStore()
  const { info } = useSystemStore()

  const slideIndex = ref(0)
  const menuRoutes = ref<IRoute[]>([])
  const showDialog = ref(false)


  const isRouteActive = (currentRoute: IRoute) => {
    return route.matched.find(r => r.path === currentRoute.path) || route.name === currentRoute.name
  }

  const headerClass = (route: IRoute) => {
    const isActive = isRouteActive(route)
    return isActive ? (isDark.value ? 'text-white bg-teal' : 'text-white bg-teal') : ''
  }

  const open = (route: IRoute) => {
    if (route.children?.length)
      router.push({ name: route.children[0].name, params: { coopname: info.coopname } })
    else
      router.push({ name: route.name, params: { coopname: info.coopname } })
  }

  const handleClick = (route: IRoute, index: number) => {
    if (slideIndex.value === index) {
      showDialog.value = true
    } else {
      slideIndex.value = index
    }
  }

  const selectFromDialog = (index: number) => {
    showDialog.value = false
    slideIndex.value = index
    open(menuRoutes.value[index])
  }

  onMounted(() => {
    const userRole = user.userAccount?.role || 'user'
    menuRoutes.value = desktop.firstLevel.filter(route =>
      route.meta.roles.includes(userRole) || route.meta.roles.length === 0
    )

    // открываем первый элемент в списке children-кнопок, если пользователь авторизован и завершил регистрацию
    if (menuRoutes.value.length > 0 && session.isAuth && user.isRegistrationComplete) {
      slideIndex.value = 0
      open(menuRoutes.value[0])
    }
  })

  watch(slideIndex, (newIndex) => {
    const route = menuRoutes.value[newIndex]
    if (route) open(route)
  })
  </script>

  <style lang="scss">
  .btn-menu {
    height: 100px;
    width: 100px;
  }

  .btn-icon {
    font-size: 20px !important;
  }

  .btn-font {
    font-size: 8px !important;
  }

  .workspace-menu .q-carousel__slide {
    padding: 0px !important;
  }
  </style>
