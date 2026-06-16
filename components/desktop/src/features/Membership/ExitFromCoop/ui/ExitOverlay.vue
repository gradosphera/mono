<template lang="pug">
BaseDialog(
  :model-value='isExitActive',
  title='Выход из кооператива',
  :maximized='true',
  :hide-close-button='true',
  :close-on-backdrop='false',
  :close-on-escape='false'
)
  div.exit-overlay
    //- Фаза 1: заявление подписано, ждём подтверждения по ссылке из письма.
    EmptyState(
      v-if='isAwaitingConfirmation',
      title='Подтвердите выход по ссылке из письма',
      body='Мы отправили письмо на вашу электронную почту — перейдите по ссылке в нём, чтобы подтвердить выход и запустить возврат паевого взноса. Письмо могло попасть в папку «Спам».'
    )
      template(#icon)
        q-icon(name='mark_email_unread', size='22px', color='primary')
      template(#action)
        div.exit-overlay__panel
          div.exit-overlay__amount(v-if='plannedAmount')
            div.text-overline.text-grey-6 Планируемая сумма к возврату
            div.t-mono.text-h4 {{ plannedAmount }}
          div.text-caption.text-grey-6 Пока вы не перешли по ссылке, заявление можно отменить.
          div.exit-overlay__actions
            BaseButton(variant='secondary', :loading='cancelling', @click='onCancel')
              | Отменить выход
            BaseButton(variant='ghost', :loading='loggingOut', @click='onLogout')
              template(#icon-left)
                q-icon(name='logout', size='18px')
              | Выйти из личного кабинета

    //- Фаза 2-3: заявление отправлено в блокчейн — рассмотрение советом / одобрено.
    EmptyState(
      v-else-if='exitStatus',
      :title='isAuthorized ? "Совет одобрил выход" : "Заявление на рассмотрении Совета"',
      :body='isAuthorized ? "Возврат паевого взноса будет совершён в срок, установленный Уставом кооператива. Аккаунт заблокирован — дождитесь поступления средств." : "Ваше заявление о выходе передано в Совет кооператива. Кабинет заблокирован на время процедуры — дождитесь решения Совета."'
    )
      template(#icon)
        q-icon(
          :name='isAuthorized ? "payments" : "hourglass_top"',
          size='22px',
          :color='isAuthorized ? "positive" : "primary"'
        )
      template(#action)
        div.exit-overlay__panel
          div.exit-overlay__amount(v-if='plannedAmount')
            div.text-overline.text-grey-6 Сумма к возврату
            div.t-mono.text-h4 {{ plannedAmount }}
            div.text-caption.text-grey-6.q-mt-xs(v-if='!isAuthorized') Планируемая сумма; итог фиксирует Совет.
          div.exit-overlay__actions
            BaseButton(variant='secondary', :loading='loggingOut', @click='onLogout')
              template(#icon-left)
                q-icon(name='logout', size='18px')
              | Выйти из личного кабинета
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Zeus } from '@coopenomics/sdk';
import { BaseDialog } from 'src/shared/ui/base/BaseDialog';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { useLogoutUser } from 'src/features/User/Logout/model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useExitGate } from '../model';

const route = useRoute();
const router = useRouter();
const { exitStatus, isExitActive, isAwaitingConfirmation, plannedAmount, cancelExit, loadExitStatus } =
  useExitGate();
const { logout } = useLogoutUser();

const isAuthorized = computed(
  () => exitStatus.value?.status === Zeus.MembershipExitStatus.AUTHORIZED,
);

const cancelling = ref(false);
const loggingOut = ref(false);

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

// Выход из личного кабинета (logout). Аккаунт при активном выходе заблокирован,
// поэтому из кабинета не выйти иначе — даём кнопку прямо на оверлее. После входа
// заявление снова покажется: статус выхода живёт на цепи (registrator::exits).
const onLogout = async (): Promise<void> => {
  loggingOut.value = true;
  try {
    await logout();
    // Сессия закрыта → loadExitStatus обнулит gate, оверлей закроется.
    await loadExitStatus();
    await router.push({ name: 'signin', params: { coopname: route.params.coopname } });
  } catch (e: any) {
    FailAlert('Ошибка при выходе: ' + (e?.message ?? e));
  } finally {
    loggingOut.value = false;
  }
};
</script>

<style scoped lang="scss">
.exit-overlay {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.exit-overlay__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--p-4);
  margin-top: var(--p-2);
}

.exit-overlay__amount {
  padding: var(--p-5);
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-lg);
  min-width: 240px;
  text-align: center;
}

.exit-overlay__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--p-3);
  justify-content: center;
}
</style>
