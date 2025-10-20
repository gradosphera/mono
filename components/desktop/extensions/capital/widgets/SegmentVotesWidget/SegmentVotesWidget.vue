<template lang="pug">
q-card(flat, style='margin-left: 40px;')
  q-table(
    :rows='votes?.items || []',
    :columns='columns',
    row-key='_id',
    :loading='loading',
    flat,
    square,
    hide-header,
    hide-pagination,
    :pagination='{ rowsPerPage: 0 }',
    no-data-label='Нет данных о голосах'
  )
    template(#body='tableProps')
      q-tr(:props='tableProps')
        q-td
          .vote-row
            .recipient-info
              .recipient-name {{ tableProps.row.recipient_display_name }}
            .vote-amount
              q-chip(
                color='green',
                text-color='white',
                dense
              ) {{ formatAsset2Digits(tableProps.row.amount) }}
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useVoteStore } from 'app/extensions/capital/entities/Vote/model';
import { FailAlert } from 'src/shared/api';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';

interface Props {
  projectHash: string;
  coopname: string;
  segmentUsername: string;
  segmentDisplayName: string;
  forceReload?: number;
}

const props = defineProps<Props>();

const voteStore = useVoteStore();

const loading = ref(false);
const votes = ref<any>(null);

// Колонки таблицы
const columns = [
  {
    name: 'vote',
    label: 'Голос',
    align: 'left' as const,
    field: '',
  },
];

// Загрузка голосов участника
const loadVotes = async () => {
  loading.value = true;
  console.log('on votes reload')
  try {
    await voteStore.loadVotes({
      filter: {
        project_hash: props.projectHash,
        voter: props.segmentUsername,
      },
      options: {
        page: 1,
        limit: 100,
        sortOrder: 'ASC',
      },
    });

    votes.value = voteStore.votes;
  } catch (error) {
    console.error('Ошибка при загрузке голосов:', error);
    FailAlert('Не удалось загрузить голоса участника');
  } finally {
    loading.value = false;
  }
};

// Загружаем данные при монтировании
onMounted(async () => {
  await loadVotes();
});

// Перезагружаем при изменении segmentUsername
watch(() => props.segmentUsername, async () => {
  await loadVotes();
});

// Перезагружаем при изменении forceReload (сигнал от родительского компонента)
watch(() => props.forceReload, async (newVal) => {
  if (newVal) {
    await loadVotes();
  }
});

// Экспортируем метод для принудительной перезагрузки
defineExpose({
  reloadVotes: loadVotes
});
</script>

<style lang="scss" scoped>
.vote-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 4px 0;
}

.recipient-info {
  display: flex;
  flex-direction: column;
}

.recipient-name {
  font-weight: 500;
  color: #2e7d32;
}

.vote-amount {
  display: flex;
  align-items: center;
}
</style>

