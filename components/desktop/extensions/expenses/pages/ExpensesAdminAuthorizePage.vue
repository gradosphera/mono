<script setup lang="ts">
import { PageHead } from 'src/shared/ui/layout';
import { EmptyState } from 'src/shared/ui/base';
</script>

<template>
  <div class="q-pa-md">
    <PageHead
      eyebrow="Шасси расходов · Председатель"
      title="На авторизацию совета"
      subtitle="Очередь СЗ-расходов, прошедших одобрение, на голосование совета"
    />
    <EmptyState
      title="В разработке"
      body="Страница ожидает закрытия C28-31. Будет canon-таблицей с действиями авторизовать (генерация protocol_1 2011) / декланировать (с reason)."
    />
  </div>
</template>
