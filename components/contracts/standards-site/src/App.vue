<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';
</script>

<template>
  <div class="app-shell">
    <aside class="app-sidebar">
      <Sidebar />
    </aside>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>
