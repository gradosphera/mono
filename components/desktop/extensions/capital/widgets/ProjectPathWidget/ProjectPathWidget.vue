<template lang="pug">
.breadcrumb-path
  // Родительский проект (если есть)
  .breadcrumb-item(
    v-if="project?.parent_hash && project?.parent_title"
    @click="goToParentProject(project.parent_hash)"
  )
    q-icon(name="folder", size="14px", color="grey-7")
    span {{ truncateText(project.parent_title, 30) }}
    q-icon.breadcrumb-link(name="open_in_new", size="10px")

  // Разделитель
  .breadcrumb-separator(
    v-if="project?.parent_hash && project?.parent_title"
  ) /

  // Текущий проект/компонент
  .breadcrumb-item.current(
    v-if="project?.title"
    @click="goToCurrentItem(project?.project_hash)"
  )
    q-icon(name="task", size="14px", color="primary")
    span {{ truncateText(project?.title || 'Загрузка...', 35) }}
    q-icon.breadcrumb-link(name="open_in_new", size="10px")

</template>

<script lang="ts" setup>
import { useRouter, useRoute } from 'vue-router';
import type { IProject } from 'app/extensions/capital/entities/Project/model';

const router = useRouter();
const route = useRoute();

const props = defineProps<{
  project?: IProject | null;
}>();

// Функция для сокращения текста
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

const goToParentProject = (projectHash?: string) => {
  if (!projectHash) return;

  // Сохраняем текущие параметры маршрута для возможности возврата
  const backRouteKey = `backroute_${Date.now()}`;
  sessionStorage.setItem(backRouteKey, JSON.stringify({
    name: route.name,
    params: route.params,
    query: { ...route.query, _backRoute: undefined, _useHistoryBack: undefined } // Убираем циклические ссылки
  }));

  // Родительский элемент всегда проект, переходим на страницу описания проекта
  router.push({
    name: 'project-description',
    params: { project_hash: projectHash },
    query: {
      _backRoute: backRouteKey
    }
  });
};

const goToCurrentItem = (projectHash?: string) => {
  if (!projectHash) return;

  // Сохраняем текущие параметры маршрута для возможности возврата
  const backRouteKey = `backroute_${Date.now()}`;
  sessionStorage.setItem(backRouteKey, JSON.stringify({
    name: route.name,
    params: route.params,
    query: { ...route.query, _backRoute: undefined, _useHistoryBack: undefined } // Убираем циклические ссылки
  }));

  // Для текущего элемента: если есть parent_hash, то это компонент, иначе - проект
  const routeName = props.project?.parent_hash ? 'component-description' : 'project-description';

  router.push({
    name: routeName,
    params: { project_hash: projectHash },
    query: {
      _backRoute: backRouteKey
    }
  });
};
</script>

<style lang="scss" scoped>
.breadcrumb-path {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 12px;
  background: rgba(var(--q-primary-rgb), 0.04);
  border: 1px solid rgba(var(--q-primary-rgb), 0.1);
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
  min-height: 36px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
  font-weight: 500;

  &:hover {
    color: var(--q-primary);
    text-decoration: underline;

    .breadcrumb-link {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  &.current {
    color: var(--q-primary);
    font-weight: 600;
  }

  .q-icon {
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.breadcrumb-separator {
  color: #999;
  font-weight: normal;
  user-select: none;
}

.breadcrumb-link {
  opacity: 0.4;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .breadcrumb-path {
    padding: 6px 8px;
    font-size: 12px;
    gap: 4px;
  }

  .breadcrumb-item {
    gap: 2px;

    .q-icon {
      font-size: 12px;
    }

    .breadcrumb-link {
      font-size: 8px;
    }
  }

  .breadcrumb-separator {
    font-size: 12px;
  }
}
</style>
