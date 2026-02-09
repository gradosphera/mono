<template lang="pug">
q-card(flat, style='margin-top: 8px;')

  // Основные группы
  .row
    // Левая колонка
    .col-md-6.col-12
      // Всего
      q-card-section
        .row.justify-center.items-center.q-mb-sm
          .col-auto.q-pr-sm
            q-icon(name='account_balance_wallet', size='md', color='primary')
          .col-auto
            .text-h6 Всего
        .q-pa-sm
          ColorCard(color='grey')
            .card-label Общая стоимость
            .card-value {{ formatAmount(segment.total_segment_cost) }}
          ColorCard(color='grey')
            .card-label Себестоимость
            .card-value {{ formatAmount(segment.total_segment_base_cost) }}
          ColorCard(
            v-if='!(segment.is_investor && !segment.is_author && !segment.is_creator && !segment.is_coordinator && !segment.is_contributor)',
            color='grey'
          )
            .card-label Прибавочная стоимость
            .card-value {{ formatAmount(segment.total_segment_bonus_cost) }}
    .col-md-6.col-12(v-if='hasLoansData(segment) || hasVotingData(segment)')
      // Займы и голосование
      q-card-section
        .row.justify-center.items-center.q-mb-sm
          .col-auto.q-pr-sm
            q-icon(name='how_to_vote', size='md', color='cyan')
          .col-auto
            .text-h6 Голосование
        .q-pa-sm
          ColorCard(v-if='hasLoansData(segment)', color='cyan')
            .card-label Займ получен
            .card-value {{ formatAmount(segment.debt_amount) }}
          ColorCard(v-if='hasLoansData(segment)', color='cyan')
            .card-label Займ возвращен
            .card-value {{ formatAmount(segment.debt_settled) }}
          ColorCard(v-if='hasVotingData(segment)', color='red')
            .card-label Прибавочная стоимость по голосованию
            .card-value {{ formatAmount(segment.voting_bonus) }}
    .col-md-6.col-12(v-if='segment.is_author')
      // Автор

      q-card-section
        .row.justify-center.items-center.q-mb-sm
          .col-auto.q-pr-sm
            q-icon(name='edit', size='md', color='purple')
          .col-auto
            .text-h6 Автор
        .q-pa-sm
          ColorCard(color='purple')
            .card-label Себестоимость
            .card-value {{ formatAmount(segment.author_base) }}
          ColorCard(color='purple')
            .card-label Прибавочная стоимость
            .card-value {{ formatAmount(segment.equal_author_bonus) }}

    // Правая колонка
    .col-md-6.col-12(v-if='segment.is_creator')
      // Исполнитель
      q-card-section
        .row.justify-center.items-center.q-mb-sm
          .col-auto.q-pr-sm
            q-icon(name='engineering', size='md', color='blue')
          .col-auto
            .text-h6 Исполнитель
        .q-pa-sm
          ColorCard(color='blue')
            .card-label Себестоимость
            .card-value {{ formatAmount(segment.creator_base) }}
          ColorCard(color='blue')
            .card-label Прибавочная стоимость
            .card-value {{ formatAmount(segment.direct_creator_bonus) }}
    .col-md-6.col-12(v-if='segment.is_investor')
      // Инвестор
      q-card-section
        .row.justify-center.items-center.q-mb-sm
          .col-auto.q-pr-sm
            q-icon(name='trending_up', size='md', color='green')
          .col-auto
            .text-h6 Инвестор
        .q-pa-sm
          ColorCard(color='green')
            .card-label Денежный взнос
            .card-value {{ formatAmount(segment.investor_base) }}
          ColorCard(color='green')
            .card-label Имущественный взнос
            .card-value {{ formatAmount(segment.property_base) }}
    .col-md-6.col-12(v-if='segment.is_coordinator')
      // Координатор
      q-card-section
        .row.justify-center.items-center.q-mb-sm
          .col-auto.q-pr-sm
            q-icon(name='groups', size='md', color='indigo')
          .col-auto
            .text-h6 Координатор
        .q-pa-sm
          ColorCard(color='indigo')
            .card-label Себестоимость
            .card-value {{ formatAmount(segment.coordinator_base) }}
          ColorCard(color='indigo')
            .card-label Прибавочная стоимость
            .card-value {{ formatAmount(segment.coordinator_investments) }}
    .col-md-6.col-12(v-if='segment.is_contributor')
      // Участник
      q-card-section
        .row.justify-center.items-center.q-mb-sm
          .col-auto.q-pr-sm
            q-icon(name='stars', size='md', color='teal')
          .col-auto
            .text-h6 Участник
        .q-pa-sm
          ColorCard(color='teal')
            .card-label Прибавочная стоимость
            .card-value {{ formatAmount(segment.contributor_bonus) }}

  // Просмотр результата интеллектуальной деятельности

  ResultPreviewCard(
    v-if='segment.username && segment.project_hash && segment.username == session.username',
    :username='segment.username',
    :project-hash='segment.project_hash'
  )



</template>

<script lang="ts" setup>
import { ColorCard } from 'src/shared/ui/ColorCard/ui';
import { useSystemStore } from 'src/entities/System/model';
import { formatAsset2Digits } from 'src/shared/lib/utils';
import { ResultPreviewCard } from '../../features/Result/PreviewResult/ui';
import { useSessionStore } from 'src/entities/Session/model';
interface Props {
  segment: any;
}

defineProps<Props>();

const { info } = useSystemStore();
const session = useSessionStore();
// Форматирование суммы с двумя знаками после запятой
const formatAmount = (amount: string | number) => {
  const value = parseFloat(amount?.toString() || '0');
  return formatAsset2Digits(`${value} ${info.symbols.root_govern_symbol}`);
};

// Проверка наличия займов
const hasLoansData = (segment: any) => {
  return parseFloat(segment.debt_amount || '0') > 0 || parseFloat(segment.debt_settled || '0') > 0;
};

// Проверка наличия данных голосования
const hasVotingData = (segment: any) => {
  return segment.has_vote && parseFloat(segment.voting_bonus || '0') > 0;
};
</script>

<style lang="scss" scoped>
// Ограничиваем ширину виджета и всех дочерних элементов
q-card {
  max-width: 100%;
  overflow: hidden;
}

// Убеждаемся, что все вложенные элементы не выходят за пределы
:deep(*) {
  max-width: 100%;
  box-sizing: border-box;
}
</style>
