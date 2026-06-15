<template lang="pug">
BaseDialog(
  :model-value='isExitActive',
  title='Выход из кооператива',
  :maximized='true',
  :hide-close-button='true',
  :close-on-backdrop='false',
  :close-on-escape='false'
)
  //- Фаза 1: заявление подписано, ждём подтверждения по ссылке из письма.
  div.row.justify-center(v-if='isAwaitingConfirmation')
    div.col-12.col-md-7.text-center.q-pt-xl
      q-icon(name='mark_email_unread', size='64px', color='primary')

      div.text-h5.q-mt-md Подтвердите выход по ссылке из письма

      p.text-body1.text-grey-7.q-mt-sm
        | Процесс выхода запущен. Мы отправили письмо на вашу электронную почту —
        | перейдите по ссылке в нём, чтобы подтвердить выход и запустить процедуру
        | возврата паевого взноса. Письмо могло попасть в папку «Спам».

      p.text-body2.text-grey-6.q-mt-sm
        | Пока вы не перешли по ссылке, заявление не отправлено и его можно отменить.

      div.exit-overlay__amount.q-mt-lg(v-if='plannedAmount')
        div.text-overline.text-grey-6 Планируемая сумма к возврату
        div.t-mono.text-h4 {{ plannedAmount }}

      div.q-mt-xl
        BaseButton(
          variant='secondary',
          label='Отменить выход',
          :loading='cancelling',
          @click='onCancel'
        )

  //- Фаза 2-3: заявление отправлено в блокчейн — рассмотрение советом / одобрено.
  div.row.justify-center(v-else-if='exitStatus')
    div.col-12.col-md-7.text-center.q-pt-xl
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
import { computed, ref } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { BaseDialog } from 'src/shared/ui/base/BaseDialog';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useExitGate } from '../model';

const { exitStatus, isExitActive, isAwaitingConfirmation, plannedAmount, cancelExit } =
  useExitGate();

const isAuthorized = computed(
  () => exitStatus.value?.status === Zeus.MembershipExitStatus.AUTHORIZED,
);

const cancelling = ref(false);

const onCancel = async (): Promise<void> => {
  cancelling.value = true;
  try {
    await cancelExit();
    SuccessAlert('Заявление на выход отменено.');
  } catch (e: any) {
    FailAlert(e);
  } finally {
    cancelling.value = false;
  }
};
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
