<template lang="pug">
div
  // Button group для переключения между описанием и приглашением
  q-btn-group

    q-btn(
      size="md"
      :outline="activeTab !== 'description'",
      color="primary",
      label="Описание",
      @click="activeTab = 'description'"
    )
    q-btn(
      size="md"
      :outline="activeTab !== 'invite'",
      color="primary",
      label="Приглашение",
      @click="activeTab = 'invite'"
    )

    q-btn(
      size="md"
      :outline="activeTab !== 'planning'",
      color="primary",
      label="Финансирование",
      @click="activeTab = 'planning'"
    )
    q-btn(
      size="md"
      :outline="activeTab !== 'authors'"
      color="primary"
      label="Соавторы"
      @click="activeTab = 'authors'"
    )
    q-btn(
      size="md"
      :outline="activeTab !== 'contributors'"
      color="primary"
      label="Участники"
      @click="activeTab = 'contributors'"
    )

  // Редактор описания
  div(v-if="activeTab === 'description'")
    Editor(
      :min-height="200",
      v-if="project"
      v-model='description',
      :placeholder='descriptionPlaceholder || "Введите описание..."',
      :readonly="!permissions?.can_edit_project"
    )

  // Редактор приглашения
  div(v-if="activeTab === 'invite'")
    Editor(
      :min-height="200",
      v-if="project"
      v-model='invite',
      :placeholder='invitePlaceholder || "Введите приглашение..."',
      :readonly="!permissions?.can_edit_project"
    )

  // Планирование проекта
  div(v-if="activeTab === 'planning' && permissions?.can_edit_project")
    ProjectPlanning(:project='project')


  // Соавторы проекта
  div(v-if="activeTab === 'authors'" )
    ProjectAuthorsList(:project='project' style="min-height: 300px;")

  // Участники проекта
  div(v-if="activeTab === 'contributors'" )
    ProjectContributorsList(:project='project' style="min-height: 300px;")

</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import type { IProject, IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { Editor } from 'src/shared/ui';
import ProjectPlanning from './ProjectPlanning.vue';
import ProjectAuthorsList from './ProjectAuthorsList.vue';
import ProjectContributorsList from './ProjectContributorsList.vue';

const props = defineProps<{
  project: IProject | null | undefined;
  descriptionPlaceholder?: string;
  invitePlaceholder?: string;
  permissions?: IProjectPermissions | null;
}>();

const emit = defineEmits<{
  'update:description': [value: string];
  'update:invite': [value: string];
  fieldChange: [];
}>();

// Активная вкладка
const activeTab = ref<'description' | 'invite' | 'management' | 'planning' | 'authors' | 'contributors'>('description');

// Следим за изменением permissions и переключаем на доступную вкладку
watch(() => props.permissions, (newPermissions) => {
  if (!newPermissions?.can_edit_project && (activeTab.value === 'management' || activeTab.value === 'planning')) {
    activeTab.value = 'description';
  }
});

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
