<template lang="pug">
div(
  :class="compactMobile ? 'capital-sidebar-mobile-compact q-px-md q-pb-sm' : 'capital-sidebar-root-desktop q-pa-md column no-wrap flex-1 min-h-0 min-w-0'"
)
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
        ProjectControls(:project='project').full-width.q-mt-xs
        DeleteProjectSidebarButton(
          v-if='project'
          :coopname='project.coopname'
          :project-hash='project.project_hash'
          :can-delete='project.permissions?.can_delete_project ?? false'
          entity-label='компонент'
          @deleted='emit("project-deleted")'
        )

  template(v-else)
    .capital-sidebar-scroll.col.flex-1.min-h-0.overflow-auto
      ProjectControls(:project='project').full-width

    .capital-sidebar-delete-footer.col-auto.q-pt-md(
      v-if="project?.permissions?.can_delete_project"
    )
      DeleteProjectSidebarButton(
        :coopname='project.coopname'
        :project-hash='project.project_hash'
        :can-delete='true'
        entity-label='компонент'
        @deleted='emit("project-deleted")'
      )

</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { IProject } from 'app/extensions/capital/entities/Project/model'
import { ProjectControls } from 'app/extensions/capital/widgets/ProjectControls'
import { DeleteProjectSidebarButton } from 'app/extensions/capital/features/Project/DeleteProject'

interface Props {
  project: IProject | null | undefined
  /** Мобильный layout: контролы и удаление по кнопке «Подробнее» */
  compactMobile?: boolean
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
  'project-deleted': []
}>()
</script>

<style lang="scss" scoped>
.capital-sidebar-root-desktop {
  align-self: stretch;
  height: 100%;
  max-height: 100%;
}

.capital-sidebar-scroll {
  min-height: 0;
}

.capital-sidebar-delete-footer {
  flex-shrink: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.08);

  :deep(.q-btn) {
    margin-top: 0;
  }
}

.body--dark .capital-sidebar-delete-footer,
.q-dark .capital-sidebar-delete-footer {
  border-top-color: rgba(255, 255, 255, 0.12);
}

.capital-sidebar-mobile-compact {
  padding-top: 0;
}

.capital-sidebar-details-btn {
  margin-top: 0;
  margin-bottom: 0;
  width: 100%;
}
</style>
