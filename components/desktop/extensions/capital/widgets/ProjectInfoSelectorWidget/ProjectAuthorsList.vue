<template lang="pug">
q-card(flat)
  // Лоадер загрузки сегментов
  WindowLoader(v-if='loading', text='')

  q-table(
    :rows='segments?.items || []',
    :columns='columns',
    row-key='id',
    :pagination='{ rowsPerPage: 0 }',
    flat,
    square,
    :no-data-label='"Нет соавторов"'
  )
    template(#top)
      AddAuthorButton(
        v-if='project'
        :project='project'
        @authors-added='loadSegmentWithDelay'
      )

    template(#body='props')
      q-tr(:props='props')
        q-td
          .row.items-center.q-gutter-sm
            q-avatar(size='32px')
              q-icon(name='person', size='sm')
            span {{ props.row.display_name }}
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import type { QTableProps } from 'quasar';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert } from 'src/shared/api';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';
import { AddAuthorButton } from '../../features/Project/AddAuthor/ui';
import type { ISegmentsPagination, IGetSegmentsInput } from 'app/extensions/capital/entities/Segment/model';
import type { IProject } from '../../entities/Project/model';

const props = defineProps<{
  project?: IProject | null;
}>();

const { info } = useSystemStore();
const segmentStore = useSegmentStore();

const segments = ref<ISegmentsPagination | null>(null);
const loading = ref(false);

const loadSegmentWithDelay = async () => {
  await new Promise(resolve => setTimeout(resolve, 3000));
  await loadSegments();
};

// Загрузка сегментов-авторов
const loadSegments = async () => {
  loading.value = true;

  try {
    const filter: NonNullable<IGetSegmentsInput['filter']> = {
      coopname: info.coopname,
      is_author: true,
    };

    // Если передан проект, фильтруем по нему
    if (props.project?.project_hash) {
      filter.project_hash = props.project.project_hash;
    }

    const segmentsInput: IGetSegmentsInput = {
      filter,
      options: {
        page: 1,
        limit: 100,
        sortBy: '_created_at',
        sortOrder: 'DESC',
      },
    };

    await segmentStore.loadSegments(segmentsInput);

    segments.value = segmentStore.segments;
  } catch (error) {
    console.error('Ошибка при загрузке сегментов:', error);
    FailAlert('Не удалось загрузить список соавторов');
  } finally {
    loading.value = false;
  }
};

// Загружаем данные при монтировании
onMounted(async () => {
  await loadSegments();
});

// Определяем столбцы таблицы
const columns: QTableProps['columns'] = [
  {
    name: 'author',
    label: 'Соавтор',
    align: 'left',
    field: 'username',
    sortable: true,
  },
];
</script>

<style lang="scss" scoped>
// Стили если необходимо
</style>
