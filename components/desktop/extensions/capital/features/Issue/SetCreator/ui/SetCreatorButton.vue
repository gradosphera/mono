<template lang="pug">
div(style="max-width: 300px")
  ContributorSelector(
    v-model='selectedCreators'
    :multi-select='true'
    :dense='dense'
    :disable='disable'
    :loading='loading'
    placeholder=''
    class='creators-selector'
    label='Создатели'
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
  issue: IIssue | null;
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

// Загрузка контрибьюторов по их хэшам
const loadCreators = async (creatorHashes: string[]) => {
  if (!creatorHashes || creatorHashes.length === 0) {
    currentCreators.value = [];
    selectedCreators.value = [];
    return;
  }

  try {
    // Загружаем каждого контрибьютора отдельно
    const creators = await Promise.all(
      creatorHashes.map(async (hash) => {
        try {
          return await contributorStore.loadContributor({ contributor_hash: hash });
        } catch (error) {
          console.error(`Failed to load contributor ${hash}:`, error);
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
      // Загружаем контрибьюторов по их хэшам
      await loadCreators(newIssue.creators_hashs || []);
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

  // Проверяем, что у всех выбранных вкладчиков есть contributor_hash
  const invalidContributors = newCreators.filter(c => !c?.contributor_hash);
  if (invalidContributors.length > 0) {
    console.error('SetCreatorButton: invalid contributors', invalidContributors);
    FailAlert('У некоторых выбранных вкладчиков отсутствует хэш');
    return;
  }

  // Проверяем, изменились ли данные по сравнению с текущими создателями
  const newHashes = newCreators
    .map(c => c?.contributor_hash)
    .filter(Boolean)
    .sort();
  const currentHashes = currentCreators.value
    .map(c => c?.contributor_hash)
    .filter(Boolean)
    .sort();

  const hashesChanged = JSON.stringify(newHashes) !== JSON.stringify(currentHashes);

  if (!hashesChanged) {
    // Данные не изменились, не сохраняем
    return;
  }

  isSaving.value = true;
  loading.value = true;

  try {
    // Создаем копию объекта для передачи в API
    const inputData = {
      issue_hash: setCreatorsInput.value.issue_hash,
      creators_hashs: newCreators
        .map((c: IContributor) => c?.contributor_hash)
        .filter((hash): hash is string => hash !== undefined && hash !== null),
    };

    await setCreators(inputData);

    // Обновляем currentCreators после успешного сохранения
    currentCreators.value = [...newCreators];

    emit('creators-set', newCreators);
  } catch (error) {
    console.error('SetCreatorButton: setCreators error', error);
    FailAlert(error);

    // При ошибке перезагружаем создателей из issue
    if (props.issue) {
      await loadCreators(props.issue.creators_hashs || []);
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
