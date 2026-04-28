<template lang="pug">
.issue-status-chip(@click.stop)
  q-chip(
    :color='chipColor'
    text-color='white'
    :clickable='!isReadonly'
    dense
    square
    size='sm'
    class='status-chip-trigger'
  )
    span.status-chip-label {{ currentLabel }}
    q-icon(
      v-if='!isReadonly && hasTransitions'
      name='arrow_drop_down'
      size='xs'
      class='q-ml-xs'
    )
    q-menu(
      v-if='!isReadonly && hasTransitions'
      anchor='bottom right'
      self='top right'
      auto-close
      :offset='[0, 6]'
    )
      .status-menu
        .status-menu-header Сменить статус
        q-list.status-menu-list
          q-item.status-menu-item(
            v-for='opt in statusOptions'
            :key='opt.value'
            clickable
            v-close-popup
            @click='handleStatusChange(opt)'
          )
            q-item-section(avatar, style='min-width: 28px')
              q-icon(
                name='circle'
                :color='statusColorOf(opt.value)'
                size='10px'
              )
            q-item-section
              .status-menu-label {{ opt.label }}
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Zeus } from '@coopenomics/sdk';

import { useUpdateIssue } from '../../model';
import { useIssueStore } from 'app/extensions/capital/entities/Issue/model';
import {
  getIssueStatusLabel,
  getIssueStatusColor,
} from 'app/extensions/capital/shared/lib';

interface Props {
  modelValue: Zeus.IssueStatus;
  issueHash: string;
  readonly?: boolean;
  allowedTransitions?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: Zeus.IssueStatus): void;
}>();

const route = useRoute();
const projectHash = computed(() => route.params.project_hash as string);

const { debounceSave } = useUpdateIssue();
const issueStore = useIssueStore();

const ALL_STATUS_OPTIONS = [
  Zeus.IssueStatus.BACKLOG,
  Zeus.IssueStatus.TODO,
  Zeus.IssueStatus.IN_PROGRESS,
  Zeus.IssueStatus.ON_REVIEW,
  Zeus.IssueStatus.DONE,
  Zeus.IssueStatus.CANCELED,
].map((value) => ({ value, label: getIssueStatusLabel(value) }));

const hasTransitions = computed(
  () => (props.allowedTransitions ?? []).length > 0
);

const isReadonly = computed(() => props.readonly || !hasTransitions.value);

const statusOptions = computed(() =>
  ALL_STATUS_OPTIONS.filter((opt) =>
    (props.allowedTransitions ?? []).includes(opt.value as Zeus.IssueStatus)
  )
);

const currentLabel = computed(() => getIssueStatusLabel(props.modelValue));
const chipColor = computed(() => getIssueStatusColor(props.modelValue));

const statusColorOf = (s: string) => getIssueStatusColor(s);

const handleStatusChange = async (option: {
  value: Zeus.IssueStatus;
  label: string;
}) => {
  if (option.value === props.modelValue) return;
  const previousStatus = props.modelValue;
  try {
    emit('update:modelValue', option.value);
    await debounceSave(
      { issue_hash: props.issueHash, status: option.value },
      projectHash.value
    );
    await issueStore.updateIssueByHash(projectHash.value, props.issueHash);
  } catch (error) {
    console.error('IssueStatusChip: failed to update status', error);
    emit('update:modelValue', previousStatus);
  }
};
</script>

<style lang="scss" scoped>
.issue-status-chip {
  display: inline-flex;
  align-items: center;
}

.status-chip-trigger {
  font-weight: 500;
  font-size: 11px;
  padding: 0 8px;
  height: 22px;
  margin: 0;

  .status-chip-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 110px;
  }
}

// Меню смены статуса — внутренние отступы, hover, разделители.
.status-menu {
  min-width: 200px;
  padding: 6px;
  background-color: var(--q-color-white, #fff);
  border-radius: 8px;
}

.status-menu-header {
  font-size: 11px;
  font-weight: 500;
  color: var(--q-grey-6, #757575);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 8px 6px;
}

.status-menu-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-menu-item {
  border-radius: 6px;
  min-height: 36px;
  padding: 4px 10px;
  transition: background-color 0.12s ease;

  :deep(.q-focus-helper) {
    border-radius: 6px;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.status-menu-label {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
}
</style>
