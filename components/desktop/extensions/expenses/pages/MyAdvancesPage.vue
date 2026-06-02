<script setup lang="ts">
import { PageHead } from 'src/shared/ui/layout';
import { EmptyState } from 'src/shared/ui/base';
</script>

<template>
  <div class="q-pa-md">
    <PageHead
      eyebrow="Шасси расходов · Личный кабинет"
      title="Мои авансы"
      subtitle="Items в статусе paid + mechanics=ADVANCE, где получатель — я"
    />
    <EmptyState
      title="В разработке"
      body="Страница ожидает закрытия C28-31. Будет BaseTable своих авансов с кнопкой «Приложить чек» (FileUploader → MinIO → reportexp)."
    />
  </div>
</template>
