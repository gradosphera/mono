<script setup lang="ts">
import { PageHead } from 'src/shared/ui/layout';
import { EmptyState } from 'src/shared/ui/base';
</script>

<template>
  <div class="q-pa-md">
    <PageHead
      eyebrow="Шасси расходов"
      title="Расход"
      subtitle="Экран доказательств: document2 + чеки + ledger2-проводки"
    />
    <EmptyState
      title="В разработке"
      body="Страница ожидает закрытия C28-31. Будет показывать цепочку артефактов: 2010 → 2011 → expense_files → события timeline."
    />
  </div>
</template>
