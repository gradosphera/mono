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
    size='lg',
    @update:model-value='(v) => !v && clear()'
  )
    Form(
      :handler-submit='handlerSubmit',
      :is-submitting='isSubmitting',
      :disabled='!document || loadingDoc',
      :button-cancel-txt='"Отменить"',
      :button-submit-txt='"Подписать и подать заявление"',
      @cancel='clear'
    )
      BaseBanner(variant='warn')
        template(#icon)
          q-icon(name='warning')
        div
          p.q-mb-sm Внимательно прочитайте заявление. Выход из кооператива — необратимое действие.
          p.q-mb-none После подписания и подтверждения по ссылке из письма кабинет блокируется и запускается процесс выхода: получение решения Совета и возврат паевого взноса в срок, установленный Уставом кооператива.

      div.q-mt-md(v-if='loadingDoc')
        q-spinner(size='24px', color='primary')
        span.q-ml-sm.text-grey-7 Формирование заявления…
      div.exit-doc.q-mt-md(v-else-if='document')
        DocumentHtmlReader(:html='document.html')

      div.q-mt-md(v-if='loadingPreview')
        q-spinner(size='20px', color='primary')
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
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
import { Form } from 'src/shared/ui/Form';
import { useWalletStore } from 'src/entities/Wallet';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import {
  useMembershipExit,
  useExitDialog,
  useExitGate,
  type IMembershipExitReturnPreview,
  type IGenerateMembershipExitApplicationResult,
} from '../model';

interface Props {
  micro?: boolean;
}

withDefaults(defineProps<Props>(), {
  micro: false,
});

const walletStore = useWalletStore();
const { showDialog, open } = useExitDialog();
const { generateApplication, submitSignedApplication, getReturnPreview } = useMembershipExit();
const { loadExitStatus } = useExitGate();

const isSubmitting = ref(false);
const loadingDoc = ref(false);
const loadingPreview = ref(false);
const document = ref<IGenerateMembershipExitApplicationResult | null>(null);
const preview = ref<IMembershipExitReturnPreview | null>(null);

watch(showDialog, async (opened) => {
  if (!opened) return;
  loadingDoc.value = true;
  loadingPreview.value = true;
  try {
    document.value = await generateApplication();
  } catch (error) {
    console.error('Ошибка формирования заявления о выходе:', error);
    FailAlert('Не удалось сформировать заявление о выходе');
  } finally {
    loadingDoc.value = false;
  }
  try {
    preview.value = await getReturnPreview();
  } catch (error) {
    console.error('Ошибка расчёта суммы возврата:', error);
  } finally {
    loadingPreview.value = false;
  }
});

const clear = (): void => {
  showDialog.value = false;
  isSubmitting.value = false;
  document.value = null;
  preview.value = null;
};

const handlerSubmit = async (): Promise<void> => {
  if (!document.value) return;
  isSubmitting.value = true;
  try {
    await submitSignedApplication(document.value);
    // Подтягиваем статус — overlay заблокирует кабинет и покажет экран ожидания письма.
    await loadExitStatus();
    SuccessAlert('Заявление подписано. Перейдите по ссылке из письма, чтобы подтвердить выход.');
    clear();
  } catch (e: any) {
    FailAlert(e);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.exit-doc {
  max-height: 50vh;
  overflow-y: auto;
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-md);
  padding: var(--p-4);
}
</style>
