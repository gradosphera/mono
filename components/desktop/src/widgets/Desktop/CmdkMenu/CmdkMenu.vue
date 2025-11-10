<template lang="pug">
// Командная панель
q-dialog.cmdk-dialog(
  v-model="cmdkStore.showDialog",
  transition-show="slide-down",
  transition-hide="slide-up",
  @keydown="cmdkStore.handleDialogKeydown",
  @click="cmdkStore.closeDialog"
)
  .cmdk-panel
    // Заголовок
    .cmdk-header
      q-icon.cmdk-search-icon(name="search")
      input.cmdk-input(
        autofocus,
        ref="searchInput",
        v-model="cmdkStore.searchQuery",
        placeholder="Поиск рабочих столов и страниц...",
        @input="cmdkStore.handleSearch"
      )
      q-btn.cmdk-close-btn(
        flat,
        dense,
        round,
        size="sm",
        @click="cmdkStore.showDialog = false"
      )
        q-icon(name="close")

    // Список результатов
    div.cmdk-content(ref="contentRef")
      transition-group.cmdk-results(
        name="cmdk-fade",
        tag="div"
      )
        // Пустое состояние
        .cmdk-empty-state(
          v-if="cmdkStore.filteredItems.length === 0 && cmdkStore.searchQuery",
          key="empty"
        )
          q-icon(name="search_off", size="md")
          .empty-text Ничего не найдено
          .empty-subtext Попробуйте другой запрос

        // Группы воркспейсов
        template(v-else-if="cmdkStore.filteredItems.length > 0", v-for="(group, groupIndex) in cmdkStore.filteredItems", :key="group.workspaceName")
          .cmdk-group
            // Заголовок группы (воркспейс)
            .cmdk-group-header(
              :class="{ 'selected': cmdkStore.selectedIndex === groupIndex }"
              @click="cmdkStore.selectGroup(groupIndex)"
            )
              q-icon.cmdk-group-icon(:name="group.icon")
              .cmdk-group-title {{ group.title }}
              .cmdk-group-badge(v-if="group.isActive") Активный

            // Страницы внутри воркспейса
            .cmdk-pages
              .cmdk-page(
                v-for="(page, pageIndex) in group.pages",
                :key="page.name",
                :class="{ 'selected': cmdkStore.selectedIndex === groupIndex && cmdkStore.selectedPageIndex === pageIndex }"
                @click="cmdkStore.selectPage(group.workspaceName, page)"
              )
                q-icon.cmdk-page-icon(:name="page.meta.icon || 'circle'")
                .cmdk-page-title {{ page.meta.title }}
                .cmdk-page-shortcut(v-if="page.shortcut") {{ page.shortcut }}

    // Подсказки
    .cmdk-footer
      .cmdk-hint
        kbd ↑↓
        span для навигации
        kbd ↵ Enter
        span для выбора
        kbd ⎋ Esc
        span для закрытия
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue';
import { useCmdkMenuStore } from 'src/entities/CmdkMenu/model';

const cmdkStore = useCmdkMenuStore();
const searchInput = ref<HTMLInputElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

// Следим за contentRef и устанавливаем его в store
watchEffect(() => {
  if (contentRef.value) {
    cmdkStore.setContentRef(contentRef.value);
  }
});

// Инициализируем глобальные обработчики клавиш при монтировании компонента
onMounted(() => {
  cmdkStore.initGlobalKeydown();

  // Устанавливаем searchInput
  if (searchInput.value) {
    cmdkStore.setSearchInput(searchInput.value);
  }
});

onUnmounted(() => {
  cmdkStore.destroyGlobalKeydown();
});
</script>

<style lang="scss">
.cmdk-dialog {
  max-width: 100%;
}

.cmdk-panel {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.cmdk-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background: #fafafa;
}

.cmdk-search-icon {
  color: #666;
  margin-right: 12px;
  font-size: 18px;
}

.cmdk-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  font-weight: 500;
  color: #333;

  &::placeholder {
    color: #999;
  }
}

.cmdk-close-btn {
  margin-left: 12px;
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
}

.cmdk-content {
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 105, 92, 0.3);
    border-radius: 3px;
  }
}

.cmdk-results {
  padding: 8px 0;
}

.cmdk-group {
  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
}

.cmdk-group-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: rgba(0, 105, 92, 0.04);
  }

  &.selected {
    background: rgba(0, 105, 92, 0.08);
  }
}

.cmdk-group-icon {
  margin-right: 12px;
  color: #00695c;
  font-size: 18px;
}

.cmdk-group-title {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.cmdk-group-badge {
  background: #00695c;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.cmdk-pages {
  background: rgba(0, 0, 0, 0.02);
}

.cmdk-page {
  display: flex;
  align-items: center;
  padding: 10px 20px 10px 56px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: rgba(0, 105, 92, 0.06);
  }

  &.selected {
    background: rgba(0, 105, 92, 0.1);
  }
}

.cmdk-page-icon {
  margin-right: 12px;
  color: #666;
  font-size: 16px;
}

.cmdk-page-title {
  flex: 1;
  font-size: 14px;
  color: #555;
}

.cmdk-page-shortcut {
  color: #999;
  font-size: 12px;
  font-weight: 500;
}

.cmdk-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: #999;

  .q-icon {
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .empty-subtext {
    font-size: 14px;
  }
}

.cmdk-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: #fafafa;
}

.cmdk-hint {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #666;

  kbd {
    background: #e0e0e0;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 11px;
    font-weight: 500;
    color: #333;
    border: 1px solid #ccc;
  }

  span {
    margin-left: 4px;
  }
}

// Анимации
.cmdk-fade-enter-active,
.cmdk-fade-leave-active {
  transition: all 0.2s ease;
}

.cmdk-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.cmdk-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

// Темная тема
body.body--dark {
  .cmdk-panel {
    background: #1e1e1e;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .cmdk-header {
    background: #2a2a2a;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .cmdk-input {
    color: #e0e0e0;

    &::placeholder {
      color: #888;
    }
  }

  .cmdk-group-header:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .cmdk-group-header.selected {
    background: rgba(0, 105, 92, 0.15);
  }

  .cmdk-group-title {
    color: #e0e0e0;
  }

  .cmdk-page:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .cmdk-page.selected {
    background: rgba(0, 105, 92, 0.15);
  }

  .cmdk-page-title {
    color: #ccc;
  }

  .cmdk-footer {
    background: #2a2a2a;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .cmdk-hint {
    color: #888;
  }

  .cmdk-empty-state {
    color: #888;
  }
}
</style>
