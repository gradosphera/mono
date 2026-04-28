<template lang="pug">
.set-creator-avatars(@click.stop)
  // Триггер: ряд аватарок (или плейсхолдер «назначить»).
  // По клику открывается q-menu с полным ContributorSelector — вся функциональность
  // существующего SetCreatorButton сохраняется (поиск, мульти-выбор, дебаунс-сохранение).
  .creators-trigger(
    :class='{ readonly: !canAssign, empty: currentCreators.length === 0 }'
  )
    template(v-if='currentCreators.length > 0')
      .avatar-stack
        q-avatar(
          v-for='(c, idx) in visibleCreators'
          :key='(c?.username) || idx'
          size='22px'
          color='primary'
          text-color='white'
          class='creator-avatar'
          :style='{ zIndex: visibleCreators.length - idx }'
        )
          | {{ initialOf(c) }}
          q-tooltip(anchor='bottom middle', self='top middle') {{ (c?.display_name) || (c?.username) }}
        q-avatar(
          v-if='hiddenCount > 0'
          size='22px'
          color='grey-4'
          text-color='dark'
          class='creator-avatar more-avatar'
        ) +{{ hiddenCount }}
    template(v-else)
      q-icon(name='person_add', size='18px', color='grey-6')

    q-menu(
      v-if='canAssign'
      anchor='bottom right'
      self='top right'
      :offset='[0, 4]'
    )
      .selector-popup
        ContributorSelector(
          v-model='selectedCreators'
          :multi-select='true'
          :dense='true'
          :loading='loading'
          :project-hash='issue?.project_hash'
          placeholder='поиск...'
          label='Исполнители'
          autofocus
        )
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useSetCreators } from '../model';
import { useContributorStore } from '../../../../entities/Contributor/model';
import { FailAlert } from 'src/shared/api/alerts';
import { ContributorSelector } from '../../../../entities/Contributor';
import type {
  IIssue,
  IIssuePermissions,
} from '../../../../entities/Issue/model';
import type { IContributor } from '../../../../entities/Contributor/model';

interface Props {
  issue: IIssue;
  permissions?: IIssuePermissions | null;
}

const props = withDefaults(defineProps<Props>(), { permissions: undefined });

const emit = defineEmits<{
  'creators-set': [creators: IContributor[]];
  'issue-updated': [issue: IIssue];
}>();

const { setCreators, setCreatorsInput } = useSetCreators();
const contributorStore = useContributorStore();

const loading = ref(false);
const selectedCreators = ref<IContributor[]>([]);
const currentCreators = ref<IContributor[]>([]);
const isSaving = ref(false);
const isLoadingCreators = ref(false);
const isProgrammaticChange = ref(false);

const canAssign = computed(() => !!props.permissions?.can_assign_creator);

const visibleCreators = computed(() => currentCreators.value.slice(0, 3));
const hiddenCount = computed(() =>
  Math.max(0, currentCreators.value.length - 3)
);

function initialOf(c: IContributor | undefined): string {
  const src = c?.display_name || c?.username || '?';
  return src.charAt(0).toUpperCase();
}

const loadCreators = async (creatorUsernames: string[]) => {
  isLoadingCreators.value = true;
  isProgrammaticChange.value = true;
  try {
    if (!creatorUsernames || creatorUsernames.length === 0) {
      currentCreators.value = [];
      selectedCreators.value = [];
      await nextTick();
      isProgrammaticChange.value = false;
      return;
    }
    const creators = await Promise.all(
      creatorUsernames.map(async (username) => {
        try {
          return await contributorStore.loadContributor({ username });
        } catch (error) {
          console.error(`Failed to load contributor ${username}:`, error);
          return null;
        }
      })
    );
    currentCreators.value = creators.filter(
      (c): c is IContributor => c !== null
    );
    selectedCreators.value = [...currentCreators.value];
    await nextTick();
  } catch (error) {
    console.error('SetCreatorAvatars: load creators failed', error);
    FailAlert('Не удалось загрузить исполнителей задачи');
    currentCreators.value = [];
    selectedCreators.value = [];
    await nextTick();
  } finally {
    isProgrammaticChange.value = false;
    isLoadingCreators.value = false;
  }
};

watch(
  () => props.issue,
  async (newIssue) => {
    if (newIssue) {
      setCreatorsInput.value.issue_hash = newIssue.issue_hash;
      await loadCreators(newIssue.creators || []);
    } else {
      await loadCreators([]);
    }
  },
  { immediate: true }
);

watch(
  selectedCreators,
  async (newCreators, oldCreators) => {
    if (isProgrammaticChange.value) return;
    if (isLoadingCreators.value) return;
    if (isSaving.value) return;

    const normalizedNew = Array.isArray(newCreators) ? newCreators : [];
    const normalizedOld = Array.isArray(oldCreators) ? oldCreators : [];

    if (props.permissions && !props.permissions.can_assign_creator) {
      const newIds = normalizedNew
        .map((c) => c?.username)
        .filter(Boolean)
        .sort();
      const curIds = currentCreators.value
        .map((c) => c?.username)
        .filter(Boolean)
        .sort();
      if (JSON.stringify(newIds) === JSON.stringify(curIds)) return;
      FailAlert('У вас нет прав на назначение исполнителей задачи');
      isProgrammaticChange.value = true;
      selectedCreators.value = [...normalizedOld];
      await nextTick();
      isProgrammaticChange.value = false;
      return;
    }

    const newUsernames = normalizedNew
      .map((c) => c?.username)
      .filter(Boolean)
      .sort();
    const curUsernames = currentCreators.value
      .map((c) => c?.username)
      .filter(Boolean)
      .sort();
    if (JSON.stringify(newUsernames) === JSON.stringify(curUsernames)) return;

    isSaving.value = true;
    loading.value = true;
    try {
      const inputData = {
        issue_hash: setCreatorsInput.value.issue_hash,
        creators: normalizedNew
          .map((c: IContributor) => c?.username)
          .filter((u): u is string => !!u),
      };
      const updatedIssue = await setCreators(inputData, props.issue);
      currentCreators.value = [...normalizedNew];
      emit('issue-updated', updatedIssue);
      emit('creators-set', normalizedNew);
    } catch (error) {
      console.error('SetCreatorAvatars: setCreators error', error);
      FailAlert(error);
      isProgrammaticChange.value = true;
      selectedCreators.value = [...normalizedOld];
      await nextTick();
      isProgrammaticChange.value = false;
    } finally {
      loading.value = false;
      isSaving.value = false;
    }
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.set-creator-avatars {
  display: inline-flex;
  align-items: center;
}

.creators-trigger {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 12px;
  transition: background-color 0.15s ease;

  &:hover:not(.readonly) {
    background-color: rgba(0, 0, 0, 0.04);
  }

  &.readonly {
    cursor: default;
  }

  &.empty {
    padding: 4px;
  }
}

.avatar-stack {
  display: inline-flex;
  flex-direction: row;
}

.creator-avatar {
  border: 2px solid var(--q-color-white, #fff);
  font-size: 11px;
  font-weight: 600;

  & + .creator-avatar {
    margin-left: -8px;
  }

  &.more-avatar {
    font-size: 10px;
    font-weight: 500;
  }
}

.selector-popup {
  padding: 12px;
  min-width: 260px;
  max-width: 320px;
}
</style>
