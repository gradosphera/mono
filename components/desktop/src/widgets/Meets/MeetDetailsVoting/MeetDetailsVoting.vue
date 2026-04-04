<template lang="pug">
div.meet-details-voting-root.page-main-card.card-container.q-pa-lg
  .meet-voted-banner(v-if='meet?.processing?.isVoted')
    .meet-voted-banner__icon(aria-hidden='true')
      q-icon(name='how_to_vote', color='positive', size='28px')
    .meet-voted-banner__body
      .meet-voted-banner__title Вы уже приняли участие в голосовании.

  div(v-if='!meet?.processing?.isVoted')
    .meet-vote-head.q-mb-lg
      .meet-vote-title Голосование
      .meet-vote-line(aria-hidden='true')

    .vote-question.info-card.q-mb-md(
      v-for='(item, index) in meetAgendaItems',
      :key='index'
    )
      .vote-question-layout
        .vote-question-layout__badge
          AgendaNumberAvatar(:number='index + 1')
        .vote-question-layout__content
          .text-body1.text-weight-medium.q-mb-sm {{ item.title }}
          .vote-question-context.q-mb-md(
            v-if='item.context',
            v-html='parseLinks(item.context)'
          )
          .vote-decision-block.q-mb-md
            .vote-decision-label Проект решения
            .vote-decision-text {{ item.decision }}
          q-separator.q-mb-md
          .vote-prompt.q-mb-sm Ваш голос
          .row.q-col-gutter-sm
            .col-12.col-md-4
              label.vote-option.vote-option--for
                q-radio(
                  v-model='votes[index]',
                  val='for',
                  color='positive',
                  size='md',
                  label='ЗА'
                )
            .col-12.col-md-4
              label.vote-option.vote-option--against
                q-radio(
                  v-model='votes[index]',
                  val='against',
                  color='negative',
                  size='md',
                  label='ПРОТИВ'
                )
            .col-12.col-md-4
              label.vote-option.vote-option--abstain
                q-radio(
                  v-model='votes[index]',
                  val='abstained',
                  color='grey',
                  size='md',
                  label='ВОЗДЕРЖАЛСЯ'
                )

    .text-center.q-mt-lg
      q-btn.q-px-xl(
        color='primary',
        label='ГОЛОСОВАТЬ',
        unelevated,
        no-caps,
        size='lg',
        :loading='isVoting',
        @click='submitVote',
        :disable='!allVotesSelected'
      )
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { AgendaNumberAvatar } from 'src/shared/ui/AgendaNumberAvatar';
import type { IMeet } from 'src/entities/Meet';
import { useSessionStore } from 'src/entities/Session';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSignDocument } from 'src/shared/lib/document';
import {
  useVoteOnMeet,
  type IVoteOnMeetInput,
} from 'src/features/Meet/VoteOnMeet';
import { parseLinks } from 'src/shared/lib/utils';

const props = defineProps<{
  meet: IMeet;
  coopname: string;
  meetHash: string;
}>();

const {
  votes,
  meetAgendaItems,
  allVotesSelected,
  setMeet,
  voteOnMeet,
  resetVotes,
  generateBallot,
} = useVoteOnMeet();

const sessionStore = useSessionStore();
const { signDocument } = useSignDocument();

const isVoting = ref(false);

// Устанавливаем собрание из пропсов при монтировании
onMounted(() => {
  // Устанавливаем собрание из пропсов в композабл
  setMeet(props.meet);

  // Сбрасываем голоса при открытии компонента
  resetVotes();
});

// Очищаем ссылку на собрание при размонтировании
onUnmounted(() => {
  setMeet(null);
  resetVotes();
});

const submitVote = async () => {
  if (!allVotesSelected.value) return;

  isVoting.value = true;
  try {
    const generatedBallot = await generateBallot({
      coopname: props.coopname,
      username: sessionStore.username,
      meet_hash: props.meetHash,
      answers: meetAgendaItems.value.map((question, index) => ({
        id: question.id.toString(),
        number: question.number.toString(),
        vote: votes.value[index],
      })),
    });

    const signedBallot = await signDocument(
      generatedBallot,
      sessionStore.username,
    );

    const vote: IVoteOnMeetInput = {
      coopname: props.coopname,
      hash: props.meetHash,
      ballot: signedBallot,
      username: sessionStore.username,
      votes: meetAgendaItems.value.map((item, index) => ({
        question_id: item.id,
        vote: votes.value[index],
      })),
    };

    await voteOnMeet(vote);
    SuccessAlert('Ваш голос успешно отправлен');
  } catch (error: any) {
    console.error(error);
    FailAlert(error);
  } finally {
    isVoting.value = false;
  }
};
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';

// Внешняя секция: на светлой странице --q-surface совпадает с фоном — даём явное «полотно»
.meet-details-voting-root.card-container {
  background-color: color-mix(in srgb, var(--q-primary) 6%, #ffffff);
}

.body--dark .meet-details-voting-root.card-container,
.q-dark .meet-details-voting-root.card-container {
  background-color: color-mix(
    in srgb,
    var(--q-dark-page, #1f1c1c) 92%,
    var(--q-primary) 8%
  );
}

// Уже проголосовали — в одном стиле с карточками (не q-banner по центру)
.meet-voted-banner {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 24px;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--q-positive, #21ba45) 22%, rgba(0, 0, 0, 0.07));
  border-left: 3px solid var(--q-positive, #21ba45);
  background-color: color-mix(in srgb, var(--q-positive, #21ba45) 9%, #ffffff);
}

.body--dark .meet-voted-banner,
.q-dark .meet-voted-banner {
  background-color: color-mix(
    in srgb,
    var(--q-positive, #21ba45) 14%,
    var(--q-dark-page, #1f1c1c)
  );
  border-color: color-mix(in srgb, var(--q-positive, #21ba45) 32%, rgba(255, 255, 255, 0.18));
  border-left-color: var(--q-positive, #21ba45);
}

.meet-voted-banner__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background-color: color-mix(in srgb, var(--q-positive, #21ba45) 12%, #ffffff);
}

.body--dark .meet-voted-banner__icon,
.q-dark .meet-voted-banner__icon {
  background-color: color-mix(
    in srgb,
    var(--q-positive, #21ba45) 20%,
    rgba(255, 255, 255, 0.05)
  );
}

.meet-voted-banner__body {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
  text-align: left;
}

.meet-voted-banner__title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

// Светлая: пункты повестки — та же тональность, что оболочка (не серый дефолт .info-card)
.meet-details-voting-root .vote-question.info-card {
  background-color: color-mix(in srgb, var(--q-primary) 6%, #ffffff);
  border-color: color-mix(in srgb, var(--q-primary) 18%, rgba(0, 0, 0, 0.06));
}

.body--dark .meet-details-voting-root .vote-question.info-card,
.q-dark .meet-details-voting-root .vote-question.info-card {
  background-color: color-mix(
    in srgb,
    var(--q-dark-page, #1f1c1c) 90%,
    var(--q-primary) 10%
  );
  border-color: rgba(255, 255, 255, 0.26);
}

.meet-vote-head {
  text-align: center;
}

.meet-vote-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 10px;
}

.meet-vote-line {
  height: 3px;
  width: 48px;
  margin: 0 auto;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--q-primary) 70%, transparent),
    color-mix(in srgb, var(--q-secondary) 70%, transparent)
  );
}

// Номер + текст: на мобилке — колонка, текст на всю ширину (не жмётся об аватар)
.vote-question-layout {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.vote-question-layout__badge {
  flex-shrink: 0;
  line-height: 0;
}

.vote-question-layout__content {
  flex: 1 1 0;
  min-width: 0;
}

@media (max-width: 599px) {
  .vote-question-layout {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

// Текст приложений / ссылок — без отдельной подписи
.vote-question-context {
  font-size: 14px;
  line-height: 1.5;
  font-weight: 400;
  opacity: 0.82;
  word-break: break-word;

  :deep(a) {
    word-break: break-word;
  }
}

// Проект решения — визуальный акцент
.vote-decision-block {
  border-radius: 10px;
  padding: 12px 14px;
  border-left: 3px solid var(--q-primary);
  background-color: color-mix(in srgb, var(--q-primary) 11%, #ffffff);
}

.body--dark .vote-decision-block,
.q-dark .vote-decision-block {
  background-color: color-mix(
    in srgb,
    var(--q-primary) 16%,
    var(--q-dark-page, #1f1c1c)
  );
  border-left-color: var(--q-primary);
}

.vote-decision-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--q-primary);
  margin-bottom: 6px;
  opacity: 0.95;
}

.vote-decision-text {
  font-size: 14px;
  line-height: 1.45;
  font-weight: 500;
  word-break: break-word;
}

.vote-prompt {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.65;
}

.vote-option {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  box-sizing: border-box;
  min-height: 48px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  .body--dark &,
  .q-dark & {
    border-color: rgba(255, 255, 255, 0.3);
  }
}

:deep(.vote-option .q-radio) {
  width: 100%;
  max-width: 100%;
  justify-content: flex-start;
}

// Светлая: явные пастели (color-mix с --q-surface часто даёт «невидимый» фон)
.vote-option--for {
  background-color: #e8f5e9;

  .body--dark &,
  .q-dark & {
    background: color-mix(
      in srgb,
      var(--q-positive, #21ba45) 16%,
      rgba(255, 255, 255, 0.06)
    );
  }
}

.vote-option--against {
  background-color: #ffebee;

  .body--dark &,
  .q-dark & {
    background: color-mix(
      in srgb,
      var(--q-negative, #c10015) 18%,
      rgba(255, 255, 255, 0.06)
    );
  }
}

.vote-option--abstain {
  background-color: #eceff1;

  .body--dark &,
  .q-dark & {
    background: color-mix(in srgb, var(--q-primary) 10%, rgba(255, 255, 255, 0.06));
  }
}

.vote-option:hover {
  border-color: color-mix(in srgb, var(--q-primary) 25%, rgba(0, 0, 0, 0.08));
  box-shadow: 0 1px 0 color-mix(in srgb, var(--q-primary) 12%, transparent);

  .body--dark &,
  .q-dark & {
    border-color: color-mix(in srgb, var(--q-primary) 40%, rgba(255, 255, 255, 0.38));
  }
}

.vote-option--for:hover {
  border-color: color-mix(
    in srgb,
    var(--q-positive, #21ba45) 45%,
    rgba(0, 0, 0, 0.08)
  );
  background-color: #dcedc8;
}

.body--dark .vote-option--for:hover,
.q-dark .vote-option--for:hover {
  border-color: color-mix(
    in srgb,
    var(--q-positive, #21ba45) 55%,
    rgba(255, 255, 255, 0.35)
  );
  background: color-mix(
    in srgb,
    var(--q-positive, #21ba45) 22%,
    rgba(255, 255, 255, 0.06)
  );
}

.vote-option--against:hover {
  border-color: color-mix(
    in srgb,
    var(--q-negative, #c10015) 45%,
    rgba(0, 0, 0, 0.08)
  );
  background-color: #ffcdd2;
}

.body--dark .vote-option--against:hover,
.q-dark .vote-option--against:hover {
  border-color: color-mix(
    in srgb,
    var(--q-negative, #c10015) 55%,
    rgba(255, 255, 255, 0.35)
  );
  background: color-mix(
    in srgb,
    var(--q-negative, #c10015) 24%,
    rgba(255, 255, 255, 0.06)
  );
}

.vote-option--abstain:hover {
  border-color: color-mix(in srgb, var(--q-primary) 28%, rgba(0, 0, 0, 0.08));
  background-color: #e0e0e0;
}

.body--dark .vote-option--abstain:hover,
.q-dark .vote-option--abstain:hover {
  border-color: color-mix(in srgb, var(--q-primary) 40%, rgba(255, 255, 255, 0.38));
  background: color-mix(in srgb, var(--q-primary) 14%, rgba(255, 255, 255, 0.06));
}

:deep(.vote-option .q-radio__label) {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.body--dark :deep(.vote-option .q-radio__label),
.q-dark :deep(.vote-option .q-radio__label) {
  color: rgba(255, 255, 255, 0.92);
}
</style>
