<template lang="pug">
q-card(v-if='contributorStore.self' flat)

  .q-pa-lg
    .row.items-center.q-mb-md
      q-icon(name='person', size='32px', color='primary')
      .text-h6.q-ml-sm {{ contributorStore.self?.display_name }}
    .text-body2.text-grey-7.text-weight-bold.q-mb-lg.q-ml-md Вклады по ролям

    .row.q-gutter-md.justify-around
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Инвестор
            .card-value {{ formattedInvestor }}
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Создатель
            .card-value {{ formattedCreator }}
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Автор
            .card-value {{ formattedAuthor }}
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Координатор
            .card-value {{ formattedCoordinator }}
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Собственник
            .card-value {{ formattedPropertor }}
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Вкладчик
            .card-value {{ formattedContributor }}

</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { useSystemStore } from 'src/entities/System/model';
import { ColorCard } from 'src/shared/ui';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import 'src/shared/ui/CardStyles';

const contributorStore = useContributorStore();
const { info } = useSystemStore();

// Форматированные вклады по ролям
const formattedInvestor = computed(() => {
  const value = contributorStore.self?.contributed_as_investor || '0';
  return formatAsset2Digits(`${value} ${info.symbols.root_govern_symbol}`);
});

const formattedCreator = computed(() => {
  const value = contributorStore.self?.contributed_as_creator || '0';
  return formatAsset2Digits(`${value} ${info.symbols.root_govern_symbol}`);
});

const formattedAuthor = computed(() => {
  const value = contributorStore.self?.contributed_as_author || '0';
  return formatAsset2Digits(`${value} ${info.symbols.root_govern_symbol}`);
});

const formattedCoordinator = computed(() => {
  const value = contributorStore.self?.contributed_as_coordinator || '0';
  return formatAsset2Digits(`${value} ${info.symbols.root_govern_symbol}`);
});

const formattedPropertor = computed(() => {
  const value = contributorStore.self?.contributed_as_propertor || '0';
  return formatAsset2Digits(`${value} ${info.symbols.root_govern_symbol}`);
});

const formattedContributor = computed(() => {
  const value = contributorStore.self?.contributed_as_contributor || '0';
  return formatAsset2Digits(`${value} ${info.symbols.root_govern_symbol}`);
});
</script>
