<template lang="pug">
.column.items-center.q-gutter-sm
  // Родительский проект (если есть)
  .path-item.full-width(
    v-if="project?.parent_hash && project?.parent_title"
    @click="goToProject(project.parent_hash)"
  )
    q-icon(name="folder", size="16px", color="primary")
    span.text-primary {{ project.parent_title }}

  // Разделитель
  q-icon(
    v-if="project?.parent_hash && project?.parent_title"
    name="expand_more",
    size="18px",
    color="grey-6"
  )

  // Текущий проект/компонент
  .path-item.full-width(
    v-if="project?.title"
    @click="goToProject(project?.project_hash)"
  )
    q-icon(name="task", size="16px", color="primary")
    span.text-primary {{ project?.title || 'Загрузка...' }}


</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import type { IProject } from 'app/extensions/capital/entities/Project/model';

const router = useRouter();

const props = defineProps<{
  project?: IProject | null;
}>();

const goToProject = (projectHash?: string) => {
  if (!projectHash) return;

  // Для компонентов (у которых есть parent_hash) переходим на страницу компонента
  // Для проектов (без parent_hash) переходим на страницу проекта
  const routeName = props.project?.parent_hash ? 'project-tasks' : 'project-components';

  router.push({
    name: routeName,
    params: { project_hash: projectHash }
  });
};
</script>

<style lang="scss" scoped>
.path-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(var(--q-primary-rgb), 0.08);
  border: 1px solid rgba(var(--q-primary-rgb), 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: rgba(var(--q-primary-rgb), 0.12);
    border-color: rgba(var(--q-primary-rgb), 0.3);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(var(--q-primary-rgb), 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgba(var(--q-primary-rgb), 0.2);
  }

  .q-icon {
    flex-shrink: 0;
    opacity: 0.8;
  }

  span {
    flex: 1;
    word-break: break-word;
    line-height: 1.3;
    min-width: 0;
  }

  // Для родительского проекта используем другой цвет
  &:first-child {
    background: rgba(var(--q-secondary-rgb), 0.08);
    border-color: rgba(var(--q-secondary-rgb), 0.2);

    &:hover {
      background: rgba(var(--q-secondary-rgb), 0.12);
      border-color: rgba(var(--q-secondary-rgb), 0.3);
      box-shadow: 0 2px 8px rgba(var(--q-secondary-rgb), 0.15);
    }

    &:active {
      box-shadow: 0 1px 4px rgba(var(--q-secondary-rgb), 0.2);
    }
  }
}

@media (max-width: 480px) {
  .path-item {
    padding: 6px 12px;
    font-size: 13px;
    gap: 6px;
  }

  .path-item .q-icon {
    font-size: 14px;
  }
}
</style>
