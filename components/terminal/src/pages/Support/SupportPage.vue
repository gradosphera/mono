<template lang="pug">
  div#chatwoot-container
</template>

<script setup lang="ts">
// import { onMounted } from 'vue';
// import { createChatWoot } from '@productdevbook/chatwoot/vue';
// import { useApp } from 'vue'; // Используется для регистрации плагина

// const app = useApp(); // Подключаем инстанс приложения Vue

// onMounted(() => {
//   const baseUrl = window.location.origin; // Динамический URL с протоколом и хостом

//   const chatwoot = createChatWoot({
//     init: {
//       websiteToken: 'b6BejyTTuxF4yPt61ZTZHjdB',
//       baseUrl: baseUrl // Вставляем baseUrl
//     },
//     settings: {
//       locale: 'en',
//       position: 'left',
//       launcherTitle: 'Hello Chat'
//     },
//     partytown: false,
//   });

//   app.use(chatwoot); // Подключаем Chatwoot как плагин к приложению
// });
</script>

<style scoped>
#chatwoot-container {
  width: 100vw;
  height: 100vh;
  position: relative;
}
</style>
