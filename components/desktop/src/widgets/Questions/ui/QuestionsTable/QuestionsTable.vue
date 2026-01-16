<template lang="pug">
.scroll-area(style='height: calc(100% - $toolbar-min-height); overflow-y: auto')
  q-table.full-width(
    ref='tableRef',
    flat,
    :grid='isMobile',
    :rows='decisions',
    :columns='columns',
    :table-colspan='9',
    row-key='table.id',
    :pagination='pagination',
    virtual-scroll,
    :virtual-scroll-item-size='48',
    :rows-per-page-options='[10]',
    :loading='loading',
    :no-data-label='"У совета нет вопросов на повестке для голосования. Вопросы на повестку добавляются автоматически при участии пайщиков в цифровых целевых потребительских программах кооператива. Также, вопрос на повестку можно добавить вручную, нажав на кнопку `ПРЕДЛОЖИТЬ ПОВЕСТКУ`."',
    :virtual-scroll-target='".scroll-area"'
  )
    template(#top, v-if='$slots.top')
      slot(name='top')

    template(#item='props')
      QuestionCard(
        :agenda='props.row',
        :expanded='expanded.get(props.row.table.id)',
        :is-processing='isProcessing(props.row.table.id)',
        :is-voted-for='isVotedFor',
        :is-voted-against='isVotedAgainst',
        :is-voted-any='isVotedAny',
        @toggle-expand='toggleExpand(props.row.table.id)',
        @authorize='onAuthorizeDecision(props.row)',
        @vote-for='onVoteFor(props.row)',
        @vote-against='onVoteAgainst(props.row)'
      )

    template(#header='props')
      q-tr(:props='props')
        q-th(auto-width)
        q-th(v-for='col in props.cols', :key='col.name', :props='props') {{ col.label }}

    template(#body='props')
      q-tr(:key='`m_${props.row.table.id}`', :props='props')
        q-td(auto-width)
          ExpandToggleButton(
            :expanded='expanded.get(props.row.table.id)',
            @click='toggleExpand(props.row.table.id)'
          )

        q-td {{ props.row.table.id }}
        q-td {{ getShortNameFromCertificate(props.row.table.username_certificate) || props.row.table.username }}
        q-td(
          style='max-width: 200px; word-wrap: break-word; white-space: normal'
        ) {{ getDecisionTitle(props.row) }}

        q-td {{ formatToFromNow(props.row.table.expired_at) }}
        q-td
          VotingButtons(
            :decision='props.row.table',
            :is-voted-for='isVotedFor',
            :is-voted-against='isVotedAgainst',
            :is-voted-any='isVotedAny',
            @vote-for='onVoteFor(props.row)',
            @vote-against='onVoteAgainst(props.row)'
          )
        q-td
          div
            q-btn(
              size='sm',
              color='teal',
              push,
              v-if='isChairman',
              :disable='!props.row.table.approved',
              :loading='isProcessing(props.row.table.id)',
              @click='onAuthorizeDecision(props.row)'
            ) утвердить
            q-tooltip(v-if='!props.row.table.approved') Для утверждения решения необходимо, чтобы оно было принято советом

      q-tr.q-virtual-scroll--with-prev(
        no-hover,
        v-if='expanded.get(props.row.table.id)',
        :key='`e_${props.row.table.id}`',
        :props='props'
      )
        q-td(colspan='100%')
          ComplexDocument(:documents='props.row.documents')
          // Компонент дополнительной информации для решения
          component(
            v-if='getDecisionInfoComponent(props.row)',
            :is='getDecisionInfoComponent(props.row)',
            :agenda='props.row'
          )
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ComplexDocument } from 'src/shared/ui/ComplexDocument';
import { Cooperative } from 'cooptypes';
import { formatToFromNow } from 'src/shared/lib/utils/dates/formatToFromNow';
import { QuestionCard } from '../QuestionCard';
import { VotingButtons } from '../VotingButtons';
import { useWindowSize } from 'src/shared/hooks';
import type { IAgenda } from 'src/entities/Agenda/model';
import { getShortNameFromCertificate } from 'src/shared/lib/utils/getNameFromCertificate';
import { decisionFactory } from 'src/shared/lib/decision-factory';
import { ExpandToggleButton } from 'src/shared/ui/ExpandToggleButton';

const props = defineProps({
  decisions: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  isChairman: {
    type: Boolean,
    default: false,
  },
  formatDecisionTitle: {
    type: Function,
    required: true,
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
  processingDecisions: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['authorize', 'vote-for', 'vote-against']);

const { isMobile } = useWindowSize();

// Получение заголовка для решения с поддержкой агрегатов документов
function getDecisionTitle(row: IAgenda) {
  // Используем только агрегаты документа
  const meta = row.documents?.statement?.documentAggregate?.rawDocument
    ?.meta as any;
  const title = meta?.title;

  if (title) {
    const actor_certificate =
      row.documents?.statement?.action?.actor_certificate;
    return props.formatDecisionTitle(title, actor_certificate);
  }

  // Поддержка старого формата с meta в таблице (строкой или объектом)
  const tableMeta = row.table?.statement?.meta;
  if (tableMeta && typeof tableMeta === 'object' && (tableMeta as any).title) {
    return props.formatDecisionTitle((tableMeta as any).title, undefined);
  }

  if (tableMeta && typeof tableMeta === 'string') {
    try {
      const parsed = JSON.parse(tableMeta);
      if (parsed?.title) {
        return props.formatDecisionTitle(parsed.title, undefined);
      }
    } catch (e) {
      // ignore parse errors
    }
  }

  // Запасной вариант
  return 'Вопрос на голосование';
}

// Получение компонента дополнительной информации для решения
function getDecisionInfoComponent(row: IAgenda) {
  if (!row.table?.type) return null;
  return decisionFactory.getInfoComponent(row.table.type);
}

// Настройка таблицы
const columns = [
  {
    name: 'id',
    align: 'left',
    label: '№',
    field: (row) => row.table.id,
    sortable: true,
  },
  {
    name: 'username',
    align: 'left',
    label: 'Заявитель',
    field: (row) => row.table.username,
    sortable: true,
  },
  {
    name: 'caption',
    align: 'left',
    label: 'Пункт',
    field: (row) => getDecisionTitle(row),
    sortable: true,
  },
  {
    name: 'expired_at',
    align: 'left',
    label: 'Истекает',
    field: (row) => row.table.expired_at,
    format: (val) => formatToFromNow(val),
    sortable: false,
  },
  {
    name: 'approved',
    align: 'left',
    label: 'Голосование',
    field: (row) => row.table.approved,
    sortable: true,
  },
  {
    name: 'authorized',
    align: 'left',
    label: '',
    field: (row) => row.table.authorized,
    sortable: true,
  },
] as any;

// Состояние UI
const expanded = reactive(new Map()); // Map для отслеживания состояния развертывания каждой записи
const tableRef = ref(null);
const pagination = ref({ rowsPerPage: 10 });

// UI методы
const toggleExpand = (id: any) => {
  expanded.set(id, !expanded.get(id));
};

const isProcessing = (decisionId: number) => {
  // Используем только processingDecisions из props
  return Boolean(props.processingDecisions[decisionId]);
};

// Обработчики событий
const onAuthorizeDecision = (row: Cooperative.Document.IComplexAgenda) => {
  emit('authorize', row);
};

const onVoteFor = (row: Cooperative.Document.IComplexAgenda) => {
  emit('vote-for', row);
};

const onVoteAgainst = (row: Cooperative.Document.IComplexAgenda) => {
  emit('vote-against', row);
};
</script>
