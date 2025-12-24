<template lang="pug">
div
  | ChatWoot инициализируется глобально через boot файл.
  | Для тестирования используйте кнопку "Поддержка" в левом меню или командную панель (Ctrl/Cmd + K).
</template>

<script setup lang="ts">
// ChatWoot теперь инициализируется глобально через boot/chatwoot.ts
// Действие для открытия чата зарегистрировано в shared actions store
// Кнопка "Поддержка" в меню теперь вызывает действие вместо перехода на страницу
</script>

<style scoped>
/* Эта страница больше не используется для инициализации чата */
div {
  padding: 20px;
  color: #666;
  font-style: italic;
}
</style>
