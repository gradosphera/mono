<template>
  <aside class="rail" role="navigation" aria-label="Главная навигация">
    <!-- Бренд: иконка + ПК «Название» / подпись расширения -->
    <div class="rail__top">
      <slot name="brand">
        <div class="rail__brand">
          <slot name="brand-icon">
            <q-icon name="dashboard" />
          </slot>
        </div>
        <div class="rail__name">
          <strong>{{ coopName ?? 'Кооператив' }}</strong>
          <span v-if="coopMeta">{{ coopMeta }}</span>
        </div>
      </slot>
    </div>

    <!-- ⌘K поиск — отдельным блоком после rail__top, как в каноне -->
    <button
      v-if="showCmdk"
      class="rail__cmdk"
      type="button"
      :style="cmdkStyle"
      :title="cmdkHint ?? 'Поиск'"
      @click="emit('cmdk')"
    >
      <q-icon name="search" :style="{ color: 'var(--p-ink-3)' }" />
      <span :style="{ color: 'var(--p-ink-2)', flex: 1, textAlign: 'left' }">
        {{ cmdkLabel ?? 'Найти' }}
      </span>
      <span :style="{ display: 'inline-flex', gap: '2px' }">
        <span class="kbd">⌘</span><span class="kbd">K</span>
      </span>
    </button>

    <!-- Пункты — плоский список или секции -->
    <template v-for="(entry, idx) in items" :key="idx">
      <template v-if="isSection(entry)">
        <div class="rail__sect-label">{{ entry.section }}</div>
        <nav class="rail__nav">
          <component
            :is="item.route ? 'router-link' : 'div'"
            v-for="item in entry.items"
            :key="item.key"
            :to="item.route"
            active-class=""
            exact-active-class=""
            :class="['rail__item', { 'rail__item--active': item.key === activeKey }]"
            :role="item.route ? undefined : 'button'"
            :tabindex="item.route ? undefined : 0"
            @click="emit('select', item)"
            @keydown.enter="emit('select', item)"
            @keydown.space.prevent="emit('select', item)"
          >
            <q-icon v-if="item.icon" :name="item.icon" class="rail__item-ico" />
            <span class="rail__item-label">{{ item.label }}</span>
            <span v-if="item.badge !== undefined" class="rail__item-meta">{{ item.badge }}</span>
            <span v-else-if="item.meta" class="rail__item-meta">{{ item.meta }}</span>
          </component>
        </nav>
      </template>

      <component
        v-else
        :is="(entry as RailItem).route ? 'router-link' : 'div'"
        :to="(entry as RailItem).route"
        active-class=""
        exact-active-class=""
        :class="['rail__item', { 'rail__item--active': (entry as RailItem).key === activeKey }]"
        :role="(entry as RailItem).route ? undefined : 'button'"
        :tabindex="(entry as RailItem).route ? undefined : 0"
        @click="emit('select', entry as RailItem)"
        @keydown.enter="emit('select', entry as RailItem)"
        @keydown.space.prevent="emit('select', entry as RailItem)"
      >
        <q-icon v-if="(entry as RailItem).icon" :name="(entry as RailItem).icon!" class="rail__item-ico" />
        <span class="rail__item-label">{{ (entry as RailItem).label }}</span>
        <span v-if="(entry as RailItem).badge !== undefined" class="rail__item-meta">
          {{ (entry as RailItem).badge }}
        </span>
        <span v-else-if="(entry as RailItem).meta" class="rail__item-meta">
          {{ (entry as RailItem).meta }}
        </span>
      </component>
    </template>

    <div class="rail__spacer" />

    <slot name="footer" />
  </aside>
</template>

<script setup lang="ts">
import type { AppDrawerProps, RailItem, RailSection } from './AppDrawer.types';

defineProps<AppDrawerProps>();

const emit = defineEmits<{
  select: [item: RailItem];
  cmdk: [];
}>();

function isSection(entry: RailItem | RailSection): entry is RailSection {
  return (entry as RailSection).section !== undefined;
}

// Canon-inline-стиль для cmdk: растянутая кнопка на ширину рейла с отступом 16px по бокам
const cmdkStyle = {
  margin: '12px 16px 0',
  alignSelf: 'stretch',
  width: 'auto',
  height: '32px',
  justifyContent: 'flex-start',
  padding: '0 12px',
  gap: '10px',
} as const;
</script>

<style scoped>
.kbd {
  display: inline-grid;
  place-items: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 3px;
  background: var(--p-surface);
  border: 1px solid var(--p-line-1);
  font: 500 10px/1 var(--p-mono);
  color: var(--p-ink-2);
}
</style>
