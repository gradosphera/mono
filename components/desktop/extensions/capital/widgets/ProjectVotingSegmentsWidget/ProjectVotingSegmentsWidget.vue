<template lang="pug">
q-card(flat, style='margin-left: 20px; margin-top: 8px;')
  // Сообщение для не участников голосования до завершения
  q-card-section(v-if='!isVotingCompleted && !isVotingParticipant')
    .text-center.text-accent
      q-icon(name='info', size='md', color='accent')
      .q-mt-sm В голосовании принимают участие только авторы и Исполнители проекта

  // Таблица участников

  q-table(
    :rows='segments?.items || []',
    :columns='columns',
    row-key='username',
    :loading='loading',
    flat,
    square,
    hide-header,
    hide-pagination
    :pagination='{ rowsPerPage: 0 }',
    :no-data-label='hasVoted ? "Вы уже проголосовали" : "Нет участников голосования"'
  )
    template(#body='tableProps')
      q-tr(
        :props='tableProps',
        @click='isVotingCompleted ? handleSegmentClick(tableProps.row.username) : null'
        :style='isVotingCompleted ? "cursor: pointer" : ""'
      )

        q-td(style='width: 55px')
          ExpandToggleButton(
            :expanded='expanded[tableProps.row.username]',
            :disable='!isResultStatus',
            @click='handleToggleExpand(tableProps.row.username)'
          )
            q-tooltip(v-if='!isResultStatus') Результаты голосования каждого участника станут доступны после завершения голосования
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
              ) Исполнитель

        q-td.text-right(style='width: 250px')
          // До завершения голосования - слайдеры для участников
          template(v-if='!isVotingCompleted')
            template(v-if='!hasVoted && !isCurrentUser(tableProps.row.username) && isVotingParticipant')
              .voting-input-container
                q-input(
                  v-model.number='voteAmounts[tableProps.row.username]',
                  type='number',
                  dense,
                  outlined,
                  :min='0',
                  :max='getSliderMax(tableProps.row.username).value',
                  @click.stop
                )
                q-slider(
                  v-model='voteAmounts[tableProps.row.username]',
                  :min='0',
                  :max='getSliderMax(tableProps.row.username).value',
                  :step='0.0001',
                  color='primary',
                  track-color='grey-3',
                  :disable='hasVoted'
                )
            template(v-else-if='hasVoted && !isCurrentUser(tableProps.row.username)')
              .text-center.text-grey-6
                q-icon(name='hourglass_empty', size='sm')
                .q-mt-xs Голосование еще идет
            span.text-grey-7(v-else-if='isCurrentUser(tableProps.row.username)') нельзя голосовать за себя


          // После завершения голосования
          template(v-else)
            template(v-if='!isResultStatus')
              .text-center.text-grey-6
                q-icon(name='hourglass_empty', size='sm')
                .q-mt-xs Голосование еще идет
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
                  ) {{ formatAsset2Digits(tableProps.row.voting_bonus || '0.0000 RUB') }}
                  .result-label Результат голосования

      // Слот для дополнительного контента (голоса участника) - только после завершения
      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='isResultStatus && expanded[tableProps.row.username]',
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
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton';

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
const segments = computed(() => segmentStore.getSegmentsByProject(props.projectHash));
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

// // Остаток
// const remaining = computed(() => {
//   return maxVotingAmount.value - totalDistributed.value;
// });

// Максимум для слайдера конкретного участника
const getSliderMax = (username: string) => {
  return computed(() => {
    const totalOtherVotes = Object.entries(voteAmounts.value)
      .filter(([u]) => u !== username)
      .reduce((sum, [, amount]) => sum + (amount || 0), 0);
    return maxVotingAmount.value - totalOtherVotes;
  });
};

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

  if (status === Zeus.ProjectStatus.RESULT || status === 'RESULT') return true;
  if (voting && voting.votes_received === voting.total_voters) return true;

  return false;
});

// Проверка, является ли статус проекта RESULT
const isResultStatus = computed(() => {
  if (!props.project) return false;
  const status = String(props.project.status);
  return status === Zeus.ProjectStatus.RESULT || status === 'RESULT';
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


// const formatAmount = (amount: number) => {
//   return amount.toFixed(4);
// };

// Загружаем данные при монтировании
onMounted(async () => {
  await loadSegments();
});

// Перезагружаем при изменении projectHash
watch(() => props.projectHash, async () => {
  await loadSegments();
});

// Watch для ограничения значений voteAmounts максимумом
watch(voteAmounts, (newAmounts) => {
  Object.keys(newAmounts).forEach(username => {
    const max = getSliderMax(username).value;
    if (newAmounts[username] > max) {
      voteAmounts.value[username] = max;
    }
    if (newAmounts[username] < 0) {
      voteAmounts.value[username] = 0;
    }
  });
}, { deep: true });

</script>

<style lang="scss" scoped>
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

.voting-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
}
</style>

