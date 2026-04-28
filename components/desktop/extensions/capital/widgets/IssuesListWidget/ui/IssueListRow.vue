<template lang="pug">
.issue-row(role='row')
  // 1. Метаблок (горизонтально): приоритет → ID → время с прогрессом.
  .meta-block
    q-icon.priority-icon(
      :name='priorityIcon'
      :color='priorityColor'
      size='18px'
    )
      q-tooltip(anchor='bottom middle', self='top middle') Приоритет: {{ priorityLabel }}
    EntityIdBadge(
      :raw-id='issue.id'
      copy-on-click
      address-clipboard
    )
      template(#prefix)
        q-icon(name='task', size='xs')
    Estimation.meta-time(
      v-if='hasTime'
      :estimation='issue.estimate'
      :fact='issue.fact'
      size='xs'
      no-icon
    )

  // 2. Тайтл: занимает всё свободное место, переносится по словам, ellipsis по необходимости.
  .title-block(@click.stop="onTitleClick")
    span.title-text {{ issue.title }}
    q-chip.label-chip(
      v-for='tag in tags'
      :key='tag'
      dense
      size='sm'
      color='grey-4'
      text-color='dark'
    ) {{ tag }}

  // 3. Действия: компактный chip статуса + аватарки исполнителей.
  .actions-block(@click.stop)
    IssueStatusChip(
      :model-value='issue.status'
      :issue-hash='issue.issue_hash'
      :readonly='!issue.permissions.can_change_status'
      :allowed-transitions='issue.permissions.allowed_status_transitions'
    )
    SetCreatorAvatars(
      :issue='issue'
      :permissions='issue.permissions'
    )
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { EntityIdBadge, Estimation } from 'src/shared/ui';
import { IssueStatusChip } from '../../../features/Issue/UpdateIssue/ui/UpdateStatus';
import { SetCreatorAvatars } from '../../../features/Issue/SetCreator';
import {
  getIssuePriorityIcon,
  getIssuePriorityColor,
  getIssueLabels,
} from 'app/extensions/capital/shared/lib';
import type { IIssue } from 'app/extensions/capital/entities/Issue/model';

const props = defineProps<{ issue: IIssue }>();
const emit = defineEmits<{ (e: 'click', issue: IIssue): void }>();

const onTitleClick = () => emit('click', props.issue);

const tags = computed(() => getIssueLabels(props.issue));
const priorityIcon = computed(() => getIssuePriorityIcon(props.issue.priority));
const priorityColor = computed(() =>
  getIssuePriorityColor(props.issue.priority)
);
const priorityLabel = computed(() => props.issue.priority || '—');

const hasTime = computed(() => {
  const e = props.issue.estimate;
  const f = (props.issue as { fact?: number }).fact;
  return (e != null && e > 0) || (f != null && f > 0);
});
</script>

<style lang="scss" scoped>
.issue-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 6px 12px;
  width: 100%;
  box-sizing: border-box;
}

// 1. Meta — горизонтальная цепочка приоритет → ID → время.
.meta-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
}

.priority-icon {
  flex-shrink: 0;
}

.meta-time {
  // Время идёт справа от ID, без иконки-часов внутри (она утяжеляла строку).
  font-size: 11px;
  line-height: 1;
  flex-shrink: 0;
}

// 2. Title — растягивается, ellipsis при нехватке места.
.title-block {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: color 0.15s ease;

  &:hover {
    color: var(--q-accent);
  }
}

.title-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  max-width: 100%;
}

.label-chip {
  font-size: 0.7rem;
  font-weight: 500;
  max-width: 140px;

  :deep(.q-chip__content) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

// 3. Actions — фиксированный набор справа, не сжимается.
.actions-block {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}

// Mobile: meta + title в первой строке (title справа от меты), actions
// переносится во вторую строку и прижимается вправо.
@media (max-width: 640px) {
  .issue-row {
    flex-wrap: wrap;
    row-gap: 6px;
  }

  .meta-block {
    gap: 6px;

    // На узких экранах прячем время — оно остаётся у заголовка задачи в детали.
    .meta-time {
      display: none;
    }
  }

  .title-block {
    flex: 1 1 0;
    min-width: 0;
  }

  .actions-block {
    width: 100%;
    margin-left: 0;
    justify-content: flex-end;
  }
}
</style>
