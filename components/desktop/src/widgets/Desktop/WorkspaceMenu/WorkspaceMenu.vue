<template lang="pug">
div
  q-carousel.workspace-menu(
    v-model='slideIndex',
    animated,
    infinite,
    :arrows='menuWorkspaces.length > 1',
    swipeable,
    control-type='flat',
    control-color='grey',
    height='100px'
  )
    q-carousel-slide.flex.flex-center(
      v-for='(item, index) in menuWorkspaces',
      :name='index',
      :key='item.workspaceName'
    )
      q-btn.cursor-pointer.btn-menu.full-width(
        stack,
        flat,
        v-ripple,
        @click='handleClick(item, index)',
        align='center'
      )
        q-icon.btn-icon.q-pt-sm(:name='item.icon')
        span.btn-font {{ item.title }}

  q-dialog(v-model='showDialog')
    q-card(style='min-width: 300px; max-width: 90vw')
      q-bar.bg-primary.text-white
        span Выберите рабочий стол
        q-space
        q-btn(flat, dense, icon='close', v-close-popup)
          q-tooltip Закрыть

      .row
        div(
          v-for='(item, index) in menuWorkspaces',
          :key='item.workspaceName',
          :class='{ "col-6": !(index === menuWorkspaces.length - 1 && menuWorkspaces.length % 2 !== 0), "col-12": index === menuWorkspaces.length - 1 && menuWorkspaces.length % 2 !== 0 }'
        )
          q-btn.full-width.q-pa-sm.btn-menu(
            stack,
            flat,
            :class='headerClass(item)',
            @click='selectFromDialog(index)'
          )
            q-icon.btn-icon(:name='item.icon')
            .btn-font.text-center {{ item.title }}
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCurrentUser } from 'src/entities/Session';
import { useDesktopStore } from 'src/entities/Desktop/model';

const router = useRouter();
const user = useCurrentUser();
const desktop = useDesktopStore();

const slideIndex = ref(0);
const showDialog = ref(false);

// workspaceMenus – список рабочих столов из store
const workspaceMenus = computed(() => desktop.workspaceMenus);

// Фильтрация по ролям (если требуется)
const menuWorkspaces = computed(() => {
  const userRole = user.isChairman
    ? 'chairman'
    : user.isMember
      ? 'member'
      : 'user';
  return workspaceMenus.value.filter(
    (item) =>
      item.meta.roles?.includes(userRole) ||
      item.meta.roles === undefined ||
      item.meta.roles.length === 0,
  );
});

const headerClass = (item: any) => {
  return desktop?.activeWorkspaceName === item.workspaceName
    ? 'text-white bg-teal'
    : '';
};

const handleClick = (item: any, index: number) => {
  if (slideIndex.value === index) {
    showDialog.value = true;
  } else {
    slideIndex.value = index;
    // Обновляем активный рабочий стол
    desktop.selectWorkspace(item.workspaceName);
    // Добавляем небольшую задержку перед переходом для визуального эффекта
    setTimeout(() => {
      desktop.goToDefaultPage(router);
    }, 100);
  }
};

const selectFromDialog = (index: number) => {
  showDialog.value = false;
  slideIndex.value = index;
  const item = menuWorkspaces.value[index];
  desktop.selectWorkspace(item.workspaceName);
  // Добавляем небольшую задержку перед переходом для визуального эффекта
  setTimeout(() => {
    desktop.goToDefaultPage(router);
  }, 100);
};

onMounted(() => {
  // Находим индекс активного рабочего стола
  const activeWorkspaceName = desktop.activeWorkspaceName;
  if (activeWorkspaceName) {
    const activeIndex = menuWorkspaces.value.findIndex(
      (item) => item.workspaceName === activeWorkspaceName,
    );
    if (activeIndex !== -1) {
      slideIndex.value = activeIndex;
    }
  }
});

// При изменении slideIndex обновляем активный рабочий стол
watch(slideIndex, (newIndex) => {
  const item = menuWorkspaces.value[newIndex];
  if (item && desktop.activeWorkspaceName !== item.workspaceName) {
    desktop.selectWorkspace(item.workspaceName);
    setTimeout(() => {
      desktop.goToDefaultPage(router);
    }, 100);
  }
});
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
