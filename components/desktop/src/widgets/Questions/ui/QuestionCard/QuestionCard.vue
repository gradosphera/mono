<template lang="pug">
.question-card
  .question-card__head
    .question-card__icon
      q-icon(name='how_to_vote', size='20px')

    .question-card__main
      .question-card__title {{ getDocumentTitle() }}
      .question-card__applicant {{ getApplicantName() }}

    .question-card__aside
      span.question-card__expires {{ formatToFromNow(agenda.table.expired_at) }}
      span.status-chip(:class='statusChipClass') {{ statusText }}

  //- Управление голосованием — на верхнем уровне, голосовать можно
  //- без раскрытия. Раскрытие нужно только для просмотра документа.
  .question-card__vote
    VotingButtons(
      :decision='agenda.table',
      :is-voted-for='isVotedFor',
      :is-voted-against='isVotedAgainst',
      :is-voted-any='isVotedAny',
      @vote-for='$emit("vote-for")',
      @vote-against='$emit("vote-against")'
    )
    template(v-if='isChairman')
      BaseButton(
        variant='primary',
        size='sm',
        :disabled='!agenda.table.approved',
        :loading='isProcessing',
        @click='$emit("authorize")'
      ) Утвердить
      .question-card__hint(v-if='!agenda.table.approved')
        | Для утверждения решение должно быть принято советом

  //- Явный переключатель документа — раскрывает только содержимое документа.
  button.question-card__doc-toggle(type='button', @click='toggleExpand')
    q-icon(name='description', size='16px')
    span Документ
    q-icon.question-card__doc-chevron(
      :name='expanded ? "expand_less" : "expand_more"',
      size='18px'
    )

  q-slide-transition
    .question-card__doc(v-show='expanded')
      ComplexDocument(:documents='agenda.documents')

      component(
        v-if='infoComponent',
        :is='infoComponent',
        :agenda='agenda'
      )
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ComplexDocument } from 'src/shared/ui/ComplexDocument';
import { formatToFromNow } from 'src/shared/lib/utils/dates/formatToFromNow';
import { getShortNameFromCertificate } from 'src/shared/lib/utils/getNameFromCertificate';
import { VotingButtons } from '../VotingButtons';
import { useSessionStore } from 'src/entities/Session';
import type { IAgenda } from 'src/entities/Agenda/model';
import { Cooperative } from 'cooptypes';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { decisionFactory } from 'src/shared/lib/decision-factory';

const props = defineProps({
  agenda: {
    type: Object as () => IAgenda,
    required: true,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
  isVotedFor: {
    type: Function,
    required: true,
  },
  isVotedAgainst: {
    type: Function,
    required: true,
  },
  isVotedAny: {
    type: Function,
    required: true,
  },
});

defineEmits(['authorize', 'vote-for', 'vote-against']);

const session = useSessionStore();
const isChairman = computed(() => session.isChairman);

// Состояние раскрытия — локальное для каждой карточки.
const expanded = ref(false);
const toggleExpand = () => {
  expanded.value = !expanded.value;
};

// Компонент дополнительной информации для конкретного типа решения.
const infoComponent = computed(() => {
  const type = props.agenda.table?.type;
  if (!type) return null;
  return decisionFactory.getInfoComponent(type);
});

// Получение заголовка документа с поддержкой агрегатов
function getDocumentTitle() {
  const agenda = props.agenda;
  const statement = agenda.documents?.statement;
  const rawDocument = statement?.documentAggregate?.rawDocument;
  const meta = rawDocument?.meta as
    | Cooperative.Document.IMetaDocument
    | undefined;
  if (meta?.title) {
    return meta.title;
  }

  const tableMeta = agenda.table?.statement?.meta;
  if (tableMeta && typeof tableMeta === 'object' && (tableMeta as any).title) {
    return (tableMeta as any).title;
  }

  if (tableMeta && typeof tableMeta === 'string') {
    try {
      const parsed = JSON.parse(tableMeta);
      if (parsed?.title) {
        return parsed.title;
      }
    } catch {
      // ignore parse errors
    }
  }

  return 'Вопрос без заголовка';
}

// Получение имени заявителя
const getApplicantName = () => {
  const certificate = props.agenda.table.username_certificate;
  if (certificate) {
    return getShortNameFromCertificate(certificate);
  }
  return `Аккаунт: ${props.agenda.table.username}`;
};

// Статус голосования текущего пайщика
const statusText = computed(() => {
  try {
    if (props.isVotedAny(props.agenda.table)) {
      if (props.isVotedFor(props.agenda.table)) return 'Вы за';
      if (props.isVotedAgainst(props.agenda.table)) return 'Вы против';
    }
  } catch (error) {
    console.warn('Ошибка при проверке статуса голосования:', error);
  }
  return 'Не голосовали';
});

const statusChipClass = computed(() => {
  try {
    if (props.isVotedAny(props.agenda.table)) {
      if (props.isVotedFor(props.agenda.table)) return 'status-chip--pos';
      if (props.isVotedAgainst(props.agenda.table)) return 'status-chip--neg';
    }
  } catch {
    // ignore
  }
  return 'status-chip--neutral';
});
</script>

<style lang="scss" scoped>
.question-card {
  background: var(--p-surface);
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-lg, 16px);
  overflow: hidden;
  transition: border-color var(--p-dur-fast, 120ms) var(--p-ease-standard);
}
.question-card:hover {
  border-color: var(--p-line-2, var(--p-line));
}

.question-card__head {
  display: flex;
  align-items: flex-start;
  gap: var(--p-3, 12px);
  padding: var(--p-4, 16px);
  padding-bottom: var(--p-3, 12px);
}

.question-card__icon {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--p-r-sm, 8px);
  background: var(--p-primary-soft);
  color: var(--p-primary);
}

.question-card__main {
  flex: 1 1 auto;
  min-width: 0;
}
.question-card__title {
  font-size: var(--p-fs-h3, 15px);
  font-weight: 600;
  line-height: 1.4;
  color: var(--p-ink);
  overflow-wrap: anywhere;
}
.question-card__applicant {
  margin-top: 2px;
  font-size: var(--p-fs-meta, 12px);
  color: var(--p-ink-2);
}

.question-card__aside {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--p-1, 4px);
  flex: 0 0 auto;
  text-align: right;
}
.question-card__expires {
  font-size: var(--p-fs-meta, 12px);
  color: var(--p-ink-3);
  white-space: nowrap;
}

/* Чип статуса голосования — токены вместо q-badge */
.status-chip {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: var(--p-fs-eyebrow, 11px);
  font-weight: 600;
  white-space: nowrap;
}
.status-chip--pos {
  background: var(--p-pos-soft);
  color: var(--p-pos);
}
.status-chip--neg {
  background: var(--p-neg-soft);
  color: var(--p-neg);
}
.status-chip--neutral {
  background: var(--p-surface-2);
  color: var(--p-ink-2);
}

/* Голосование — на верхнем уровне карточки, без раскрытия */
.question-card__vote {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--p-3, 12px);
  padding: 0 var(--p-4, 16px) var(--p-4, 16px);
}
.question-card__hint {
  font-size: var(--p-fs-meta, 12px);
  line-height: 1.4;
  text-align: center;
  color: var(--p-ink-3);
  max-width: 320px;
}

/* Переключатель документа — раскрывает только содержимое документа */
.question-card__doc-toggle {
  display: flex;
  align-items: center;
  gap: var(--p-2, 8px);
  width: 100%;
  padding: var(--p-3, 12px) var(--p-4, 16px);
  border: none;
  border-top: 1px solid var(--p-line);
  background: transparent;
  color: var(--p-ink-2);
  font: inherit;
  font-size: var(--p-fs-body-sm, 13px);
  cursor: pointer;
  transition: color var(--p-dur-fast, 120ms) var(--p-ease-standard),
    background-color var(--p-dur-fast, 120ms) var(--p-ease-standard);
}
.question-card__doc-toggle:hover {
  background: var(--p-surface-2);
  color: var(--p-ink);
}
.question-card__doc-chevron {
  margin-left: auto;
}
.question-card__doc {
  padding: var(--p-4, 16px);
  border-top: 1px solid var(--p-line);
}

@media (max-width: 599px) {
  .question-card__head {
    flex-wrap: wrap;
  }
  .question-card__aside {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
