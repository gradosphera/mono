<script setup lang="ts">
import { PageHead } from 'src/shared/ui/layout';
import { EmptyState } from 'src/shared/ui/base';
</script>

<template>
  <div class="q-pa-md">
    <PageHead
      eyebrow="Шасси расходов"
      title="Реестр расходов"
      subtitle="Общий список всех СЗ-расходов кооператива с фильтрами"
    />
    <EmptyState
      title="В разработке"
      body="Страница ожидает закрытия C28-31 (backend GraphQL + SDK). См. extensions/expenses/README.md."
    />
  </div>
</template>
