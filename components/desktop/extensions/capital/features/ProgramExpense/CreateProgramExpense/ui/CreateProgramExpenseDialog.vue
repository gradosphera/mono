<template lang="pug">
BaseDialog(
  :model-value='modelValue',
  title='Создание программного расхода',
  size='lg',
  @update:model-value='$emit("update:modelValue", $event)'
)
  .create-form
    .field-group
      .t-eyebrow.t-muted.q-mb-sm Цель и параметры
      BaseInput(
        v-model='form.description',
        label='Цель расходов',
        placeholder='Например: «Закупка хостинга и канцелярии на июнь»',
        required
      )

    .field-group
      .field-group__head
        .t-eyebrow.t-muted Строки расходов
        BaseButton(variant='ghost', size='sm', @click='addItem')
          template(#icon-left)
            q-icon(name='add', size='16px')
          | Добавить позицию

      .empty-items(v-if='!form.items.length')
        EmptyState(
          title='Нет позиций',
          body='Добавьте хотя бы одну строку расхода: получатель + способ + сумма.'
        )
          template(#icon)
            q-icon(name='playlist_add', size='40px')

      .items
        .item-card(v-for='(item, idx) in form.items', :key='idx')
          .item-card__head
            .t-sm Позиция №{{ idx + 1 }}
            BaseButton(variant='ghost', size='sm', icon-only, aria-label='Удалить позицию', @click='removeItem(idx)')
              template(#icon-left)
                q-icon(name='delete_outline', size='18px')
          .row.q-col-gutter-sm
            .col-12.col-md-6
              BaseSelect(
                v-model='item.recipient_type',
                :options='recipientTypeOptions',
                label='Тип получателя',
                @update:model-value='item.payment_method_id = null'
              )
            .col-12.col-md-6
              BaseSelect(
                v-model='item.mechanics',
                :options='mechanicsOptions',
                label='Способ оплаты',
                hint='Аванс — под отчёт получателю; прямая — оплата по реквизитам'
              )
            .col-12.col-md-6(v-if='item.recipient_type === Zeus.ExpenseRecipientType.MEMBER')
              BaseInput(
                v-model='item.recipient_account',
                label='Аккаунт пайщика-получателя',
                placeholder='username',
                required,
                @update:model-value='item.payment_method_id = null'
              )
            .col-12.col-md-6(v-if='item.recipient_type === Zeus.ExpenseRecipientType.ORG')
              BaseInput(
                v-model='item.recipient_name',
                label='Название организации',
                placeholder='Например: ООО «Хостинг-центр»',
                required
              )
            .col-12.col-md-6
              BaseInput(
                v-model='item.amount',
                label='Сумма (план)',
                :placeholder='amountPlaceholder',
                required
              )
            .col-12
              BaseInput(
                v-model='item.description',
                label='Описание',
                placeholder='Назначение расхода'
              )
            .col-12(v-if='item.recipient_type === Zeus.ExpenseRecipientType.SELF')
              PaymentMethodSelect(
                v-model='item.payment_method_id',
                :username='session.username',
                hint='Реквизиты фиксируются на момент подачи — на них придёт выплата',
                required
              )
            .col-12(v-if='item.recipient_type === Zeus.ExpenseRecipientType.MEMBER')
              PaymentMethodSelect(
                v-model='item.payment_method_id',
                :username='item.recipient_account?.trim() || ""',
                :hint='item.recipient_account?.trim() ? "Реквизиты фиксируются на момент подачи" : "Сначала укажите аккаунт пайщика-получателя"',
                required
              )
            .col-12(v-if='item.recipient_type === Zeus.ExpenseRecipientType.ORG')
              BaseInput(
                v-model='item.requisites',
                label='Реквизиты получателя',
                placeholder='ИНН, р/с, БИК',
                required
              )

  template(#footer)
    .footer-bar
      BaseButton(variant='ghost', @click='close') Отмена
      BaseButton(
        variant='primary',
        :loading='submitting',
        :disabled='!canSubmit',
        @click='submit'
      ) Подать на одобрение
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { BaseDialog } from 'src/shared/ui/base/BaseDialog';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { BaseInput } from 'src/shared/ui/base/BaseInput';
import { BaseSelect } from 'src/shared/ui/base/BaseSelect';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { PaymentMethodSelect } from 'src/shared/ui/domain/PaymentMethodSelect';
import {
  useCreateProgramExpense,
  type ICreateProgramExpenseDraftItem,
} from '../model';

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'created'): void;
}>();

const system = useSystemStore();
const session = useSessionStore();
const { submitProgramExpense } = useCreateProgramExpense();

const amountPlaceholder = computed(() => {
  const symbol = system.info?.symbols?.root_govern_symbol ?? 'RUB';
  return `1000 (${symbol})`;
});

const form = reactive({
  description: '',
  items: [] as ICreateProgramExpenseDraftItem[],
});

const submitting = ref(false);

const mechanicsOptions = [
  { label: 'Аванс под отчёт', value: Zeus.ExpenseMechanics.ADVANCE },
  { label: 'Прямая оплата', value: Zeus.ExpenseMechanics.DIRECT },
];

const recipientTypeOptions = [
  { label: 'Я сам', value: Zeus.ExpenseRecipientType.SELF },
  { label: 'Пайщик', value: Zeus.ExpenseRecipientType.MEMBER },
  { label: 'Организация', value: Zeus.ExpenseRecipientType.ORG },
];

const canSubmit = computed(
  () =>
    form.description.trim().length > 0 &&
    form.items.length > 0 &&
    form.items.every(
      (i) =>
        i.amount.trim() &&
        i.description.trim() &&
        (i.recipient_type !== Zeus.ExpenseRecipientType.MEMBER || i.recipient_account?.trim()) &&
        (i.recipient_type === Zeus.ExpenseRecipientType.ORG
          ? Boolean(i.recipient_name?.trim() && i.requisites?.trim())
          : Boolean(i.payment_method_id)),
    ),
);

function addItem(): void {
  form.items.push({
    number: String(form.items.length + 1),
    description: '',
    amount: '',
    mechanics: Zeus.ExpenseMechanics.ADVANCE,
    recipient_type: Zeus.ExpenseRecipientType.SELF,
    recipient_name: '',
    requisites: '',
    recipient_account: '',
    payment_method_id: null,
  });
}

function removeItem(idx: number): void {
  form.items.splice(idx, 1);
}

function close(): void {
  emit('update:modelValue', false);
}

async function submit(): Promise<void> {
  try {
    submitting.value = true;
    await submitProgramExpense({
      description: form.description,
      items: form.items,
    });
    SuccessAlert('Программный расход подан — заявление подписано и передано в шасси расходов');
    emit('created');
    close();
  } catch (e) {
    FailAlert(e);
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.create-form {
  display: flex;
  flex-direction: column;
  gap: var(--p-4);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
}

.field-group__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--p-3);
}

.items {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
}

.item-card {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
  padding: var(--p-3);
  border: 1px solid var(--p-line);
  border-radius: var(--p-r-md);
  background: var(--p-surface);
}

.item-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--p-2);
}

.footer-bar {
  display: flex;
  justify-content: flex-end;
  gap: var(--p-2);
  padding: var(--p-3) var(--p-4);
  border-top: 1px solid var(--p-line);
  background: var(--p-canvas);
}
</style>
