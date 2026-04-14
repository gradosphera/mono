<template lang="pug">
q-page.requirement-detail-page(padding).column.no-wrap
  .flex.flex-center.q-pa-lg(v-if='loading')
    q-spinner(color='primary' size='40px')
  q-banner.q-ma-md(v-else-if='loadError' rounded dense class='bg-negative text-white')
    | {{ loadError }}
  .column.col(v-else-if='story && permissionsLoaded' style='flex: 1 1 auto; min-height: 0')
    EditRequirementPanel(
      ref='panelRef'
      variant='page'
      :requirement='story'
      :canEdit='canEdit'
      @updated='onUpdated'
    )
      template(#toolbar-leading)
        q-btn(
          flat
          color='primary'
          icon='arrow_back'
          label='К списку'
          @click='onBackToList'
        )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api as StoryApi } from 'app/extensions/capital/entities/Story/api';
import { api as IssueApi } from 'app/extensions/capital/entities/Issue/api';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import type { IStory } from 'app/extensions/capital/entities/Story/model';
import type { IProjectPermissions } from 'app/extensions/capital/entities/Project/model';
import { EditRequirementPanel } from 'app/extensions/capital/features/Story/EditRequirement';

type PanelExposed = {
  tryNavigateAway?: () => boolean;
};

const route = useRoute();
const router = useRouter();
const projectStore = useProjectStore();

const loading = ref(true);
const loadError = ref('');
const story = ref<IStory | null>(null);
const projectPermissions = ref<IProjectPermissions | null>(null);
const permissionsLoaded = ref(false);
const panelRef = ref<PanelExposed | null>(null);

const projectHash = computed(() => route.params.project_hash as string);
const storyHash = computed(() => route.params.story_hash as string);

const canEdit = computed(() => projectPermissions.value?.can_create_requirement ?? false);

const listRouteName = computed(() =>
  route.name === 'component-requirement-detail' ? 'component-requirements' : 'project-requirements'
);

const goToList = () => {
  void router.push({
    name: listRouteName.value,
    params: { project_hash: projectHash.value },
  });
};

const onBackToList = () => {
  const leave = panelRef.value?.tryNavigateAway?.() ?? true;
  if (!leave) {
    return;
  }
  goToList();
};

const belongsToProjectContext = async (row: IStory, expectedProjectHash: string): Promise<boolean> => {
  if (row.project_hash === expectedProjectHash) {
    return true;
  }
  if (row.issue_hash) {
    try {
      const issue = await IssueApi.loadIssue({ issue_hash: row.issue_hash });
      return issue?.project_hash === expectedProjectHash;
    } catch {
      return false;
    }
  }
  return false;
};

const load = async () => {
  loading.value = true;
  loadError.value = '';
  story.value = null;
  permissionsLoaded.value = false;
  try {
    const row = await StoryApi.loadStory({ story_hash: storyHash.value });
    if (!row) {
      loadError.value = 'Артефакт не найден';
      return;
    }
    const ok = await belongsToProjectContext(row, projectHash.value);
    if (!ok) {
      loadError.value = 'Артефакт не относится к этому проекту';
      return;
    }
    story.value = row;

    const proj = await projectStore.loadProject({ hash: projectHash.value });
    projectPermissions.value = proj?.permissions ?? null;

  } catch (e) {
    console.error(e);
    loadError.value = 'Не удалось загрузить артефакт';
  } finally {
    permissionsLoaded.value = true;
    loading.value = false;
  }
};

const onUpdated = (updated: IStory) => {
  story.value = updated;
};

watch([projectHash, storyHash], () => {
  void load();
});

onMounted(() => {
  void load();
});
</script>

<style lang="scss" scoped>
/*
  Вложенный q-page под router-view: родительский q-page в layout не задаёт flex-высоту,
  поэтому опираемся на вьюпорт, чтобы карточка и BPMN могли занять оставшееся место.
*/
.requirement-detail-page {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: calc(100dvh - 56px);
  min-height: calc(100vh - 56px);
}
</style>
