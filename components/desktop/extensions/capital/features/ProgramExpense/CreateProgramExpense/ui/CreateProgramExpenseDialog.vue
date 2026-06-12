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
      BaseInput(
        v-model='form.deadline',
        type='date',
        label='Срок исполнения (в срок до)',
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
                @update:model-value='onRecipientTypeChange(item)'
              )
            .col-12.col-md-6
              BaseSelect(
                v-model='item.mechanics',
                :options='mechanicsOptions',
                label='Способ оплаты',
                disabled
              )
            .col-12.col-md-6(v-if='item.recipient_type === Zeus.ExpenseRecipientType.MEMBER')
              UserSearchSelector(
                v-model='item.recipient_account',
                label='Пайщик-получатель (по ФИО)',
                outlined,
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
                label='Что оплачиваем',
                placeholder='Своими словами: что это за расход и зачем',
                required
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
            .col-12(v-if='item.recipient_type === Zeus.ExpenseRecipientType.ORG')
              BaseInput(
                v-model='item.payment_purpose',
                label='Назначение платежа',
                placeholder='Например: «Оплата по счёту № 814 от 01.06.2026 за аренду серверов»',
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
import { computed, onMounted, reactive, ref, watch } from 'vue';
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
import { UserSearchSelector } from 'src/shared/ui/UserSearchSelector';
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
  deadline: '',
  items: [] as ICreateProgramExpenseDraftItem[],
});

const submitting = ref(false);

// Черновик формы переживает перезаход: каждое изменение зеркалится в
// localStorage, восстановление — на маунте (SSR-safe), очистка — только
// после успешной подачи.
const DRAFT_KEY = 'mp:capital:create-program-expense:draft';

function restoreDraft(): void {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw) as Partial<typeof form>;
    form.description = draft.description ?? '';
    form.deadline = draft.deadline ?? '';
    form.items = Array.isArray(draft.items) ? draft.items : [];
  } catch {
    localStorage.removeItem(DRAFT_KEY);
  }
}

function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

onMounted(() => {
  restoreDraft();
  watch(
    form,
    () => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    },
    { deep: true },
  );
});

const mechanicsOptions = [
  { label: 'Аванс под отчёт', value: Zeus.ExpenseMechanics.ADVANCE },
  { label: 'Оплата по счету', value: Zeus.ExpenseMechanics.DIRECT },
];

const recipientTypeOptions = [
  { label: 'Я сам', value: Zeus.ExpenseRecipientType.SELF },
  { label: 'Пайщик', value: Zeus.ExpenseRecipientType.MEMBER },
  { label: 'Организация/ИП', value: Zeus.ExpenseRecipientType.ORG },
];

// Пайщик получает только аванс под отчёт (личные реквизиты, отчитается чеком);
// организация — только прямую оплату по выставленным реквизитам.
function mechanicsFor(recipientType: Zeus.ExpenseRecipientType): Zeus.ExpenseMechanics {
  return recipientType === Zeus.ExpenseRecipientType.ORG
    ? Zeus.ExpenseMechanics.DIRECT
    : Zeus.ExpenseMechanics.ADVANCE;
}

function onRecipientTypeChange(item: ICreateProgramExpenseDraftItem): void {
  item.payment_method_id = null;
  item.mechanics = mechanicsFor(item.recipient_type);
}

const canSubmit = computed(
  () =>
    form.description.trim().length > 0 &&
    form.deadline.trim().length > 0 &&
    form.items.length > 0 &&
    form.items.every(
      (i) =>
        i.amount.trim() &&
        i.description.trim() &&
        (i.recipient_type !== Zeus.ExpenseRecipientType.MEMBER || i.recipient_account?.trim()) &&
        (i.recipient_type === Zeus.ExpenseRecipientType.ORG
          ? Boolean(i.recipient_name?.trim() && i.requisites?.trim() && i.payment_purpose?.trim())
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
    payment_purpose: '',
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
      deadline: form.deadline,
      items: form.items,
    });
    SuccessAlert('Программный расход подан — заявление подписано и передано в совет');
    clearDraft();
    form.description = '';
    form.deadline = '';
    form.items = [];
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
}
</style>
