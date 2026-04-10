<template lang="pug">
div(:class="compactMobile ? 'capital-sidebar-mobile-compact q-px-md q-pb-sm' : 'q-pa-md'")
  template(v-if="compactMobile")
    q-btn.capital-sidebar-details-btn(
      flat
      dense
      no-caps
      align="left"
      size="sm"
      padding="xs sm"
      color="primary"
      :icon="detailsOpen ? 'expand_less' : 'expand_more'"
      :label="detailsOpen ? 'Свернуть' : 'Подробнее'"
      @click="detailsOpen = !detailsOpen"
    )
    q-slide-transition
      div(v-show="detailsOpen")
        IssueControls(
          :issue='issue'
          :permissions='permissions'
          @update:status='handleStatusUpdate'
          @update:priority='handlePriorityUpdate'
          @update:estimate='handleEstimateUpdate'
          @creators-set='handleCreatorsSet'
          @issue-updated='handleIssueUpdated'
        ).full-width.q-mt-xs

        DeleteIssueButton(
          v-if='issue && projectHash'
          :issue-hash='issue.issue_hash'
          :project-hash='projectHash'
          :can-delete='permissions?.can_delete_issue ?? false'
          @deleted='emit("issue-deleted")'
        )

  template(v-else)
    IssueControls(
      :issue='issue'
      :permissions='permissions'
      @update:status='handleStatusUpdate'
      @update:priority='handlePriorityUpdate'
      @update:estimate='handleEstimateUpdate'
      @creators-set='handleCreatorsSet'
      @issue-updated='handleIssueUpdated'
    ).q-mb-md.full-width

    DeleteIssueButton(
      v-if='issue && projectHash'
      :issue-hash='issue.issue_hash'
      :project-hash='projectHash'
      :can-delete='permissions?.can_delete_issue ?? false'
      @deleted='emit("issue-deleted")'
    )
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { IIssue, IIssuePermissions } from 'app/extensions/capital/entities/Issue/model'
import { IssueControls } from 'app/extensions/capital/widgets/IssueControls'
import { DeleteIssueButton } from 'app/extensions/capital/features/Issue/DeleteIssue'

interface Props {
  issue: IIssue | null | undefined
  permissions?: IIssuePermissions | null
  /** Мобильный layout: контролы и удаление по кнопке «Подробнее» */
  compactMobile?: boolean
  /** Хеш проекта/компонента-владельца списка задач (для стора и удаления) */
  projectHash?: string
}

const props = withDefaults(defineProps<Props>(), {
  compactMobile: false,
})

const detailsOpen = ref(false)

watch(
  () => props.compactMobile,
  (enabled) => {
    if (!enabled) {
      detailsOpen.value = false
    }
  },
)

const emit = defineEmits<{
  'update:status': [value: unknown]
  'update:priority': [value: unknown]
  'update:estimate': [value: number]
  'creators-set': [creators: unknown[]]
  'issue-updated': [issue: unknown]
  'issue-deleted': []
}>()

const handleStatusUpdate = (value: unknown) => {
  emit('update:status', value)
}

const handlePriorityUpdate = (value: unknown) => {
  emit('update:priority', value)
}

const handleEstimateUpdate = (value: number) => {
  emit('update:estimate', value)
}

const handleCreatorsSet = (creators: unknown[]) => {
  emit('creators-set', creators)
}

const handleIssueUpdated = (issue: unknown) => {
  emit('issue-updated', issue)
}
</script>

<style lang="scss" scoped>
.capital-sidebar-mobile-compact {
  padding-top: 0;
}

.capital-sidebar-details-btn {
  margin-top: 0;
  margin-bottom: 0;
  width: 100%;
}
</style>
