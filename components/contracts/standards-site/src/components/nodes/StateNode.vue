<script setup lang="ts">
import { computed } from 'vue';
import { Handle, Position } from '@vue-flow/core';

const props = defineProps<{
  data: { label: string; human?: string; description?: string; isFocus: boolean };
}>();

// В квадратике показываем только короткое имя: приоритет data.human,
// fallback — description, обрезанный до одной строки.
const humanLabel = computed(() => props.data.human ?? '');
</script>

<template>
  <div class="node-state" :class="{ 'node-state--focus': data.isFocus }">
    <div class="node-state__label">{{ data.label }}</div>
    <div v-if="humanLabel" class="node-state__human">{{ humanLabel }}</div>
    <Handle type="target" :position="Position.Left" :connectable="false" />
    <Handle type="source" :position="Position.Right" :connectable="false" />
  </div>
</template>

<style scoped>
.node-state {
  position: relative;
  width: 180px;
  height: 68px;
  padding: 10px 12px;
  border-radius: 3px;
  background: var(--bg);
  border: 1.5px solid var(--border-strong);
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  transition: border-color 100ms ease, box-shadow 100ms ease, background 100ms ease;
  overflow: hidden;
}
/* Явный hint кликабельности: маленький «+» в правом верхнем углу */
.node-state::after {
  content: '';
  position: absolute;
  top: 6px;
  right: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-subtle);
  opacity: 0.5;
  transition: background 100ms ease, opacity 100ms ease;
}
.node-state:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.node-state:hover::after {
  background: var(--accent);
  opacity: 1;
}
.node-state--focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.node-state--focus::after {
  background: var(--accent);
  opacity: 1;
}
.node-state__label {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.2;
}
.node-state__human {
  font-size: 12px;
  line-height: 1.3;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
:deep(.vue-flow__handle) {
  opacity: 0;
  pointer-events: none;
}
</style>
