<template lang="pug">
div(style="max-width: 300px")
  ContributorSelector(
    v-model='selectedCreators'
    :multi-select='true'
    :dense='dense'
    :disable='disable'
    :loading='loading'
    :project-hash='issue?.project_hash'
    placeholder=''
    class='creators-selector'
    label='Исполнители'
  )
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSetCreators } from '../model';
import { useContributorStore } from '../../../../entities/Contributor/model';
import { FailAlert } from 'src/shared/api/alerts';
import { ContributorSelector } from '../../../../entities/Contributor';
import type { IIssue } from '../../../../entities/Issue/model';
import type { IContributor } from '../../../../entities/Contributor/model';

interface Props {
  issue: IIssue;
  dense?: boolean;
  disable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  dense: false,
  disable: false,
});

const emit = defineEmits<{
  'creators-set': [creators: IContributor[]];
}>();

const { setCreators, setCreatorsInput } = useSetCreators();
const contributorStore = useContributorStore();
const loading = ref(false);
const selectedCreators = ref<IContributor[]>([]);
const currentCreators = ref<IContributor[]>([]);
const isSaving = ref(false);

// Загрузка контрибьюторов по их usernames
const loadCreators = async (creatorUsernames: string[]) => {
  if (!creatorUsernames || creatorUsernames.length === 0) {
    currentCreators.value = [];
    selectedCreators.value = [];
    return;
  }

  try {
    // Загружаем каждого контрибьютора отдельно
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

    // Фильтруем null значения и устанавливаем текущих создателей
    currentCreators.value = creators.filter((creator): creator is IContributor => creator !== null);
    selectedCreators.value = [...currentCreators.value];
  } catch (error) {
    console.error('Error loading creators:', error);
    FailAlert('Не удалось загрузить создателей задачи');
    currentCreators.value = [];
    selectedCreators.value = [];
  }
};

// Обновляем входные данные при изменении задачи
watch(
  () => props.issue,
  async (newIssue) => {
    if (newIssue) {
      setCreatorsInput.value.issue_hash = newIssue.issue_hash;
      // Загружаем контрибьюторов по их usernames
      await loadCreators(newIssue.creators || []);
    } else {
      // Если задачи нет, очищаем создателей
      await loadCreators([]);
    }
  },
  { immediate: true },
);

// Автоматическое сохранение при изменении выбранных создателей
watch(selectedCreators, async (newCreators, oldCreators) => {
  // Игнорируем начальную установку
  if (oldCreators === undefined) return;

  // Предотвращаем повторное сохранение
  if (isSaving.value) return;

  // Проверяем, что newCreators не null и является массивом
  if (!Array.isArray(newCreators)) {
    console.warn('SetCreatorButton: newCreators is not an array', newCreators);
    return;
  }

  // Проверяем, что у всех выбранных участников есть username
  const invalidContributors = newCreators.filter(c => !c?.username);
  if (invalidContributors.length > 0) {
    console.error('SetCreatorButton: invalid contributors', invalidContributors);
    FailAlert('У некоторых выбранных участников отсутствует имя пользователя');
    return;
  }

  // Проверяем, изменились ли данные по сравнению с текущими создателями
  const newUsernames = newCreators
    .map(c => c?.username)
    .filter(Boolean)
    .sort();
  const currentUsernames = currentCreators.value
    .map(c => c?.username)
    .filter(Boolean)
    .sort();

  const usernamesChanged = JSON.stringify(newUsernames) !== JSON.stringify(currentUsernames);

  if (!usernamesChanged) {
    // Данные не изменились, не сохраняем
    return;
  }

  isSaving.value = true;
  loading.value = true;

  try {
    // Создаем копию объекта для передачи в API
    const inputData = {
      issue_hash: setCreatorsInput.value.issue_hash,
      creators: newCreators
        .map((c: IContributor) => c?.username)
        .filter((username): username is string => username !== undefined && username !== null),
    };

    await setCreators(inputData, props.issue);

    // Обновляем currentCreators после успешного сохранения
    currentCreators.value = [...newCreators];

    emit('creators-set', newCreators);
  } catch (error) {
    console.error('SetCreatorButton: setCreators error', error);
    FailAlert(error);

    // При ошибке перезагружаем создателей из issue
    if (props.issue) {
      await loadCreators(props.issue.creators || []);
    }
  } finally {
    loading.value = false;
    isSaving.value = false;
  }
}, { deep: true });

</script>

<style lang="scss" scoped>
.creators-selector {
  :deep(.q-field) {
    min-width: 250px;
  }
}
</style>
