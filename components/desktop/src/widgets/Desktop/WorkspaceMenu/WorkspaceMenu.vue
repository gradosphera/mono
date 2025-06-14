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
import { useCurrentUserStore } from 'src/entities/User'
import { useDesktopStore } from 'src/entities/Desktop/model'
import { useSystemStore } from 'src/entities/System/model'

const router = useRouter()
const user = useCurrentUserStore()
const desktop = useDesktopStore()
const { info } = useSystemStore()

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

// Функция для навигации на первый маршрут рабочего стола
function navigateToWorkspace(workspaceName: string) {
  const ws = workspaceMenus.value.find(menu => menu.workspaceName === workspaceName)

  if (ws && ws.mainRoute && ws.mainRoute.children && ws.mainRoute.children.length > 0) {
    const firstChild = ws.mainRoute.children[0]
    router.push({
      name: firstChild.name as string,
      params: { coopname: info.coopname }
    })
  }
}

const handleClick = (item: any, index: number) => {
  if (slideIndex.value === index) {
    showDialog.value = true
  } else {
    slideIndex.value = index
    // Обновляем активный рабочий стол
    desktop.selectWorkspace(item.workspaceName)
    // Переходим на первый маршрут для выбранного рабочего стола
    navigateToWorkspace(item.workspaceName)
  }
}

const selectFromDialog = (index: number) => {
  showDialog.value = false
  slideIndex.value = index
  const item = menuWorkspaces.value[index]
  desktop.selectWorkspace(item.workspaceName)
  // Переходим на первый маршрут для выбранного рабочего стола
  navigateToWorkspace(item.workspaceName)
}

onMounted(() => {
  // Находим индекс активного рабочего стола
  const activeWorkspaceName = desktop.activeWorkspaceName
  if (activeWorkspaceName) {
    const activeIndex = menuWorkspaces.value.findIndex(
      item => item.workspaceName === activeWorkspaceName
    )
    if (activeIndex !== -1) {
      slideIndex.value = activeIndex
    }
  }
})

// При изменении slideIndex обновляем активный рабочий стол
watch(slideIndex, (newIndex) => {
  const item = menuWorkspaces.value[newIndex]
  if (item) {
    desktop.selectWorkspace(item.workspaceName)
    navigateToWorkspace(item.workspaceName)
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
