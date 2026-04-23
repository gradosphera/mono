<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';

defineProps<{
  data: { label: string; action?: string; fromState?: string; isFocus: boolean };
}>();
</script>

<template>
  <div class="node-rejected" :title="data.action ? `Отклонено: ${data.action}` : 'Отклонено'">
    <span>{{ data.label }}</span>
    <Handle type="target" :position="Position.Left" :connectable="false" />
    <Handle type="source" :position="Position.Right" :connectable="false" />
  </div>
</template>

<style scoped>
.node-rejected {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--reject-soft);
  border: 1.5px dashed var(--reject);
  opacity: 0.55;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--reject);
  font-weight: 500;
}
:deep(.vue-flow__handle) {
  opacity: 0;
  pointer-events: none;
}
</style>
