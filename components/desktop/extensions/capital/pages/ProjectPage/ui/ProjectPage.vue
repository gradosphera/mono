<template lang="pug">
div
  // Заголовок с информацией о проекте
  q-card.q-mb-md(flat)
    q-card-section
      .row.items-center.q-gutter-sm
        div.full-width
          q-input(
            v-if="project"
            v-model='project.title'
            label='Название проекта'
            :readonly="!project?.permissions?.can_edit_project"
            @input="handleFieldChange"
          ).full-width.q-pa-sm
            template(#prepend)
              q-icon(name='folder', size='24px')
          .text-h6(v-if="!project") Загрузка...


      div.row.items-center.q-gutter-md
        div(style="max-height: 300px; overflow-y: auto;").col
          ProjectInfoSelectorWidget(
            :project='project',
            :permissions='project?.permissions',
            @update:description="(value) => { if (project) project.description = value }",
            @update:invite="(value) => { if (project) project.invite = value }",
            @field-change="handleFieldChange"
          )




      div(v-if="hasChanges && project?.permissions?.can_edit_project").row.justify-end.q-gutter-sm.q-mt-md
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

    // Список компонентов проекта
    ComponentsListWidget(
      :components='project?.components || []',
      :expanded='expandedComponents',
      @open-component='handleComponentClick',
      @toggle-component='handleComponentToggle'
    )
      template(#component-content='{ component }')
        IssuesListWidget(
          :project-hash='component.project_hash',
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
import { useExpandableState } from 'src/shared/lib/composables';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { CreateComponentButton } from 'app/extensions/capital/features/Project/CreateComponent';
import 'src/shared/ui/TitleStyles';
import { ComponentsListWidget } from 'app/extensions/capital/widgets/ComponentsListWidget';
import { IssuesListWidget } from 'app/extensions/capital/widgets/IssuesListWidget';
import { ProjectInfoSelectorWidget } from 'app/extensions/capital/widgets/ProjectInfoSelectorWidget';
import { useEditProject } from 'app/extensions/capital/features/Project/EditProject';

const route = useRoute();
const projectStore = useProjectStore();
const { saveImmediately } = useEditProject();

const project = ref<IProject | null | undefined>(null);

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


// Композабл для управления состоянием развернутости компонентов
const {
  expanded: expandedComponents,
  loadExpandedState: loadComponentsExpandedState,
  toggleExpanded: toggleComponentExpanded,
} = useExpandableState('capital_project_components_expanded');

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);
const router = useRouter();

// Настраиваем кнопку "Назад"
useBackButton({
  text: 'Назад',
  componentId: 'project-components-' + projectHash.value,
});

// Регистрируем кнопку создания компонента в header
const { registerAction: registerHeaderAction } = useHeaderActions();

// Регистрируем контент в правом drawer
const { registerAction: registerRightDrawerAction } = useRightDrawer();

// Регистрируем действие в header
onMounted(async () => {
  await loadProject();
  // Загружаем сохраненное состояние expanded из LocalStorage
  loadComponentsExpandedState();

  registerHeaderAction({
    id: 'create-component-' + projectHash.value,
    component: markRaw(CreateComponentButton),
    props: {
      project: project.value,
    },
    order: 1,
  });
});

// Загрузка проекта
const loadProject = async () => {
  try {
    await projectStore.loadProject({
      hash: projectHash.value,
    });

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
    console.error('Ошибка при сохранении проекта:', error);
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

// Обработчик клика по компоненту
const handleComponentClick = (componentHash: string) => {
  router.push({
    name: 'project-tasks',
    params: {
      project_hash: componentHash,
    },
  });
};

// Обработчик переключения компонентов
const handleComponentToggle = (componentHash: string) => {
  toggleComponentExpanded(componentHash);
};

// Обработчик клика по задаче
const handleIssueClick = (issue: IIssue) => {
  router.push({
    name: 'project-issue',
    params: {
      project_hash: issue.project_hash,
      issue_hash: issue.issue_hash,
    },
  });
};

// Обработчик клика по истории
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
watch(() => projectStore.projects.items, (newItems) => {
  if (newItems && projectHash.value) {
    const foundProject = newItems.find(p => p.project_hash === projectHash.value);
    if (foundProject) {
      project.value = foundProject;
      // Обновляем оригинальное состояние только если нет несохраненных изменений
      if (!hasChanges.value) {
        originalProject.value = JSON.parse(JSON.stringify(foundProject));
      }
    }
  }
}, { deep: true });


</script>

<style lang="scss" scoped>
.q-chip {
  font-weight: 500;
}

.text-h6 {
  margin-bottom: 4px;
}
</style>
