<template lang="pug">
.left-drawer-menu
  .menu-content
    CmdkTrigger
    SecondLevelMenuList
  .bottom-section
    .toggle-button-wrapper
      q-btn.toggle-btn(
        v-if="isBottomSectionExpanded !== null",
        flat,
        dense,
        round,
        size="sm",
        :icon="isBottomSectionExpanded ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up'",
        @click="toggleBottomSection"
      )
        q-tooltip {{ isBottomSectionExpanded ? 'Свернуть' : 'Развернуть' }}
      .toggle-placeholder(v-else)

    transition(name="slide")
      .bottom-content(v-show="isBottomSectionExpanded !== null && isBottomSectionExpanded")
        MicroWallet
        .logout-wrapper
          LogoutButton
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { SecondLevelMenuList } from '../SecondLevelMenuList';
import { CmdkTrigger } from '../CmdkTrigger';
import { LogoutButton } from 'src/features/User/Logout';
import { MicroWallet } from 'src/widgets/Wallet';

const STORAGE_KEY_BOTTOM_SECTION = 'monocoop-left-drawer-bottom-expanded';

const isBottomSectionExpanded = ref<boolean | null>(null);

// Загрузка состояния из localStorage при монтировании
onMounted(() => {
  const savedState = localStorage.getItem(STORAGE_KEY_BOTTOM_SECTION);
  // Если состояние сохранено - используем его, иначе показываем по умолчанию (true)
  isBottomSectionExpanded.value = savedState !== null ? savedState === 'true' : true;
});

// Переключение состояния с сохранением в localStorage
const toggleBottomSection = () => {
  isBottomSectionExpanded.value = !isBottomSectionExpanded.value;
  localStorage.setItem(STORAGE_KEY_BOTTOM_SECTION, isBottomSectionExpanded.value.toString());
};
</script>

<style scoped>
.left-drawer-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.bottom-section {
  margin-top: auto;
  padding-top: 8px;

    .toggle-button-wrapper {
      display: flex;
      justify-content: center;

      .toggle-btn {
        opacity: 0.7;
        transition: all 0.2s ease;

        &:hover {
          opacity: 1;
          transform: scale(1.1);
        }
      }

      .toggle-placeholder {
        width: 32px;
        height: 32px;
        /* Плейсхолдер для предотвращения скачков при загрузке */
      }
    }

  .bottom-content {
    .logout-wrapper {
      margin-top: 4px;
    }
  }
}

/* Анимация slide для нижнего меню */
.slide-enter-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}

.slide-leave-active {
  transition: all 0.25s ease-in;
  overflow: hidden;
}

/* При появлении: выдвигается НАВЕРХ (из-под кнопки) */
.slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* При исчезновении: уходит ВНИЗ (под кнопку) */
.slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

body.body--dark .bottom-section {
  border-top-color: rgba(255, 255, 255, 0.12);
}
</style>
