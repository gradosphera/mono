<template lang="pug">
q-btn(@click='showDialog = true', color='primary')
  q-icon.q-mr-sm(name='fa-solid fa-chevron-down')
  span получить возврат

  q-dialog(v-model='showDialog', @hide='clear')
    ModalBase(:title='"Заявление на возврат паевого взноса"')
      Form.q-pa-sm(
        :disabled='!isFormValid',
        :handler-submit='handlerSubmit',
        :is-submitting='isSubmitting',
        :button-cancel-txt='"Отменить"',
        :button-submit-txt='"Создать заявление"',
        @cancel='clear'
      )
        InfoCard(
          :text='"Заявление будет отправлено в совет кооператива на рассмотрение, после одобрения средства поступят на счёт указанным способом."'
        )

        div
          q-input(
            v-model.number='quantity',
            standout='bg-teal text-white',
            type='number',
            :min='1',
            label='Сумма возврата',
            :rules='quantityRules'
          )
            template(#append)
              span.text-overline {{ currency }}

        div
          q-select(
            v-model='selectedMethod',
            :options='methodOptions',
            standout='bg-teal text-white',
            label='Способ получения',
            option-label='label',
            option-value='value',
            :rules='[(val) => !!val || "Выберите способ получения"]',
            :loading='loadingMethods'
          )
            template(v-slot:no-option)
              q-item
                q-item-section.text-grey Методы получения не найдены
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { env } from 'src/shared/config';
import { useWalletStore } from 'src/entities/Wallet';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { useReturnByMoney } from '../model';
import { Notify } from 'quasar';
import type { IPaymentMethodData } from 'src/entities/Wallet/model/types';
import type {
  ISBPData,
  IBankTransferData,
} from 'src/features/PaymentMethod/AddPaymentMethod/model';
import InfoCard from 'src/shared/ui/InfoCard.vue';
import { FailAlert, SuccessAlert } from 'src/shared/api';

const currency = computed(() => env.CURRENCY);
const showDialog = ref(false);
const quantity = ref(1000);
const selectedMethod = ref<{
  label: string;
  value: string;
  description?: string;
} | null>(null);
const isSubmitting = ref(false);
const loadingMethods = ref(false);

const walletStore = useWalletStore();
const { info } = useSystemStore();
const session = useSessionStore();
const { processReturnByMoney } = useReturnByMoney();

// Правила валидации для суммы
const quantityRules = [
  (val: number) => val >= 1000 || 'Минимальная сумма возврата 1000 рублей',
  (val: number) => val > 0 || 'Сумма должна быть положительной',
];

// Опции методов платежа
const methodOptions = computed(() => {
  return walletStore.methods.map((method: IPaymentMethodData) => ({
    label: getMethodLabel(method),
    value: method.method_id.toString(),
    description: getMethodDescription(method),
  }));
});

// Проверка валидности формы
const isFormValid = computed(() => {
  return (
    quantity.value >= 1000 &&
    quantity.value > 0 &&
    selectedMethod.value !== null &&
    !isSubmitting.value
  );
});

// Функция для получения читаемого названия метода
function getMethodLabel(method: IPaymentMethodData): string {
  if (method.method_type === 'sbp' && isSBPData(method.data)) {
    const phone = method.data.phone;
    // Формат: +7***42 (или +7***XX)
    let formatted = phone;
    if (phone.length >= 6) {
      // +7***XX
      formatted = `${phone.slice(0, 2)}***${phone.slice(-2)}`;
    } else if (phone.length > 2) {
      formatted = `${phone.slice(0, 2)}***${phone.slice(-2)}`;
    }
    return `СБП (${formatted})`;
  } else if (
    method.method_type === 'bank_transfer' &&
    isBankTransferData(method.data)
  ) {
    const acc = method.data.account_number;
    const last4 = acc.slice(-4);
    const bank = method.data.bank_name || '';
    return `Банковский перевод — ${bank} (***${last4})`;
  }
  return method.method_type;
}

// Функция для получения описания метода
function getMethodDescription(method: IPaymentMethodData): string {
  if (method.method_type === 'sbp' && isSBPData(method.data)) {
    return `Система Быстрых Платежей на номер ${method.data.phone}`;
  } else if (
    method.method_type === 'bank_transfer' &&
    isBankTransferData(method.data)
  ) {
    return `Банковский счет ${method.data.account_number} в ${method.data.bank_name}`;
  }
  return '';
}

// Функции для проверки типов данных
function isSBPData(data: ISBPData | IBankTransferData): data is ISBPData {
  return (data as ISBPData).phone !== undefined;
}

function isBankTransferData(
  data: ISBPData | IBankTransferData,
): data is IBankTransferData {
  return (data as IBankTransferData).account_number !== undefined;
}

// Загрузка методов платежа при открытии диалога
watch(showDialog, async (newValue) => {
  if (newValue) {
    loadingMethods.value = true;
    try {
      await walletStore.loadUserWallet({
        coopname: info.coopname,
        username: session.username,
      });
    } catch (error) {
      console.error('Ошибка загрузки методов платежа:', error);
      Notify.create({
        message: 'Ошибка загрузки методов платежа',
        type: 'negative',
      });
    } finally {
      loadingMethods.value = false;
    }
  }
});

const clear = (): void => {
  showDialog.value = false;
  isSubmitting.value = false;
  quantity.value = 1000;
  selectedMethod.value = null;
};

const handlerSubmit = async (): Promise<void> => {
  if (!selectedMethod.value) {
    Notify.create({
      message: 'Выберите способ получения средств',
      type: 'negative',
    });
    return;
  }

  isSubmitting.value = true;
  try {
    await processReturnByMoney({
      quantity: quantity.value,
      symbol: env.CURRENCY as string,
      method_id: selectedMethod.value.value,
    });
    SuccessAlert('Заявление на возврат паевого взноса успешно подано');
    clear();
  } catch (e: any) {
    FailAlert(e);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped></style>
