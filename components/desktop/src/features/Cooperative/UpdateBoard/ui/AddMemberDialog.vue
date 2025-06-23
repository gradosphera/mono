<template lang="pug">
q-dialog(v-model='show', persistent, :maximized='false')
  q-card
    div
      q-bar.bg-gradient-dark
        span Добавить члена совета
        q-space
        q-btn(v-close-popup, dense, flat, icon='close')
          q-tooltip Close

      .q-pa-sm
        .q-pa-md
          p Внимание! Вы собираетесь добавить участника в совет кооператива. Выберите участника для добавления:
          .q-pa-md
            UserSearchSelector(
              v-model='selectedUsername',
              label='Участник для добавления в совет',
              dense,
              standout='bg-teal text-white',
              :rules='[(val) => !!val || "Обязательное поле"]'
            )
        div
          q-btn(flat, @click='cancel') Отменить
          q-btn(color='primary', @click='add', :loading='loading') Добавить
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { UserSearchSelector } from 'src/shared/ui';

const props = defineProps<{
  modelValue: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'add', username: string): void;
}>();

const selectedUsername = ref('');

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const add = () => {
  if (selectedUsername.value) {
    emit('add', selectedUsername.value);
    selectedUsername.value = '';
  }
};

const cancel = () => {
  emit('update:modelValue', false);
  selectedUsername.value = '';
};
</script>
