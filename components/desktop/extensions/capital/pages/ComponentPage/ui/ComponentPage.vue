<template lang="pug">
div
  // Заголовок с информацией о проекте
  q-card.q-mb-md(flat)
    q-card-section
      .row.items-center.q-gutter-sm
        q-icon(name='task', size='24px')
        div
          .text-h6 {{ project?.title || 'Загрузка...' }}


    q-card-section
      .row.items-center.q-gutter-md
        .col
          // Индикатор авто-сохранения
          AutoSaveIndicator(
            :is-auto-saving="isAutoSaving"
            :auto-save-error="autoSaveError"
          )

          Editor(
            v-if="project"
            v-model='project.description',
            label='Описание компонента',
            placeholder='',
            @change='handleDescriptionChange'
          )
  // Таблица задач
  IssuesListWidget(
    :project-hash='projectHash',
    @issue-click='handleIssueClick'
  )
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, markRaw, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  type IProject,
  useProjectStore,
} from 'app/extensions/capital/entities/Project/model';
import {
  type IIssue,
} from 'app/extensions/capital/entities/Issue/model';
import { StoriesWidget } from 'app/extensions/capital/widgets/StoryWidget';
import { useBackButton } from 'src/shared/lib/navigation';
import { useHeaderActions } from 'src/shared/hooks';
import { useRightDrawer } from 'src/shared/hooks/useRightDrawer';
import { FailAlert } from 'src/shared/api';
import { CreateIssueButton } from 'app/extensions/capital/features/Issue/CreateIssue';
import 'src/shared/ui/TitleStyles';
import {Editor, AutoSaveIndicator} from 'src/shared/ui';
import { textToEditorJS } from 'src/shared/lib/utils/editorjs';
import { useEditProject } from 'app/extensions/capital/features/Project/EditProject';
import { IssuesListWidget } from 'app/extensions/capital/widgets/IssuesListWidget';
const route = useRoute();
const projectStore = useProjectStore();

const project = ref<IProject | null | undefined>(null);

// Используем composable для редактирования проекта
const { debounceSave, isAutoSaving, autoSaveError } = useEditProject();

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Проверяем и конвертируем описание в EditorJS формат если необходимо
const ensureEditorJSFormat = (description: any) => {
  if (!description) return '{}';

  // Если это уже строка, пробуем распарсить как JSON
  if (typeof description === 'string') {
    try {
      JSON.parse(description);
      return description; // Уже валидный JSON
    } catch {
      // Не JSON, конвертируем из текста
      return textToEditorJS(description);
    }
  }

  // Если объект, конвертируем в строку
  if (typeof description === 'object') {
    return JSON.stringify(description);
  }

  // Если что-то другое, конвертируем как текст
  return textToEditorJS(String(description));
};

// Обработчик изменения описания проекта
const handleDescriptionChange = () => {
  if (!project.value) return;

  const updateData = {
    project_hash: project.value.project_hash || '',
    title: project.value.title || '',
    description: project.value.description || '',
    coopname: (project.value as any).coopname || '',
    invite: '',
    meta: '',
    data: '',
    can_convert_to_project: false,
  };

  // Запускаем авто-сохранение с задержкой
  debounceSave(updateData);
};
const router = useRouter();
// Настраиваем кнопку "Назад"
useBackButton({
  text: 'К проектам',
  routeName: 'projects',
  componentId: 'project-tasks-' + projectHash.value,
});

// Регистрируем кнопку создания задачи в header
const { registerAction: registerHeaderAction } = useHeaderActions();

// Регистрируем контент в правом drawer
const { registerAction: registerRightDrawerAction } = useRightDrawer();

// Регистрируем действие в header
onMounted(() => {
  registerHeaderAction({
    id: 'create-task-' + projectHash.value,
    component: markRaw(CreateIssueButton),
    order: 1,
  });
});


// Загрузка проекта
const loadProject = async () => {
  try {
    await projectStore.loadProject({
      hash: projectHash.value,
    });
    project.value = projectStore.project;

    // Конвертируем описание в EditorJS формат если необходимо
    if (project.value?.description) {
      project.value.description = ensureEditorJSFormat(project.value.description);
    }

    // Регистрируем StoriesWidget в правом drawer
    if (project.value) {
      registerRightDrawerAction({
        id: 'project-stories-' + projectHash.value,
        component: StoriesWidget,
        props: {
          filter: {
            project_hash: projectHash.value,
            issue_id: undefined, // Только истории проекта, не задач
          },
          canCreate: true,
          maxItems: 20,
          emptyMessage: 'Историй проекта пока нет',
          currentProjectHash: projectHash.value,
          onIssueClick: handleIssueClick,
          onStoryClick: handleStoryClick,
        },
        order: 1,
      });
    }
  } catch (error) {
    console.error('Ошибка при загрузке проекта:', error);
    FailAlert('Не удалось загрузить проект');
  }
};

// Функция goBack больше не нужна - используется useBackButton

// Обработчик клика по задаче
const handleIssueClick = (issue: IIssue) => {
  router.push({
    name: 'project-issue',
    params: {
      project_hash: projectHash.value,
      issue_hash: issue.issue_hash,
    },
  });
};

// Обработчик клика по истории (может быть использован для дополнительных действий)
const handleStoryClick = (story) => {
  // Заглушка для будущих расширений
  console.log('Story clicked:', story);
};

// Watcher для отслеживания изменения projectHash
watch(projectHash, async (newHash, oldHash) => {
  if (newHash && newHash !== oldHash) {
    await loadProject();
  }
});

// Инициализация
onMounted(async () => {
  await loadProject();
});
</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}

.text-h6 {
  margin-bottom: 4px;
}
</style>
