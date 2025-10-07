<template lang="pug">
q-card(flat, style='margin-left: 40px; margin-top: 8px; background-color: #f5f5f5;')
  q-card-section.q-py-sm
    .text-subtitle2.text-grey-7 Голоса участника {{ segmentUsername }}


  q-separator

  q-table(
    :rows='votes?.items || []',
    :columns='columns',
    row-key='_id',
    :loading='loading',
    flat,
    square,
    hide-header,
    no-data-label='Нет данных о голосах'
  )
    template(#body='tableProps')
      q-tr(:props='tableProps')
        q-td
          .vote-row
            .recipient-info
              .recipient-name За: {{ tableProps.row.recipient }}
            .vote-amount
              q-chip(
                color='green',
                text-color='white',
                dense
              ) {{ tableProps.row.amount }}
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useVoteStore } from 'app/extensions/capital/entities/Vote/model';
import { FailAlert } from 'src/shared/api';

interface Props {
  projectHash: string;
  coopname: string;
  segmentUsername: string;
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

