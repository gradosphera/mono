<template lang="pug">
q-card(flat, style='margin-left: 20px; margin-top: 8px;')
  q-table(
    :rows='mockVotes',
    :columns='columns',
    row-key='id',
    :loading='loading',
    flat,
    square,
    hide-header,
    no-data-label='Нет данных по голосованиям'
  )
    template(#body='tableProps')
      q-tr(
        :props='tableProps',
        @click='handleVoteClick(tableProps.row.id)'
        style='cursor: pointer'
      )
        q-td(style='width: 55px')
          q-btn(
            size='sm',
            color='primary',
            dense,
            round,
            :icon='expanded[tableProps.row.id] ? "expand_more" : "chevron_right"',
            @click.stop='handleToggleExpand(tableProps.row.id)'
          )
        q-td(
          style='cursor: pointer'
        )
          .title-container {{ tableProps.row.voter_name }}
          .subtitle За: {{ tableProps.row.recipient_name }}
        q-td.text-right
          .vote-info
            .vote-item
              q-chip(
                color='green',
                text-color='white',
                dense,
                :label='`${tableProps.row.amount} руб.`'
              )
              span.stat-label Сумма голоса

  // Заглушка - здесь будет логика голосования
  .voting-placeholder
    q-banner(
      class='text-white bg-blue',
      rounded
    )
      template(#avatar)
        q-icon(name='info')
      | Здесь будет таблица результатов голосования и возможность проголосовать
      br
      | TODO: Реализовать загрузку голосов по проекту {{ projectHash }}
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

interface Props {
  projectHash: string;
  coopname: string;
  expanded: Record<string, boolean>;
}

interface Emits {
  (e: 'toggle-expand', value: string): void;
  (e: 'vote-click', value: string): void;
  (e: 'data-loaded', value: string[]): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);

// Mock данные для демонстрации
const mockVotes = ref([
  {
    id: '1',
    voter_name: 'Иванов Иван',
    recipient_name: 'Петров Петр',
    amount: 1000,
  },
  {
    id: '2',
    voter_name: 'Сидоров Алексей',
    recipient_name: 'Кузнецова Мария',
    amount: 1500,
  },
  {
    id: '3',
    voter_name: 'Козлов Дмитрий',
    recipient_name: 'Петров Петр',
    amount: 800,
  },
]);

// Колонки таблицы
const columns = [
  {
    name: 'expand',
    label: '',
    align: 'left' as const,
    field: '',
  },
  {
    name: 'voter',
    label: 'Голосующий',
    align: 'left' as const,
    field: 'voter_name',
  },
  {
    name: 'amount',
    label: 'Голос',
    align: 'right' as const,
    field: 'amount',
  },
];

const handleVoteClick = (voteId: string) => {
  emit('vote-click', voteId);
};

const handleToggleExpand = (voteId: string) => {
  emit('toggle-expand', voteId);
};

// Имитация загрузки данных
onMounted(async () => {
  loading.value = true;

  // Имитация загрузки данных
  setTimeout(() => {
    loading.value = false;

    // Эмитим загруженные ID голосов
    const voteIds = mockVotes.value.map(v => v.id);
    emit('data-loaded', voteIds);
  }, 1000);
});
</script>

<style lang="scss" scoped>
.title-container {
  font-weight: 500;
  color: #2e7d32;
}

.subtitle {
  font-size: 0.875rem;
  color: #666;
  margin-top: 2px;
}

.vote-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.vote-item {
  display: flex;
  align-items: center;
  gap: 8px;

  .stat-label {
    font-size: 0.75rem;
    color: #666;
  }
}

.voting-placeholder {
  margin-top: 16px;
}

.q-banner {
  margin: 0;
}
</style>
