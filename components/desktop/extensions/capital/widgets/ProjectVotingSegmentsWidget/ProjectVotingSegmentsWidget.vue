<template lang="pug">
q-card(flat, style='margin-left: 20px; margin-top: 8px;')
  // Информация о голосовании
  q-card-section(v-if='project')
    .voting-header
      // Первая строка: общая сумма, голосующая сумма и статус посередине
      .row.justify-center
        .col-md-4.col-12.q-pa-sm
          ColorCard(color='blue')
            .card-label Общая сумма на распределении
            .card-value {{ project.voting?.amounts?.total_voting_pool || '0' }}

        // До завершения голосования - только для участников
        template(v-if='!isVotingCompleted')
          .col-md-4.col-12.q-pa-sm
            ColorCard(color='purple')
              .card-label Голосующая сумма
              .card-value {{ project.voting?.amounts?.active_voting_amount || '0' }}

        .col-md-4.col-12.q-pa-sm
          ColorCard(:color='isVotingCompleted ? "green" : "orange"')
            .card-label Статус голосования
            .card-value {{ votingStatusText }}

      // Вторая строка: распределено и осталось - только для участников до завершения
      .row(v-if='!isVotingCompleted && isVotingParticipant').justify-center
        .col-md-4.col-xs-12.q-pa-sm
          ColorCard(color='red')
            .card-label Осталось
            .card-value(:class='{"text-positive": remaining > 0, "text-grey": remaining === 0, "text-negative": remaining < 0}') {{ formatAmount(remaining) }}

        .col-md-4.col-xs-12.q-pa-sm
          ColorCard(color='green')
            .card-label Распределено
            .card-value(:class='{"text-negative": totalDistributed > maxVotingAmount}') {{ formatAmount(totalDistributed) }}


  p.text-h6.text-grey.full-width.text-center Участники
  q-separator

  // Сообщение для не участников голосования до завершения
  q-card-section(v-if='!isVotingCompleted && !isVotingParticipant')
    .text-center.text-grey-6
      q-icon(name='info', size='md', color='grey-7')
      .q-mt-sm В голосовании принимают участие только авторы и создатели проекта

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
        @click='isVotingCompleted ? handleSegmentClick(tableProps.row.username) : null'
        :style='isVotingCompleted ? "cursor: pointer" : ""'
      )

        q-td(style='width: 55px')
          q-btn(
            size='sm',
            color='primary',
            dense,
            round,
            :icon='expanded[tableProps.row.username] ? "expand_more" : "chevron_right"',
            :disable='!isVotingCompleted',
            @click.stop='handleToggleExpand(tableProps.row.username)'
          )
            q-tooltip(v-if='!isVotingCompleted') Результаты голосования каждого участника станут доступны после завершения голосования
        q-td
          .participant-info
            .participant-name {{ tableProps.row.display_name }}
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

        q-td.text-right(style='width: 250px')
          // До завершения голосования - инпуты для участников
          template(v-if='!isVotingCompleted')
            q-input(
              v-if='!hasVoted && !isCurrentUser(tableProps.row.username) && isVotingParticipant',
              v-model.number='voteAmounts[tableProps.row.username]',
              type='number',
              dense,
              outlined,
              :min='0',
              :max='maxVotingAmount',
              @click.stop,
              :disable='hasVoted'
            )
            span.text-grey-7(v-else-if='isCurrentUser(tableProps.row.username)') нельзя голосовать за себя


          // После завершения - результаты для всех
          template(v-else)
            .voting-result
              template(v-if='tableProps.row.is_votes_calculated === false')
                CalculateVotesButton(
                  :coopname='coopname',
                  :project-hash='projectHash',
                  :username='tableProps.row.username'
                )
              template(v-else)
                q-chip(
                  color='green',
                  text-color='white',
                  dense
                ) {{ tableProps.row.voting_bonus || '0.0000 RUB' }}
                .result-label Результат голосования

      // Слот для дополнительного контента (голоса вкладчика) - только после завершения
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='isVotingCompleted && expanded[tableProps.row.username]',
        :key='`e_${tableProps.row.username}`'
      )
        q-td(colspan='100%', style='padding: 0px !important')
          slot(name='segment-content', :segment='tableProps.row', :segments-to-reload='segmentsToReload')

  // Кнопка отправки голосов - ТОЛЬКО для участников голосования, до завершения и если не голосовали
  q-card-section(v-if='isVotingParticipant && !isVotingCompleted && !hasVoted')
    .row.justify-end
      SubmitVoteButton(
        :coopname='coopname',
        :project-hash='projectHash',
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
import { CalculateVotesButton } from 'app/extensions/capital/features/Vote/CalculateVotes/ui';
import type { IProject } from 'app/extensions/capital/entities/Project/model';
import { FailAlert } from 'src/shared/api';
import { Zeus } from '@coopenomics/sdk';
import { ColorCard } from 'src/shared/ui/ColorCard/ui';

interface Props {
  projectHash: string;
  coopname: string;
  expanded: Record<string, boolean>;
  project?: IProject;
  currentUsername: string;
  segmentsToReload: Record<string, number>;
}

interface Emits {
  (e: 'toggle-expand', value: string): void;
  (e: 'segment-click', value: string): void;
  (e: 'data-loaded', value: string[]): void;
  (e: 'votes-changed', value: { projectHash: string; voter: string }): void;
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

// Проверка, является ли текущий пользователь участником голосования
const isVotingParticipant = computed(() => {
  return segments.value?.items.some(segment => segment.username === props.currentUsername) || false;
});

// Проверка, завершено ли голосование
const isVotingCompleted = computed(() => {
  if (!props.project) return false;

  // Голосование завершено если:
  // 1. Статус проекта - completed
  // 2. Все участники проголосовали (votes_received === total_voters)
  const status = String(props.project.status);
  const voting = props.project.voting;

  if (status === Zeus.ProjectStatus.COMPLETED || status === 'COMPLETED') return true;
  if (voting && voting.votes_received === voting.total_voters) return true;

  return false;
});

// Текст статуса голосования
const votingStatusText = computed(() => {
  if (isVotingCompleted.value) {
    return 'Голосование завершено';
  }

  const voting = props.project?.voting;
  if (voting) {
    return `Проголосовало: ${voting.votes_received || 0} из ${voting.total_voters || 0}`;
  }

  return 'Голосование активно';
});

// Проверка корректности голосования
const isValidVoting = computed(() => {
  if (hasVoted.value || !isVotingParticipant.value) return false;

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
    console.log('segments', segments.value);
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

  // Эмитим событие о том, что голоса изменились
  emit('votes-changed', {
    projectHash: props.projectHash,
    voter: props.currentUsername
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
  padding: 16px 0;
}

.participant-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
}

.participant-name {
  font-weight: 500;
  color: #1976d2;
  font-size: 1rem;
}

.participant-roles {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.voting-result {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  .result-label {
    font-size: 0.75rem;
    color: #666;
    margin-top: 2px;
  }
}
</style>

