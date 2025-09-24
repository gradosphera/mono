<template lang="pug">
div
  // Заголовок с информацией о компоненте
  q-card.q-mb-md(flat)
    q-card-section
      .row.items-center.q-gutter-sm
        div.full-width
          q-input(
            v-if="project"
            v-model='project.title'
            label='Название компонента'
            dense
            class="q-mb-sm"
            @input="handleFieldChange"
          ).full-width
            template(#prepend)
              q-icon(name='task', size='24px')
          .text-h6(v-if="!project") Загрузка...


      div.row.items-center.q-gutter-md
        div(style="max-height: 300px; overflow-y: auto;").col
          ProjectInfoSelectorWidget(
            :project='project',
            description-placeholder='Введите описание компонента...',
            invite-placeholder='Введите приглашение...',
            @update:description="(value) => { if (project) project.description = value }",
            @update:invite="(value) => { if (project) project.invite = value }",
            @field-change="handleFieldChange"
          )


      div(v-if="hasChanges").row.justify-end.q-gutter-sm.q-mt-md
        q-btn(
          flat
          color="negative"
          label="Отменить изменения"
          @click="resetChanges"
        )
        q-btn(
          color="primary"
          label="Сохранить"
          :loading="isSaving"
          @click="saveChanges"
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
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { CreateIssueButton } from 'app/extensions/capital/features/Issue/CreateIssue';
import 'src/shared/ui/TitleStyles';
import { textToEditorJS } from 'src/shared/lib/utils/editorjs';
import { useEditProject } from 'app/extensions/capital/features/Project/EditProject';
import { IssuesListWidget } from 'app/extensions/capital/widgets/IssuesListWidget';
import { ProjectInfoSelectorWidget } from 'app/extensions/capital/widgets/ProjectInfoSelectorWidget';
const route = useRoute();
const projectStore = useProjectStore();

const project = ref<IProject | null | undefined>(null);

// Используем composable для редактирования проекта
const { saveImmediately } = useEditProject();

// Состояние для отслеживания изменений
const originalProject = ref<IProject | null>(null);
const isSaving = ref(false);

// Вычисляемое свойство для определения наличия изменений
const hasChanges = computed(() => {
  if (!project.value || !originalProject.value) return false;

  return (
    project.value.title !== originalProject.value.title ||
    project.value.description !== originalProject.value.description ||
    project.value.invite !== originalProject.value.invite
  );
});

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

// Обработчик изменения полей
const handleFieldChange = () => {
  // Просто триггер реактивности для computed hasChanges
};

// Сохранение изменений
const saveChanges = async () => {
  if (!project.value) return;

  try {
    isSaving.value = true;

    const updateData = {
      project_hash: project.value.project_hash || '',
      title: project.value.title || '',
      description: project.value.description || '',
      invite: project.value.invite || '',
      coopname: (project.value as any).coopname || '',
      meta: '',
      data: '',
      can_convert_to_project: false,
    };

    await saveImmediately(updateData);

    // Обновляем оригинальное состояние после успешного сохранения
    originalProject.value = JSON.parse(JSON.stringify(project.value));

    SuccessAlert('Изменения сохранены успешно');
  } catch (error) {
    console.error('Ошибка при сохранении компонента:', error);
    FailAlert('Не удалось сохранить изменения');
  } finally {
    isSaving.value = false;
  }
};

// Сброс изменений
const resetChanges = () => {
  if (!originalProject.value) return;

  // Восстанавливаем оригинальные значения
  project.value = JSON.parse(JSON.stringify(originalProject.value));
};
const router = useRouter();
// Настраиваем кнопку "Назад"
useBackButton({
  text: 'Назад',
  componentId: 'project-tasks-' + projectHash.value,
});

// Регистрируем кнопку создания задачи в header
const { registerAction: registerHeaderAction } = useHeaderActions();

// Регистрируем контент в правом drawer
const { registerAction: registerRightDrawerAction } = useRightDrawer();


// Загрузка проекта
const loadProject = async () => {
  try {
    await projectStore.loadProject({
      hash: projectHash.value,
    });
    project.value = projectStore.project;

    // Инициализируем invite если его нет
    if (project.value && !project.value.invite) {
      project.value.invite = '';
    }

    // Конвертируем описание в EditorJS формат если необходимо
    if (project.value?.description) {
      project.value.description = ensureEditorJSFormat(project.value.description);
    }

    // Конвертируем invite в EditorJS формат если необходимо
    if (project.value?.invite) {
      project.value.invite = ensureEditorJSFormat(project.value.invite);
    }

    // Сохраняем оригинальное состояние для отслеживания изменений
    if (project.value) {
      originalProject.value = JSON.parse(JSON.stringify(project.value));
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

// Watcher для синхронизации локального состояния с store
watch(() => projectStore.project, (newProject) => {
  if (newProject) {
    project.value = newProject;
    // Обновляем оригинальное состояние только если нет несохраненных изменений
    if (!hasChanges.value) {
      originalProject.value = JSON.parse(JSON.stringify(newProject));
    }
  }
});

// Инициализация
onMounted(async () => {
  await loadProject();
  registerHeaderAction({
    id: 'create-task-' + projectHash.value,
    component: markRaw(CreateIssueButton),
    order: 1,
  });
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
