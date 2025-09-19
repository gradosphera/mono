<template lang="pug">
div
  q-card(flat)
    // Заголовок страницы
    //- .q-pa-md
    //-   h5.q-my-none Вкладчики кооператива

    // Таблица вкладчиков
    ContributorsWidget(
      :contributors='contributorStore.contributors?.items || []',
      :loading='loading',
      :pagination='pagination',
      @request='onRequest'
    )

    // Пагинация
    q-card-actions(align='center')
      q-pagination(
        v-model='pagination.page',
        :max='Math.ceil((contributorStore.contributors?.totalCount || 0) / pagination.rowsPerPage)',
        :max-pages='5',
        direction-links,
        boundary-links,
        @update:model-value='onPageChange'
      )
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { ContributorsWidget } from 'app/extensions/capital/widgets/ContributorsWidget';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';

const contributorStore = useContributorStore();
const { info } = useSystemStore();

const loading = ref(false);

// Пагинация
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
});

// Загрузка вкладчиков
const loadContributors = async () => {
  loading.value = true;
  try {
    await contributorStore.loadContributors({
      filter: {
        coopname: info.coopname,
      },
      pagination: {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
      },
    });
  } catch (error) {
    console.error('Ошибка при загрузке вкладчиков:', error);
    FailAlert('Не удалось загрузить список вкладчиков');
  } finally {
    loading.value = false;
  }
};

// Обработчик запросов пагинации и сортировки
const onRequest = async (props: { pagination: any }) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;

  await loadContributors();
};

// Обработчик изменения страницы пагинации
const onPageChange = async (page: number) => {
  pagination.value.page = page;
  await loadContributors();
};

// Инициализация
onMounted(async () => {
  await loadContributors();
});
</script>

<style lang="scss" scoped>
.q-card {
  min-height: 400px;
}

h5 {
  font-weight: 600;
  color: #1976d2;
}
</style>
