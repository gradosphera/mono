<template lang="pug">
div.relative
  ContributorSelector(
    v-model='selectedContributor'
    :project-hash='setMasterInput.project_hash'
    :coopname='setMasterInput.coopname'
    :multi-select='false'
    :dense='dense'
    :disable='disable'
    :loading='loading'
    placeholder='Выберите мастера проекта...'
    class='master-selector'
  )
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSetMaster } from '../model';
import { useContributorStore } from '../../../../entities/Contributor/model';
import { FailAlert } from 'src/shared/api/alerts';
import { ContributorSelector } from '../../../../entities/Contributor';
import type { IProject } from '../../../../entities/Project/model';
import type { IContributor } from '../../../../entities/Contributor/model';

interface Props {
  project: IProject | null;
  dense?: boolean;
  disable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  dense: false,
  disable: false,
});

const emit = defineEmits<{
  'master-set': [contributor: IContributor];
}>();

const { setMaster, setMasterInput } = useSetMaster();
const contributorStore = useContributorStore();
const loading = ref(false);
const selectedContributor = ref<IContributor | null>(null);
const currentMaster = ref<IContributor | null>(null);

// Загрузка контрибьютора-мастера по username
const loadMaster = async (masterUsername: string) => {
  if (!masterUsername) {
    currentMaster.value = null;
    selectedContributor.value = null;
    return;
  }

  try {
    // Ищем контрибьютора по username через фильтр display_name
    await contributorStore.loadContributors({
      data: {
        filter: {
          coopname: setMasterInput.value.coopname || '',
          display_name: masterUsername, // Используем display_name для поиска по username
        },
        pagination: {
          page: 1,
          limit: 10,
        },
      },
    });

    // Ищем контрибьютора с matching username
    const foundContributor = contributorStore.contributors?.items.find(
      contributor => contributor.username === masterUsername
    );

    if (foundContributor) {
      currentMaster.value = foundContributor;
      selectedContributor.value = foundContributor;
    } else {
      console.warn(`Master contributor with username ${masterUsername} not found`);
      currentMaster.value = null;
      selectedContributor.value = null;
    }
  } catch (error) {
    console.error('Error loading master contributor:', error);
    FailAlert('Не удалось загрузить информацию о мастере проекта');
    currentMaster.value = null;
    selectedContributor.value = null;
  }
};

// Обновляем входные данные при изменении проекта
watch(
  () => props.project,
  async (newProject) => {
    if (newProject) {
      setMasterInput.value.coopname = newProject.coopname || '';
      setMasterInput.value.project_hash = newProject.project_hash;
      // Загружаем контрибьютора-мастера по username
      await loadMaster(newProject.master || '');
    } else {
      // Если проекта нет, очищаем мастера
      await loadMaster('');
    }
  },
  { immediate: true },
);

// Обработчик изменения выбранного контрибьютора
watch(selectedContributor, async (newContributor, oldContributor) => {
  // Игнорируем начальную установку и очистку
  if (!newContributor || newContributor === oldContributor) return;

  if (!newContributor.username) {
    console.error('SetMasterButton: invalid contributor', newContributor);
    FailAlert('У выбранного вкладчика отсутствует имя пользователя');
    selectedContributor.value = null;
    return;
  }

  loading.value = true;

  try {
    // Устанавливаем username выбранного вкладчика как master
    setMasterInput.value.master = newContributor.username;

    await setMaster(setMasterInput.value);

    emit('master-set', newContributor);
  } catch (error) {
    console.error('SetMasterButton: setMaster error', error);
    FailAlert(error);

    // Сбрасываем выбранного вкладчика при ошибке
    selectedContributor.value = null;
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.master-selector {
  :deep(.q-field) {
    min-width: 200px;
  }
}
</style>
