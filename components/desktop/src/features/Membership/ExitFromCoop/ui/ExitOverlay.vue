<template lang="pug">
BaseDialog(
  :model-value='isExitActive',
  title='Выход из кооператива',
  :maximized='true',
  :hide-close-button='true',
  :close-on-backdrop='false',
  :close-on-escape='false'
)
  div.row.justify-center
    div.col-12.col-md-7.text-center.q-pt-xl(v-if='exitStatus')
      q-icon(
        :name='isAuthorized ? "payments" : "hourglass_top"',
        size='64px',
        :color='isAuthorized ? "positive" : "primary"'
      )

      div.text-h5.q-mt-md {{ isAuthorized ? 'Совет одобрил выход' : 'Заявление на рассмотрении Совета' }}

      p.text-body1.text-grey-7.q-mt-sm(v-if='isAuthorized')
        | Возврат паевого взноса будет совершён в срок, установленный Уставом кооператива. Аккаунт заблокирован — дождитесь поступления средств.
      p.text-body1.text-grey-7.q-mt-sm(v-else)
        | Ваше заявление о выходе передано в Совет кооператива. Кабинет заблокирован на время процедуры — дождитесь решения Совета.

      div.exit-overlay__amount.q-mt-xl(v-if='plannedAmount')
        div.text-overline.text-grey-6 Сумма к возврату
        div.t-mono.text-h4 {{ plannedAmount }}
        div.text-caption.text-grey-6.q-mt-xs(v-if='!isAuthorized') Планируемая сумма; итог фиксирует Совет.
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { BaseDialog } from 'src/shared/ui/base/BaseDialog';
import { useExitGate } from '../model';

const { exitStatus, isExitActive, plannedAmount } = useExitGate();

const isAuthorized = computed(
  () => exitStatus.value?.status === Zeus.MembershipExitStatus.AUTHORIZED,
);
</script>

<style scoped lang="scss">
.exit-overlay__amount {
  padding: var(--p-5);
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-lg);
  display: inline-block;
  min-width: 240px;
}
</style>
