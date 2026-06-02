<script setup lang="ts">
import { PageHead } from 'src/shared/ui/layout';
import { EmptyState } from 'src/shared/ui/base';
</script>

<template>
  <div class="q-pa-md">
    <PageHead
      eyebrow="Шасси расходов · Председатель"
      title="На одобрение председателя"
      subtitle="Очередь СЗ-расходов в статусе created"
    />
    <EmptyState
      title="В разработке"
      body="Страница ожидает закрытия C28-31. Будет canon-таблицей с действиями одобрить/отклонить."
    />
  </div>
</template>
