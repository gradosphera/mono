<template lang="pug">
div.invite-widget(
  @click="handleClick"
  :class="{ 'cursor-pointer': clickable }"
)
  Editor(
    :model-value="invite"
    :readonly="true"
    :toolbar="false"
    placeholder="Нет инвайта"
    class="invite-editor"
  )
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from 'vue';
import { Editor } from 'src/shared/ui';

const emit = defineEmits<{
  click: [projectHash: string];
}>();

// Определяем props
const props = defineProps<{
  invite: string;
  projectHash?: string;
  clickable?: boolean;
}>();

// Обработчик клика
const handleClick = () => {
  if (props.clickable && props.projectHash) {
    emit('click', props.projectHash);
    // Или можно напрямую переходить
    // router.push({ name: 'accept-project-invite', params: { project_hash: props.projectHash } });
  }
};
</script>

<style lang="scss" scoped>
.invite-widget {
  transition: all 0.2s ease;

  &.cursor-pointer:hover {
    .invite-editor :deep(.ql-editor) {
      background-color: #e8f5e8;
      border: 1px solid #4caf50;
    }
  }

  .invite-editor {
    min-height: 100px;
    max-height: 200px;
    overflow-y: auto;

    :deep(.ql-editor) {
      padding: 8px;
      border-radius: 4px;
      background-color: #f5f5f5;
      font-size: 14px;
      line-height: 1.4;
      transition: all 0.2s ease;
    }

    :deep(.ql-toolbar) {
      display: none;
    }
  }
}
</style>
