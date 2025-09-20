<template lang="pug">
div
  // Заголовок с информацией о проекте
  q-card.q-mb-md(flat)
    q-card-section
      .row.items-center.q-gutter-sm
        q-icon(name='folder', size='24px')
        div
          .text-h6 {{ project?.title || 'Загрузка...' }}

    q-card-section
      .row.items-center.q-gutter-md
        .col
          Editor(
            v-if="project"
            v-model='project.description',
            label='Описание проекта',
            placeholder='',
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
import { FailAlert } from 'src/shared/api';
import { CreateComponentButton } from 'app/extensions/capital/features/Project/CreateComponent';
import 'src/shared/ui/TitleStyles';
import {Editor} from 'src/shared/ui';
import { ComponentsListWidget } from 'app/extensions/capital/widgets/ComponentsListWidget';
import { IssuesListWidget } from 'app/extensions/capital/widgets/IssuesListWidget';

const route = useRoute();
const projectStore = useProjectStore();

// Состояние развернутости компонентов
const expandedComponents = ref(new Map<string, boolean>());

const project = ref<IProject | null | undefined>(null);

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);
const router = useRouter();

// Настраиваем кнопку "Назад"
useBackButton({
  text: 'К проектам',
  routeName: 'projects',
  componentId: 'project-components-' + projectHash.value,
});

// Регистрируем кнопку создания компонента в header
const { registerAction: registerHeaderAction } = useHeaderActions();

// Регистрируем контент в правом drawer
const { registerAction: registerRightDrawerAction } = useRightDrawer();

// Регистрируем действие в header
onMounted(() => {
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
    project.value = projectStore.project;

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
  expandedComponents.value.set(componentHash, !expandedComponents.value.get(componentHash));
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
