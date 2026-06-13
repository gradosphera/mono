<template lang="pug">
div
  BaseButton(
    v-if='walletStore.isWalletAgreementSigned',
    variant='danger',
    :size='micro ? "sm" : "md"',
    aria-label='Выход из кооператива',
    @click='open'
  )
    template(#icon-left)
      q-icon(name='logout', size='18px')
    span(v-if='!micro').q-ml-sm Выход из кооператива
    q-tooltip(v-if='micro') Выход из кооператива

  BaseDialog(
    v-model='showDialog',
    title='Выход из кооператива',
    size='md',
    @update:model-value='(v) => !v && clear()'
  )
    Form(
      :handler-submit='handlerSubmit',
      :is-submitting='isSubmitting',
      :button-cancel-txt='"Отменить"',
      :button-submit-txt='"Подать заявление на выход"',
      @cancel='clear'
    )
      BaseBanner(variant='warn')
        template(#icon)
          q-icon(name='warning')
        div
          p.q-mb-sm Подтвердите, что хотите добровольно выйти из кооператива. Действие необратимо.
          p.q-mb-none После подтверждения кабинет блокируется и запускается процесс выхода: получение решения Совета и возврат паевого взноса в срок, установленный Уставом кооператива.

      div.q-mt-md(v-if='loadingPreview')
        q-spinner(size='24px', color='primary')
        span.q-ml-sm.text-grey-7 Расчёт суммы к возврату…
      div.q-mt-md(v-else-if='preview')
        div.text-body2.text-grey-7 Сумма к возврату
        div.t-mono.text-h6 {{ preview.total }}
        div.text-caption.text-grey-6.q-mt-xs Целевой паевой {{ preview.share_contribution }} + минимальный {{ preview.minimum_contribution }}. Итог фиксирует Совет.
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { BaseDialog } from 'src/shared/ui/base/BaseDialog';
import { BaseBanner } from 'src/shared/ui/base/BaseBanner';
import { Form } from 'src/shared/ui/Form';
import { useWalletStore } from 'src/entities/Wallet';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import {
  useMembershipExit,
  useExitDialog,
  useExitGate,
  type IMembershipExitReturnPreview,
} from '../model';

interface Props {
  micro?: boolean;
}

withDefaults(defineProps<Props>(), {
  micro: false,
});

const walletStore = useWalletStore();
const { showDialog, open } = useExitDialog();
const { processMembershipExit, getReturnPreview } = useMembershipExit();
const { loadExitStatus } = useExitGate();

const isSubmitting = ref(false);
const loadingPreview = ref(false);
const preview = ref<IMembershipExitReturnPreview | null>(null);

watch(showDialog, async (opened) => {
  if (!opened) return;
  loadingPreview.value = true;
  try {
    preview.value = await getReturnPreview();
  } catch (error) {
    console.error('Ошибка расчёта суммы возврата:', error);
    FailAlert('Не удалось рассчитать сумму к возврату');
  } finally {
    loadingPreview.value = false;
  }
});

const clear = (): void => {
  showDialog.value = false;
  isSubmitting.value = false;
  preview.value = null;
};

const handlerSubmit = async (): Promise<void> => {
  isSubmitting.value = true;
  try {
    await processMembershipExit();
    // Сразу подтягиваем статус — overlay заблокирует кабинет и покажет процесс выхода.
    await loadExitStatus();
    SuccessAlert('Заявление на выход из кооператива подано. Ожидайте решения Совета.');
    clear();
  } catch (e: any) {
    FailAlert(e);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped></style>
