<template lang="pug">
q-card(v-if='contributorStore.self' flat bordered)

  .q-pa-lg
    .row.items-center.q-mb-md
      q-icon(name='person', size='32px', color='primary')
      .text-h6.q-ml-sm {{ contributorStore.self?.display_name }}
    .text-body2.text-grey-7.text-weight-bold.q-mb-lg.q-ml-md Вклады по ролям

    .row.q-gutter-md.justify-around
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Инвестор
            .card-value {{ contributorStore.self?.contributed_as_investor }}
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Создатель
            .card-value {{ contributorStore.self?.contributed_as_creator }}
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Автор
            .card-value {{ contributorStore.self?.contributed_as_author }}
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Координатор
            .card-value {{ contributorStore.self?.contributed_as_coordinator }}
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Контрибьютор
            .card-value {{ contributorStore.self?.contributed_as_contributor }}
        .col-6.col-sm-4.col-xs-12
          ColorCard(color='green')
            .card-label Собственник
            .card-value {{ contributorStore.self?.contributed_as_propertor }}

</template>

<script lang="ts" setup>
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { ColorCard } from 'src/shared/ui';
import 'src/shared/ui/CardStyles';

const contributorStore = useContributorStore();
</script>
