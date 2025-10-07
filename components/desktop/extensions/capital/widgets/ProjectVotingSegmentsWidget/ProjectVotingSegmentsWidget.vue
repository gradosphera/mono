<template lang="pug">
q-card(flat, style='margin-left: 20px; margin-top: 8px;')
  // Информация о голосовании
  q-card-section(v-if='project')
    .voting-header
      .voting-info-row
        .voting-label Голосующая сумма для распределения:
        .voting-value {{ project.voting?.amounts?.active_voting_amount || '0' }}
      .voting-info-row
        .voting-label Распределено:
        .voting-value(:class='{"text-negative": totalDistributed > maxVotingAmount}') {{ formatAmount(totalDistributed) }}
      .voting-info-row
        .voting-label Осталось:
        .voting-value(:class='{"text-positive": remaining > 0, "text-grey": remaining === 0, "text-negative": remaining < 0}') {{ formatAmount(remaining) }}

  q-separator

  // Таблица вкладчиков
  q-table(
    :rows='segments?.items || []',
    :columns='columns',
    row-key='username',
    :loading='loading',
    flat,
    square,
    hide-header,
    :no-data-label='hasVoted ? "Вы уже проголосовали" : "Нет участников голосования"'
  )
    template(#body='tableProps')
      q-tr(
        :props='tableProps',
        @click='handleSegmentClick(tableProps.row.username)'
        style='cursor: pointer'
      )
        q-td(style='width: 55px')
          q-btn(
            size='sm',
            color='primary',
            dense,
            round,
            :icon='expanded[tableProps.row.username] ? "expand_more" : "chevron_right"',
            @click.stop='handleToggleExpand(tableProps.row.username)'
          )
        q-td
          .participant-info
            .participant-name {{ tableProps.row.username }}
            .participant-roles
              q-chip(
                v-if='tableProps.row.is_author',
                size='xs',
                color='purple',
                text-color='white',
                dense
              ) Автор
              q-chip(
                v-if='tableProps.row.is_creator',
                size='xs',
                color='blue',
                text-color='white',
                dense
              ) Создатель
        q-td.text-right(style='width: 200px')
          q-input(
            v-if='!hasVoted && !isCurrentUser(tableProps.row.username)',
            v-model.number='voteAmounts[tableProps.row.username]',
            type='number',
            dense,
            outlined,
            :min='0',
            :max='maxVotingAmount',
            @click.stop,
            suffix='руб.',
            :disable='hasVoted'
          )
          span(v-else-if='isCurrentUser(tableProps.row.username)') —

      // Слот для дополнительного контента (голоса вкладчика)
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='expanded[tableProps.row.username]',
        :key='`e_${tableProps.row.username}`'
      )
        q-td(colspan='100%', style='padding: 0px !important')
          slot(name='segment-content', :segment='tableProps.row')

  // Кнопка отправки голосов
  q-card-section(v-if='!hasVoted')
    .row.justify-end
      SubmitVoteButton(
        :coopname='coopname',
        :project-hash='projectHash',
        :voter='currentUsername',
        :votes='preparedVotes',
        :disabled='!isValidVoting',
        @vote-submitted='handleVoteSubmitted'
      )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { useSegmentStore } from 'app/extensions/capital/entities/Segment/model';
import { SubmitVoteButton } from 'app/extensions/capital/features/Vote/SubmitVote';
import type { IProject } from 'app/extensions/capital/entities/Project/model';
import { FailAlert } from 'src/shared/api';

interface Props {
  projectHash: string;
  coopname: string;
  expanded: Record<string, boolean>;
  project?: IProject;
  currentUsername: string;
}

interface Emits {
  (e: 'toggle-expand', value: string): void;
  (e: 'segment-click', value: string): void;
  (e: 'data-loaded', value: string[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { info } = useSystemStore();
const segmentStore = useSegmentStore();

const loading = ref(false);
const segments = computed(() => segmentStore.segments);
const voteAmounts = ref<Record<string, number>>({});
const hasVoted = ref(false);

// Колонки таблицы
const columns = [
  {
    name: 'expand',
    label: '',
    align: 'left' as const,
    field: '',
  },
  {
    name: 'participant',
    label: 'Участник',
    align: 'left' as const,
    field: 'username',
  },
  {
    name: 'vote_amount',
    label: 'Сумма голоса',
    align: 'right' as const,
    field: '',
  },
];

// Парсим голосующую сумму
const maxVotingAmount = computed(() => {
  if (!props.project?.voting?.amounts?.active_voting_amount) return 0;
  const amount = props.project.voting.amounts.active_voting_amount;
  return parseFloat(amount.split(' ')[0]);
});

// Общая распределенная сумма
const totalDistributed = computed(() => {
  return Object.values(voteAmounts.value).reduce((sum, amount) => sum + (amount || 0), 0);
});

// Остаток
const remaining = computed(() => {
  return maxVotingAmount.value - totalDistributed.value;
});

// Проверка корректности голосования
const isValidVoting = computed(() => {
  if (hasVoted.value) return false;
  
  const votes = Object.entries(voteAmounts.value).filter(([, amount]) => amount > 0);
  
  // Должны быть голоса за всех участников кроме себя
  const expectedVotes = (segments.value?.items.length || 0) - 1; // минус текущий пользователь
  if (votes.length !== expectedVotes) return false;
  
  // Сумма должна быть равна голосующей сумме
  if (totalDistributed.value !== maxVotingAmount.value) return false;
  
  return true;
});

// Подготовленные голоса для отправки
const preparedVotes = computed(() => {
  return Object.entries(voteAmounts.value)
    .filter(([, amount]) => amount > 0)
    .map(([username, amount]) => ({
      recipient: username,
      amount: `${amount.toFixed(info.symbols.root_govern_precision)} ${info.symbols.root_govern_symbol}`,
    }));
});

// Проверка, является ли пользователь текущим
const isCurrentUser = (username: string) => {
  return username === props.currentUsername;
};

// Загрузка сегментов с фильтром has_vote
const loadSegments = async () => {
  loading.value = true;

  try {
    await segmentStore.loadSegments({
      filter: {
        coopname: props.coopname,
        project_hash: props.projectHash,
        has_vote: true,
      },
      options: {
        page: 1,
        limit: 1000,
        sortOrder: 'ASC',
      },
    });

    // Инициализируем поля для голосования
    segments.value?.items.forEach((segment: any) => {
      if (!isCurrentUser(segment.username)) {
        voteAmounts.value[segment.username] = 0;
      }
    });

    // Эмитим загруженные username для очистки expanded состояния
    const usernames = segments.value?.items.map((s: any) => s.username) || [];
    emit('data-loaded', usernames);
  } catch (error) {
    console.error('Ошибка при загрузке сегментов:', error);
    FailAlert('Не удалось загрузить участников голосования');
  } finally {
    loading.value = false;
  }
};

const handleSegmentClick = (username: string) => {
  emit('segment-click', username);
};

const handleToggleExpand = (username: string) => {
  emit('toggle-expand', username);
};

const handleVoteSubmitted = () => {
  hasVoted.value = true;
  // Очищаем поля ввода
  Object.keys(voteAmounts.value).forEach(key => {
    voteAmounts.value[key] = 0;
  });
};

const formatAmount = (amount: number) => {
  return amount.toFixed(4);
};

// Загружаем данные при монтировании
onMounted(async () => {
  await loadSegments();
});

// Перезагружаем при изменении projectHash
watch(() => props.projectHash, async () => {
  await loadSegments();
});
</script>

<style lang="scss" scoped>
.voting-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
}

.voting-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voting-label {
  font-weight: 500;
  color: #666;
}

.voting-value {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1976d2;
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.participant-name {
  font-weight: 500;
  color: #1976d2;
}

.participant-roles {
  display: flex;
  gap: 4px;
}
</style>

