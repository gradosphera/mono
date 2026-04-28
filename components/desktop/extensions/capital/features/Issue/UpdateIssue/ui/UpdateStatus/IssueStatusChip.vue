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
    )
      q-list(dense, style='min-width: 180px')
        q-item(
          v-for='opt in statusOptions'
          :key='opt.value'
          clickable
          v-close-popup
          @click='handleStatusChange(opt)'
        )
          q-item-section(avatar)
            q-badge(
              :color='statusColorOf(opt.value)'
              rounded
              style='min-width: 10px; height: 10px; padding: 0'
            )
          q-item-section
            .text-body2 {{ opt.label }}
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
</style>
