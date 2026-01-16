<template lang="pug">
.component-to-project-path.q-mt-md
  // Путь к родительскому проекту
  .breadcrumb-item(
    v-if="project?.parent_hash && parentProject?.title"
    @click="goToParentProject"
  )
    q-icon(name="folder", size="14px", color="grey-7")
    span {{ truncateText(parentProject.title, 35) }}
    q-icon.breadcrumb-link(name="open_in_new", size="10px")

  // Или сообщение, если проект не загружен
  .breadcrumb-loading(v-else-if="project?.parent_hash && !parentProject")
    q-icon(name="folder", size="14px", color="grey-5")
    span.text-grey-6 Загрузка проекта...


</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { IProject } from 'app/extensions/capital/entities/Project/model';
import { api as ProjectApi } from 'app/extensions/capital/entities/Project/api';

const router = useRouter();
const route = useRoute();

const props = defineProps<{
  project?: IProject | null;
}>();

// Родительский проект
const parentProject = ref<IProject | null>(null);

// Функция для сокращения текста
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Загрузка информации о родительском проекте
const loadParentProject = async () => {
  if (props.project?.parent_hash && !parentProject.value) {
    try {
      const projectData = await ProjectApi.loadProject({
        hash: props.project.parent_hash,
      });

      if (projectData) {
        parentProject.value = projectData;
      }
    } catch (error) {
      console.error('Ошибка при загрузке родительского проекта:', error);
      parentProject.value = null;
    }
  }
};

// Переход к родительскому проекту
const goToParentProject = () => {
  if (!props.project?.parent_hash) return;

  // Сохраняем текущие параметры маршрута для возможности возврата
  const backRouteKey = `backroute_${Date.now()}`;
  sessionStorage.setItem(backRouteKey, JSON.stringify({
    name: route.name,
    params: route.params,
    query: { ...route.query, _backRoute: undefined, _useHistoryBack: undefined }
  }));

  // Переходим на страницу описания проекта
  router.push({
    name: 'project-description',
    params: { project_hash: props.project.parent_hash },
    query: {
      _backRoute: backRouteKey
    }
  });
};

// Загружаем родительский проект при изменении props.project
watch(() => props.project, async (newProject) => {
  if (newProject?.parent_hash) {
    await loadParentProject();
  } else {
    parentProject.value = null;
  }
}, { immediate: true });

// Инициализация
onMounted(async () => {
  if (props.project?.parent_hash) {
    await loadParentProject();
  }
});
</script>

<style lang="scss" scoped>
.component-to-project-path {
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

  .q-icon {
    flex-shrink: 0;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.breadcrumb-loading,
.breadcrumb-info {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-weight: normal;

  .q-icon {
    flex-shrink: 0;
  }
}

.breadcrumb-link {
  opacity: 0.4;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .component-to-project-path {
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

  .breadcrumb-loading,
  .breadcrumb-info {
    .q-icon {
      font-size: 12px;
    }
  }
}
</style>
