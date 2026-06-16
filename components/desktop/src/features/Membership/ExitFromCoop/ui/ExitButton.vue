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
    //- Проверка реквизитов
    div.exit-loading(v-if='checkingRequisites')
      q-spinner(size='32px', color='primary')
      span.exit-loading__text Проверяем реквизиты…

    //- Нет реквизитов — выход заблокирован, ведём на страницу реквизитов
    div(v-else-if='requisitesOk === false')
      BaseBanner(variant='warn')
        template(#icon)
          q-icon(name='warning')
        div
          p.q-mb-sm Для выхода из кооператива установите реквизиты для получения возврата паевого взноса.
          p.q-mb-none Без реквизитов кооператив не сможет вернуть вам паевой взнос.
      div.q-mt-md.flex.justify-end
        BaseButton(variant='primary', @click='goToRequisites')
          template(#icon-left)
            q-icon(name='account_balance', size='18px')
          span.q-ml-sm Установить реквизиты

    //- Реквизиты есть — показываем заявление и форму подписи
    Form(
      v-else,
      :handler-submit='handlerSubmit',
      :is-submitting='isSubmitting',
      :disabled='!document || loading',
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

      //- Единый лоадер на подготовку заявления и расчёт суммы (грузим параллельно).
      div.exit-loading(v-if='loading')
        q-spinner(size='32px', color='primary')
        span.exit-loading__text Готовим заявление и сумму к возврату…

      template(v-else)
        div.exit-doc.q-mt-md(v-if='document')
          DocumentHtmlReader(:html='document.html')

        div.q-mt-md(v-if='preview')
          div.text-body2.text-grey-7 Сумма к возврату
          div.t-mono.text-h6 {{ preview.total }}
          div.text-caption.text-grey-6.q-mt-xs Целевой паевой {{ preview.share_contribution }} + минимальный {{ preview.minimum_contribution }}. Итог фиксирует Совет.
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
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

const route = useRoute();
const router = useRouter();
const walletStore = useWalletStore();
const { showDialog, open } = useExitDialog();
const { generateApplication, submitSignedApplication, getReturnPreview, hasRequisites } = useMembershipExit();
const { loadExitStatus } = useExitGate();

const isSubmitting = ref(false);
const checkingRequisites = ref(false);
const requisitesOk = ref<boolean | null>(null);
const loading = ref(false);
const document = ref<IGenerateMembershipExitApplicationResult | null>(null);
const preview = ref<IMembershipExitReturnPreview | null>(null);

watch(showDialog, async (opened) => {
  if (!opened) return;

  // Гейт реквизитов — без них выход не запускаем.
  checkingRequisites.value = true;
  try {
    requisitesOk.value = await hasRequisites();
  } catch (error) {
    // Не блокируем проактивно при сбое проверки — бэкенд всё равно отклонит подачу.
    console.error('Не удалось проверить реквизиты пайщика:', error);
    requisitesOk.value = true;
  } finally {
    checkingRequisites.value = false;
  }
  if (!requisitesOk.value) return;

  // Заявление и сумму готовим параллельно под одним лоадером, показываем вместе.
  loading.value = true;
  try {
    const [doc, prev] = await Promise.allSettled([generateApplication(), getReturnPreview()]);
    if (doc.status === 'fulfilled') {
      document.value = doc.value;
    } else {
      console.error('Ошибка формирования заявления о выходе:', doc.reason);
      FailAlert('Не удалось сформировать заявление о выходе');
    }
    if (prev.status === 'fulfilled') {
      preview.value = prev.value;
    } else {
      // Сумма — некритично: документ можно подписать и без предрасчёта.
      console.error('Ошибка расчёта суммы возврата:', prev.reason);
    }
  } finally {
    loading.value = false;
  }
});

const clear = (): void => {
  showDialog.value = false;
  isSubmitting.value = false;
  checkingRequisites.value = false;
  requisitesOk.value = null;
  loading.value = false;
  document.value = null;
  preview.value = null;
};

const goToRequisites = (): void => {
  showDialog.value = false;
  void router.push({ name: 'payment-methods', params: { coopname: route.params.coopname } });
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
    // Авторитетный гейт реквизитов — на бэкенде. Если он отклонил подачу из-за
    // отсутствия реквизитов, переключаем диалог на экран-баннер с кнопкой.
    if (JSON.stringify(e ?? '').includes('установите реквизиты')) {
      requisitesOk.value = false;
    } else {
      FailAlert(e);
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.exit-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--p-3);
  padding: var(--p-8) var(--p-4);
}
.exit-loading__text {
  font-size: var(--p-fs-body-sm);
  color: var(--p-ink-2);
}

.exit-doc {
  max-height: 50vh;
  overflow-y: auto;
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-md);
  padding: var(--p-4);
}
</style>
