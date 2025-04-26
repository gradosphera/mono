<template lang="pug">
div
  q-carousel(
    v-model="slideIndex"
    animated
    infinite
    :arrows="menuWorkspaces.length > 1"
    swipeable
    control-type="flat"
    control-color="grey"
    height="100px"
    class="workspace-menu"
  )
    q-carousel-slide(
      v-for="(item, index) in menuWorkspaces"
      :name="index"
      :key="item.workspaceName"
      class="flex flex-center"
    )
      q-btn(
        stack
        flat
        v-ripple
        class="cursor-pointer btn-menu"
        @click="handleClick(item, index)"
        align="center"
      ).full-width
        q-icon(:name="item.icon").btn-icon.q-pt-sm
        span.btn-font {{ item.title }}

  q-dialog(v-model="showDialog")
    q-card(style="min-width: 300px; max-width: 90vw")
      q-bar.bg-primary.text-white
        span Выберите рабочий стол
        q-space
        q-btn(flat dense icon="close" v-close-popup)
          q-tooltip Закрыть

      div.row
        div(
          v-for="(item, index) in menuWorkspaces"
          :key="item.workspaceName"
          :class="{ 'col-6': !(index === menuWorkspaces.length - 1 && menuWorkspaces.length % 2 !== 0), 'col-12': index === menuWorkspaces.length - 1 && menuWorkspaces.length % 2 !== 0 }"
        )
          q-btn(
            stack
            flat
            class="full-width q-pa-sm btn-menu"
            :class="headerClass(item)"
            @click="selectFromDialog(index)"
          )
            q-icon(:name="item.icon").btn-icon
            div.btn-font.text-center {{ item.title }}
</template>

  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useSystemStore } from 'src/entities/System/model'
  import { useCurrentUserStore } from 'src/entities/User'
  import { useDesktopStore } from 'src/entities/Desktop/model'
  import { useSessionStore } from 'src/entities/Session'

  const router = useRouter()
  const system = useSystemStore()
  const user = useCurrentUserStore()
  const session = useSessionStore()
  const desktop = useDesktopStore()
  const { info } = system

  const slideIndex = ref(0)
  const showDialog = ref(false)

  // workspaceMenus – список рабочих столов из store
  const workspaceMenus = computed(() => desktop.workspaceMenus)

  // Фильтрация по ролям (если требуется)
  const menuWorkspaces = computed(() => {
    const userRole = user.userAccount?.role || 'user'
    return workspaceMenus.value.filter(item =>
      item.meta.roles?.includes(userRole) || !item.meta.roles || item.meta.roles.length === 0
    )
  })

  const headerClass = (item: any) => {
    return desktop?.activeWorkspaceName === item.workspaceName ? 'text-white bg-teal' : ''
  }


  // Функция навигации: переходим в рамках маршрутов рабочего стола
  const open = (route: any) => {
    if (route && route.children && route.children.length)
      router.push({ name: route.children[0].name, params: { coopname: info.coopname } })
    else if (route)
      router.push({ name: route.name, params: { coopname: info.coopname } })
  }

  const handleClick = (item: any, index: number) => {
    if (slideIndex.value === index) {
      showDialog.value = true
    } else {
      slideIndex.value = index
      // Обновляем активный рабочий стол
      desktop.selectWorkspace(item.workspaceName)
      if (item.mainRoute) open(item.mainRoute)
    }
  }

  const selectFromDialog = (index: number) => {
    showDialog.value = false
    slideIndex.value = index
    const item = menuWorkspaces.value[index]
    desktop.selectWorkspace(item.workspaceName)
    if (item.mainRoute) open(item.mainRoute)
  }

  onMounted(() => {
    if (menuWorkspaces.value.length > 0 && session.isAuth && user.isRegistrationComplete) {
      slideIndex.value = 0
      const firstItem = menuWorkspaces.value[0]
      desktop.selectWorkspace(firstItem.workspaceName)
      if (firstItem.mainRoute) open(firstItem.mainRoute)
    }
  })

  // При изменении slideIndex обновляем активный рабочий стол
  watch(slideIndex, (newIndex) => {
    const item = menuWorkspaces.value[newIndex]
    if (item) {
      desktop.selectWorkspace(item.workspaceName)
      if (item.mainRoute) open(item.mainRoute)
    }
  })
  </script>

  <style lang="scss">
  .btn-menu {
    height: 100px;
    width: 100px;
    border-radius: 0 !important;
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
