<template lang="pug">
q-card(flat, style='margin-left: 40px; margin-top: 8px;')
  q-card-section.q-py-sm
    .text-subtitle1.text-grey-7 Детальная информация по сегменту {{ segment.display_name }}

  q-separator

  // Основная информация о сегменте
  q-card-section
    .row.justify-center
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='blue')
          .card-label Общая сумма
          .card-value {{ formatAmount(segment.total_segment_cost) }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='orange')
          .card-label Базовая стоимость
          .card-value {{ formatAmount(segment.total_segment_base_cost) }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='green')
          .card-label Бонусная стоимость
          .card-value {{ formatAmount(segment.total_segment_bonus_cost) }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='indigo')
          .card-label Статус
          .card-value {{ getSegmentStatusLabel(segment.status) }}

  // Инвестиции и вклады
  q-card-section(v-if='hasInvestments(segment)')
    .row.justify-center
      .col-md-4.col-12.q-pa-sm
        ColorCard(color='purple')
          .card-label Инвестиции
          .card-value {{ formatAmount(segment.investor_amount) }}
      .col-md-4.col-12.q-pa-sm
        ColorCard(color='teal')
          .card-label Базовый вклад инвестора
          .card-value {{ formatAmount(segment.investor_base) }}
      .col-md-4.col-12.q-pa-sm
        ColorCard(color='cyan')
          .card-label Долг
          .card-value {{ formatAmount(segment.debt_amount) }}

  // Премии
  q-card-section(v-if='hasBonuses(segment)')
    .row.justify-center
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='green')
          .card-label Прямая премия автора
          .card-value {{ getDirectBonus(segment) }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='teal')
          .card-label Динамическая премия
          .card-value {{ formatAmount(segment.voting_bonus) }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='orange')
          .card-label Бонус вкладчика
          .card-value {{ formatAmount(segment.contributor_bonus) }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='pink')
          .card-label Равный бонус автора
          .card-value {{ formatAmount(segment.equal_author_bonus) }}

  // Базовые вклады по ролям
  q-card-section(v-if='hasBaseContributions(segment)')
    .row.justify-center
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='blue')
          .card-label Базовый вклад автора
          .card-value {{ formatAmount(segment.author_base) }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='indigo')
          .card-label Базовый вклад создателя
          .card-value {{ formatAmount(segment.creator_base) }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='purple')
          .card-label Базовый вклад координатора
          .card-value {{ formatAmount(segment.coordinator_base) }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='teal')
          .card-label Имущественный вклад
          .card-value {{ formatAmount(segment.property_base) }}

  // Бонусные вклады по ролям
  q-card-section(v-if='hasBonusContributions(segment)')
    .row.justify-center
      .col-md-4.col-12.q-pa-sm
        ColorCard(color='green')
          .card-label Бонус автора
          .card-value {{ formatAmount(segment.author_bonus) }}
      .col-md-4.col-12.q-pa-sm
        ColorCard(color='orange')
          .card-label Бонус создателя
          .card-value {{ formatAmount(segment.creator_bonus) }}
      .col-md-4.col-12.q-pa-sm
        ColorCard(color='cyan')
          .card-label Бонус координатора
          .card-value {{ formatAmount(segment.coordinator_investments) }}

  // Результаты голосования и CRPS
  q-card-section(v-if='hasVotingAndCrpsData(segment)')
    .row.justify-center
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='red')
          .card-label Голосов получено
          .card-value {{ segment.is_votes_calculated ? 'Да' : 'Нет' }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='blue')
          .card-label Капитал вкладчиков
          .card-value {{ formatAmount(segment.capital_contributor_shares) }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='green')
          .card-label CRPS автора (базовый)
          .card-value {{ segment.last_author_base_reward_per_share?.toFixed(6) || '0' }}
      .col-md-3.col-12.q-pa-sm
        ColorCard(color='purple')
          .card-label CRPS автора (бонус)
          .card-value {{ segment.last_author_bonus_reward_per_share?.toFixed(6) || '0' }}

  // Роли участника
  q-card-section
    .row.justify-center
      .col-12.q-pa-sm
        .text-center
          q-chip(
            v-if='segment.is_author',
            size='sm',
            color='purple',
            text-color='white',
            dense,
            style='margin: 2px;'
          ) Автор
          q-chip(
            v-if='segment.is_creator',
            size='sm',
            color='blue',
            text-color='white',
            dense,
            style='margin: 2px;'
          ) Создатель
          q-chip(
            v-if='segment.is_coordinator',
            size='sm',
            color='indigo',
            text-color='white',
            dense,
            style='margin: 2px;'
          ) Координатор
          q-chip(
            v-if='segment.is_investor',
            size='sm',
            color='green',
            text-color='white',
            dense,
            style='margin: 2px;'
          ) Инвестор
          q-chip(
            v-if='segment.is_propertor',
            size='sm',
            color='orange',
            text-color='white',
            dense,
            style='margin: 2px;'
          ) Пропертор
          q-chip(
            v-if='segment.is_contributor',
            size='sm',
            color='teal',
            text-color='white',
            dense,
            style='margin: 2px;'
          ) Вкладчик
          q-chip(
            v-if='segment.has_vote',
            size='sm',
            color='red',
            text-color='white',
            dense,
            style='margin: 2px;'
          ) Имеет право голоса
</template>

<script lang="ts" setup>
import { ColorCard } from 'src/shared/ui/ColorCard/ui';
import { useSystemStore } from 'src/entities/System/model';
import { formatAsset2Digits } from 'src/shared/lib/utils';
import { getSegmentStatusLabel } from '../../shared/lib';

interface Props {
  segment: any;
}

defineProps<Props>();

const { info } = useSystemStore();

// Форматирование суммы с двумя знаками после запятой
const formatAmount = (amount: string | number) => {
  const value = parseFloat(amount?.toString() || '0');
  return formatAsset2Digits(`${value} ${info.symbols.root_govern_symbol}`);
};

// Расчет прямой премии (равный бонус автора + прямой бонус создателя)
const getDirectBonus = (segment: any) => {
  const equalAuthorBonus = parseFloat(segment.equal_author_bonus || '0');
  const directCreatorBonus = parseFloat(segment.direct_creator_bonus || '0');
  const total = equalAuthorBonus + directCreatorBonus;
  return formatAmount(total);
};

// Проверка наличия инвестиций
const hasInvestments = (segment: any) => {
  return segment.investor_amount || segment.investor_base || segment.debt_amount;
};

// Проверка наличия премий
const hasBonuses = (segment: any) => {
  return segment.equal_author_bonus || segment.direct_creator_bonus ||
         segment.voting_bonus || segment.contributor_bonus;
};

// Проверка наличия базовых вкладов
const hasBaseContributions = (segment: any) => {
  return segment.author_base || segment.creator_base ||
         segment.coordinator_base || segment.property_base;
};

// Проверка наличия бонусных вкладов
const hasBonusContributions = (segment: any) => {
  return segment.author_bonus || segment.creator_bonus || segment.coordinator_investments;
};

// Проверка наличия данных голосования и CRPS
const hasVotingAndCrpsData = (segment: any) => {
  return segment.is_votes_calculated !== undefined ||
         segment.capital_contributor_shares ||
         segment.last_author_base_reward_per_share ||
         segment.last_author_bonus_reward_per_share;
};
</script>

<style lang="scss" scoped>
</style>
