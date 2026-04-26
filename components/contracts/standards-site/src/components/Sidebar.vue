<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { standardsIndex } from '@/data/loader';
import ThemeToggle from '@/components/ThemeToggle.vue';

const route = useRoute();

const contracts = computed(() => standardsIndex.contracts);
const byContract = computed(() => standardsIndex.byContract);
const isEmpty = computed(() => contracts.value.length === 0);

const activeProcessType = computed(() => {
  return typeof route.params.processType === 'string' ? route.params.processType : null;
});
</script>

<template>
  <nav class="sidebar">
    <div class="sidebar-brand">
      <RouterLink to="/">
        <div class="sidebar-brand__title">Кооперативные стандарты</div>
        <div class="sidebar-brand__subtitle">Реестр v1</div>
      </RouterLink>
    </div>

    <div class="sidebar-body">
      <p v-if="isEmpty" class="sidebar-empty">
        Стандарты не найдены. Добавьте <code>*.standard.yaml</code> рядом с кодом контракта.
      </p>

      <div v-for="contract in contracts" :key="contract" class="sidebar-group">
        <span class="sidebar-group__label">{{ contract }}</span>
        <ul class="sidebar-group__list">
          <li v-for="entry in byContract[contract]" :key="entry.process_type">
            <RouterLink
              :to="{ name: 'process', params: { contract: entry.contract, processType: entry.process_type } }"
              class="sidebar-item"
              :class="{ 'sidebar-item--active': activeProcessType === entry.process_type }"
            >
              {{ entry.title }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="sidebar-foot">
      <ThemeToggle />
    </div>
  </nav>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.sidebar-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.sidebar-foot {
  flex: 0 0 auto;
  padding: 16px 24px 0;
  border-top: 1px solid var(--border);
  margin-top: 16px;
}
</style>
