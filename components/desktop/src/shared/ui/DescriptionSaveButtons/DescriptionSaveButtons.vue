<template lang="pug">
// Кнопки сохранения (если есть изменения)
div(v-if="hasChanges && canEdit").row.justify-center.q-gutter-sm
  q-btn(
    flat
    color="negative"
    label="Отменить"
    @click="$emit('reset')"
  )
  q-btn(
    color="primary"
    label="Сохранить"
    :loading="isSaving"
    @click="$emit('save')"
  )
</template>

<script lang="ts" setup>
defineProps<{
  hasChanges: boolean;
  canEdit: boolean;
  isSaving: boolean;
}>();

defineEmits<{
  reset: [];
  save: [];
}>();
</script>

<style lang="scss" scoped>
</style>
