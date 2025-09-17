<template lang="pug">
div
  // Заголовок с информацией о задаче
  q-card.q-mb-md(flat)
    q-card-section
      .row.items-center.q-gutter-sm
        q-icon(name='task', size='24px')
        div
          .text-h6 {{ issue?.title || 'Загрузка...' }}

    q-card-section
      .row.items-center.q-gutter-md.q-mb-sm
        .col
          .text-body2 Описание: {{ issue?.description || '—' }}

      .row.items-center.q-gutter-md
        .col-auto
          q-chip(
            :color='getIssueStatusColor(issue?.status || "")',
            text-color='white',
            dense,
            :label='getIssueStatusLabel(issue?.status || "")'
          )
        .col-auto
          q-chip(
            :color='getIssuePriorityColor(issue?.priority || "")',
            text-color='white',
            dense,
            :label='getIssuePriorityLabel(issue?.priority || "")'
          )
        .col-auto
          .text-body2 Оценка: {{ issue?.estimate || '—' }} ч
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { FailAlert } from 'src/shared/api';
import { api as IssueApi } from 'app/extensions/capital/entities/Issue/api';
import type { IIssue } from 'app/extensions/capital/entities/Issue/model';
import { useBackButton } from 'src/shared/lib/navigation';
import { useRightDrawer } from 'src/shared/hooks/useRightDrawer';
import { StoriesWidget } from 'app/extensions/capital/widgets/StoryWidget';
import {
  getIssueStatusColor,
  getIssueStatusLabel,
  // getIssuePriorityIcon,
  getIssuePriorityColor,
  getIssuePriorityLabel,
} from 'app/extensions/capital/shared/lib';

const route = useRoute();

const issue = ref<IIssue | null>(null);
const loading = ref(false);

// Получаем параметры из маршрута
const issueHash = computed(() => route.params.issue_hash as string);
const projectHash = computed(() => route.params.project_hash as string);

// Хук для правого drawer'а
const { registerAction: registerRightDrawerAction } = useRightDrawer();

// Настраиваем кнопку "Назад"
useBackButton({
  text: 'К задачам',
  routeName: 'project-tasks',
  componentId: 'issue-page-' + issueHash.value,
});

// Загрузка задачи
const loadIssue = async () => {
  loading.value = true;
  try {
    console.log('Загрузка задачи:', issueHash.value);

    // Получаем задачу по HASH
    const issueData = await IssueApi.loadIssue({
      issue_hash: issueHash.value,
    });

    issue.value = issueData || null;

    // Регистрируем StoriesWidget в правом drawer после загрузки задачи
    if (issue.value) {
      registerRightDrawerAction({
        id: 'issue-stories-' + issueHash.value,
        component: StoriesWidget,
        props: {
          filter: {
            issue_id: issue.value._id, // Только истории этой задачи
            project_hash: projectHash.value,
          },
          canCreate: true,
          maxItems: 20,
          emptyMessage: 'Историй задачи пока нет',
        },
        order: 1,
      });
    }
  } catch (error) {
    console.error('Ошибка при загрузке задачи:', error);
    FailAlert('Не удалось загрузить задачу');
  } finally {
    loading.value = false;
  }
};

// Инициализация
onMounted(async () => {
  await loadIssue();
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
