<script setup lang="ts">
import { PageHead } from 'src/shared/ui/layout';
import { EmptyState } from 'src/shared/ui/base';
</script>

<template>
  <div class="q-pa-md">
    <PageHead
      eyebrow="Шасси расходов · Касса"
      title="Касса"
      subtitle="4 таба: готово к оплате · ждут отчёта пайщика · ждут утверждения отчёта · закрыто"
    />
    <EmptyState
      title="В разработке"
      body="Страница ожидает закрытия C28-31. Будет PageTabs с 4 вкладками; каждая — BaseTable с действиями (оплатить + чек / утвердить отчёт / декланировать)."
    />
  </div>
</template>
