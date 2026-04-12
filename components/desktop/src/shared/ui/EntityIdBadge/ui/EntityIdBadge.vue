<template lang="pug">
span.entity-id-badge__pill.list-item-title.text-caption(
  v-if="displayLabel"
  @click.stop="onActivate"
)
  | {{ displayLabel }}
  q-tooltip(v-if="copyOnClick") Скопировать id
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { copyToClipboard } from 'quasar';
import { FailAlert, SuccessAlert } from 'src/shared/api';

const props = withDefaults(
  defineProps<{
    /** Сырое значение id (без # — он добавляется внутри) */
    rawId: string | number | null | undefined;
    /** Клик копирует `#…` в буфер вместо навигации */
    copyOnClick?: boolean;
  }>(),
  { copyOnClick: false },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const displayLabel = computed((): string => {
  const v = props.rawId;
  if (v === null || v === undefined) return '';
  const s = typeof v === 'string' ? v.trim() : String(v);
  if (s === '') return '';
  return `${s}`;
});

const onActivate = async (e: MouseEvent) => {
  if (props.copyOnClick) {
    const text = displayLabel.value;
    if (!text) return;
    try {
      await copyToClipboard(text);
      SuccessAlert('Скопировано');
    } catch {
      FailAlert('Не удалось скопировать');
    }
    return;
  }
  emit('click', e);
};
</script>

<style lang="scss" scoped>
.entity-id-badge__pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 500;
  line-height: 1.3;
  cursor: pointer;
  vertical-align: middle;
  background: rgba(60, 60, 67, 0.1);
  color: rgba(60, 60, 67, 0.72);
  transition: color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.body--dark .entity-id-badge__pill,
.q-dark .entity-id-badge__pill {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.62);
}

/* Как глобальный .list-item-title:hover (scoped перекрывает глобаль — дублируем) */
.entity-id-badge__pill.list-item-title:hover {
  color: var(--q-accent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--q-accent) 35%, transparent);
}
</style>
