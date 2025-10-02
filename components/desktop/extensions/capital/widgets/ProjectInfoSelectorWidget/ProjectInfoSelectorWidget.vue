<template lang="pug">
div
  // Button group для переключения между описанием и приглашением
  q-btn-group.q-mb-md(flat, rounded)

    q-btn(
      size="sm"
      :outline="activeTab !== 'description'",
      color="primary",
      label="Описание",
      @click="activeTab = 'description'"
    )
    q-btn(
      size="sm"
      :outline="activeTab !== 'invite'",
      color="primary",
      label="Приглашение",
      @click="activeTab = 'invite'"
    )
    q-btn(
      size="sm"
      :outline="activeTab !== 'management'",
      color="primary",
      label="Управление",
      @click="activeTab = 'management'"
    )
    q-btn(
      size="sm"
      :outline="activeTab !== 'planning'",
      color="primary",
      label="Планирование",
      @click="activeTab = 'planning'"
    )

  // Редактор описания
  div(v-if="activeTab === 'description'")
    Editor(
      :min-height="200",
      v-if="project"
      v-model='description',
      :placeholder='descriptionPlaceholder || "Введите описание..."'
    )

  // Редактор приглашения
  div(v-if="activeTab === 'invite'")
    Editor(
      :min-height="200",
      v-if="project"
      v-model='invite',
      :placeholder='invitePlaceholder || "Введите приглашение..."'
    )

  // Управление проектом
  div(v-if="activeTab === 'management'")
    ProjectManagmentButtons(:project='project')

  // Планирование проекта
  div(v-if="activeTab === 'planning'")
    ProjectPlanningButtons(:project='project')

</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { IProject } from 'app/extensions/capital/entities/Project/model';
import { Editor } from 'src/shared/ui';
import ProjectManagmentButtons from './ProjectManagmentButtons.vue';
import ProjectPlanningButtons from './ProjectPlanningButtons.vue';

const props = defineProps<{
  project: IProject | null | undefined;
  descriptionPlaceholder?: string;
  invitePlaceholder?: string;
}>();

const emit = defineEmits<{
  'update:description': [value: string];
  'update:invite': [value: string];
  fieldChange: [];
}>();

// Активная вкладка
const activeTab = ref<'description' | 'invite' | 'management' | 'planning'>('description');

// Computed свойства для двухсторонней привязки
const description = computed({
  get: () => props.project?.description || '',
  set: (value: string) => {
    emit('update:description', value);
    emit('fieldChange');
  }
});

const invite = computed({
  get: () => props.project?.invite || '',
  set: (value: string) => {
    emit('update:invite', value);
    emit('fieldChange');
  }
});
</script>

<style lang="scss" scoped>
// Стили если необходимо
</style>
