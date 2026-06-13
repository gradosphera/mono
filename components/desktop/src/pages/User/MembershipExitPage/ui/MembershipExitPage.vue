<template lang="pug">
.membership-exit-page
  div.row.justify-center
    div.col-12.col-md-8
      BaseBanner(variant='info')
        template(#icon)
          q-icon(name='logout')
        div
          p.text-weight-medium.q-mb-sm Добровольный выход из кооператива
          p.q-mb-sm
            | Выход производится по вашему заявлению. После подачи заявления аккаунт закрывается, а спустя время — удаляется.
          p.q-mb-sm
            | Все средства паевого взноса возвращаются вам в срок, установленный Уставом кооператива.
          p.q-mb-none
            | Возврат к участию после выхода невозможен — потребуется новая регистрация.

      div.q-mt-lg
        ExitButton
</template>

<script setup lang="ts">
import { BaseBanner } from 'src/shared/ui/base/BaseBanner';
import { ExitButton } from 'src/features/Membership/ExitFromCoop';
</script>

<style scoped lang="scss">
.membership-exit-page {
  padding: var(--p-6);
}

@media (max-width: 768px) {
  .membership-exit-page {
    padding: var(--p-4);
  }
}
</style>
