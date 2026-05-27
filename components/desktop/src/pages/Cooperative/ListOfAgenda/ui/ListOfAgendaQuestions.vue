<template lang="pug">
.agenda-page
  QuestionsTable(
    :decisions='decisions',
    :loading='loading',
    :isChairman='session.isChairman',
    :format-decision-title='formatDecisionTitle',
    :is-voted-for='isVotedFor',
    :is-voted-against='isVotedAgainst',
    :is-voted-any='isVotedAny',
    :processing-decisions='processingDecisions',
    @authorize='onAuthorizeDecision',
    @vote-for='onVoteFor',
    @vote-against='onVoteAgainst'
  )
</template>

<script setup lang="ts">
import { onBeforeUnmount, computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSessionStore } from 'src/entities/Session';
import { CreateProjectButton } from 'src/features/Decision/CreateProject';
import { useDecisionProcessor } from 'src/processes/process-decisions';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { QuestionsTable } from 'src/widgets/Questions';
import { useHeaderActions } from 'src/shared/hooks';

const route = useRoute();
const session = useSessionStore();

const processingDecisions = ref<Record<number, boolean>>({});

// Инжектим кнопку создания решения в заголовок
const { registerAction } = useHeaderActions();

onMounted(() => {
  registerAction({
    id: 'create-project',
    component: CreateProjectButton,
    order: 1,
  });
});

// Получаем процесс обработки решений
const decisionProcessor = useDecisionProcessor();
const {
  loading,
  loadDecisions,
  authorizeAndExecuteDecision,
  voteForDecision,
  voteAgainstDecision,
  isVotedFor,
  isVotedAgainst,
  isVotedAny,
  formatDecisionTitle,
} = decisionProcessor;

// Пункты, по которым текущий пользователь только что совершил действие
// (проголосовал «за»/«против» или утвердил). Повестка на бэкенде такие пункты
// уже не отдаёт, но данные из блокчейна доходят с задержкой — поэтому поллинг
// (или немедленный рефетч) может на мгновение вернуть уже отработанный пункт.
// Держим его скрытым локально, чтобы убрать «исчез → вернулся → исчез».
// В пределах сессии страницы обратно не показываем — это намеренно просто.
const actedDecisionIds = ref<Set<number>>(new Set());

// Данные
const decisions = computed(() =>
  decisionProcessor.decisions.value.filter(
    (row) => !actedDecisionIds.value.has(Number(row.table?.id)),
  ),
);

// Обработчики событий
const onAuthorizeDecision = async (row) => {
  const decision_id = Number(row.table.id);
  processingDecisions.value[decision_id] = true;

  try {
    await authorizeAndExecuteDecision(row);
    // Оптимистично прячем пункт и обновляем список тихо (без скелетонов).
    actedDecisionIds.value.add(decision_id);
    SuccessAlert('Решение принято и исполнено');
    await loadDecisions(route.params.coopname as string, true);
  } catch (e) {
    FailAlert(e);
  } finally {
    // Гарантированно сбрасываем состояние загрузки
    processingDecisions.value[decision_id] = false;

    // Добавляем таймаут для гарантии обновления UI
    setTimeout(() => {
      processingDecisions.value = { ...processingDecisions.value };
    }, 100);
  }
};

const onVoteFor = async (row) => {
  const decision_id = Number(row.table.id);
  processingDecisions.value[decision_id] = true;

  try {
    await voteForDecision(row);
    // Оптимистично прячем пункт и обновляем список тихо (без скелетонов).
    actedDecisionIds.value.add(decision_id);
    SuccessAlert('Голос принят');
    await loadDecisions(route.params.coopname as string, true);
  } catch (e) {
    console.error(e)
    FailAlert(e);
  } finally {
    // Гарантированно сбрасываем состояние загрузки
    processingDecisions.value[decision_id] = false;

    // Добавляем таймаут для гарантии обновления UI
    setTimeout(() => {
      processingDecisions.value = { ...processingDecisions.value };
    }, 100);
  }
};

const onVoteAgainst = async (row) => {
  const decision_id = Number(row.table.id);
  processingDecisions.value[decision_id] = true;

  try {
    await voteAgainstDecision(row);
    // Оптимистично прячем пункт и обновляем список тихо (без скелетонов).
    actedDecisionIds.value.add(decision_id);
    SuccessAlert('Голос принят');
    await loadDecisions(route.params.coopname as string, true);
  } catch (e) {
    console.error(e)
    FailAlert(e);
  } finally {
    // Гарантированно сбрасываем состояние загрузки
    processingDecisions.value[decision_id] = false;

    // Добавляем таймаут для гарантии обновления UI
    setTimeout(() => {
      processingDecisions.value = { ...processingDecisions.value };
    }, 100);
  }
};

// Инициализация
loadDecisions(route.params.coopname as string);

// Периодическое обновление данных
const interval = setInterval(
  () => loadDecisions(route.params.coopname as string, true),
  10000,
);
onBeforeUnmount(() => clearInterval(interval));
</script>

<style lang="scss" scoped>
/* Полная ширина контента, как на canon-страницах документов/собраний. */
.agenda-page {
  padding: var(--p-6, 24px);
}
@media (max-width: 768px) {
  .agenda-page {
    padding: var(--p-4, 16px);
  }
}
</style>
