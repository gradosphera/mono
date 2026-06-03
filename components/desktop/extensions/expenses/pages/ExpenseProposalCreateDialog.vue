<template lang="pug">
BaseDialog(
  :model-value='modelValue',
  title='Создание служебной записки',
  size='lg',
  @update:model-value='$emit("update:modelValue", $event)'
)
  .create-form
    .banner.banner--info.q-mb-md
      q-icon.banner__icon(name='info', size='20px')
      .banner__body
        | Подача служебных записок открывается после расшивки signature-pipeline (Эпик 2 · document2).
        | Форма ниже собирает заявление и вычисляет хеш — отправка вернёт ошибку до момента готовности.

    .field-group
      .t-section.q-mb-sm Параметры заявления
      BaseInput(
        v-model='form.operation_code',
        label='Действие (operation_code)',
        placeholder='ADVANCE_PAYOUT / DIRECT_PAYMENT / …',
        required
      )
      BaseInput(
        v-model='form.source_wallet',
        label='Источник средств (кошелёк)',
        placeholder='w.wal.member / w.cap.gen / …',
        required
      )

    .field-group
      .field-group__head
        .t-section Строки расходов
        BaseButton(
          variant='ghost',
          size='sm',
          icon='add',
          @click='addItem'
        ) Добавить позицию

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
            .t-section-sm Позиция №{{ idx + 1 }}
            BaseButton(
              variant='ghost',
              size='sm',
              icon='delete',
              @click='removeItem(idx)'
            )
          .row.q-col-gutter-sm
            .col-12.col-md-6
              BaseInput(
                v-model='item.recipient',
                label='Получатель',
                placeholder='username / org id',
                required
              )
            .col-12.col-md-6
              q-select(
                v-model='item.recipient_type',
                :options='recipientTypeOptions',
                label='Тип получателя',
                outlined,
                dense,
                emit-value,
                map-options
              )
            .col-12.col-md-6
              q-select(
                v-model='item.mechanics',
                :options='mechanicsOptions',
                label='Способ',
                outlined,
                dense,
                emit-value,
                map-options
              )
            .col-12.col-md-6
              BaseInput(
                v-model='item.planned_amount',
                label='Сумма (план)',
                placeholder='1000.0000 RUB',
                required
              )
            .col-12
              BaseInput(
                v-model='item.description',
                label='Описание',
                placeholder='Назначение расхода'
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
import { useRoute } from 'vue-router';
import { Zeus } from '@coopenomics/sdk';
import { BaseDialog } from 'src/shared/ui/base/BaseDialog';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { BaseInput } from 'src/shared/ui/base/BaseInput';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { createExpenseProposal } from '../api';

interface IItemDraft {
  recipient: string;
  recipient_type: Zeus.ExpenseRecipientType;
  mechanics: Zeus.ExpenseMechanics;
  planned_amount: string;
  description: string;
}

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'created'): void;
}>();

const route = useRoute();

const form = reactive({
  operation_code: '',
  source_wallet: '',
  items: [] as IItemDraft[],
});

const submitting = ref(false);

const recipientTypeOptions = [
  { label: 'Пайщик', value: Zeus.ExpenseRecipientType.MEMBER },
  { label: 'Организация', value: Zeus.ExpenseRecipientType.ORG },
  { label: 'Я сам', value: Zeus.ExpenseRecipientType.SELF },
];

const mechanicsOptions = [
  { label: 'Аванс', value: Zeus.ExpenseMechanics.ADVANCE },
  { label: 'Прямая оплата', value: Zeus.ExpenseMechanics.DIRECT },
];

const canSubmit = computed(
  () =>
    form.operation_code.trim().length > 0 &&
    form.source_wallet.trim().length > 0 &&
    form.items.length > 0 &&
    form.items.every((i) => i.recipient.trim() && i.planned_amount.trim()),
);

function addItem(): void {
  form.items.push({
    recipient: '',
    recipient_type: Zeus.ExpenseRecipientType.MEMBER,
    mechanics: Zeus.ExpenseMechanics.ADVANCE,
    planned_amount: '',
    description: '',
  });
}

function removeItem(idx: number): void {
  form.items.splice(idx, 1);
}

function close(): void {
  emit('update:modelValue', false);
}

async function computeProposalHash(coopname: string): Promise<string> {
  const canonical = JSON.stringify({
    coopname,
    operation_code: form.operation_code,
    source_wallet: form.source_wallet,
    items: form.items.map((i) => ({
      recipient: i.recipient,
      recipient_type: i.recipient_type,
      mechanics: i.mechanics,
      planned_amount: i.planned_amount,
      description: i.description,
    })),
  });
  const subtle =
    typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle
      ? globalThis.crypto.subtle
      : null;
  if (!subtle) throw new Error('crypto.subtle недоступен — вычислите hash на сервере');
  const data = new TextEncoder().encode(canonical);
  const digest = await subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function submit(): Promise<void> {
  const coopname = route.params.coopname as string;
  if (!coopname) {
    FailAlert(new Error('Не указан кооператив (route.params.coopname)'));
    return;
  }
  try {
    submitting.value = true;
    const proposal_hash = await computeProposalHash(coopname);
    await createExpenseProposal({ coopname, proposal_hash });
    SuccessAlert('Служебная записка подана', 'Заявление отправлено на подпись пайщику.');
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
