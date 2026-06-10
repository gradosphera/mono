<template lang="pug">
BaseDialog(
  :model-value='modelValue',
  title='Авторизация служебной записки',
  size='md',
  @update:model-value='$emit("update:modelValue", $event)'
)
  .auth-form(v-if='proposal')
    .banner.banner--info.q-mb-md
      q-icon.banner__icon(name='gavel', size='20px')
      .banner__body
        | Решение председателя/совета по СЗ {{ truncateHash(proposal.proposal_hash) }}.
        | Документ-протокол подписывается вашим ключом и публикуется в блокчейне.

    .field-group
      .t-section.q-mb-sm Сводка
      DataRow(label='Пайщик', :value='proposal.username || "—"')
      DataRow(label='Цель', :value='proposal.operation_code || "—"')
      DataRow(label='Сумма (план)', :value='proposal.total_planned || "—"')
      DataRow(label='Сумма (факт)', :value='proposal.total_actual || "—"')

    .field-group
      .t-section.q-mb-sm Решение
      q-option-group(
        v-model='form.kind',
        :options='kindOptions',
        type='radio',
        color='primary'
      )

      BaseInput(
        v-if='form.kind === "decline"',
        v-model='form.reason',
        label='Причина отказа',
        placeholder='Например: «Превышение лимита программы»',
        required
      )

      .row.q-col-gutter-sm
        .col-12.col-md-6
          BaseInput(
            v-model='form.protocol_number',
            label='Номер протокола',
            placeholder='Например: 15'
          )
        .col-12.col-md-6
          BaseInput(
            v-model='form.protocol_date',
            label='Дата протокола',
            placeholder='03.06.2026'
          )

  template(#footer)
    .footer-bar
      BaseButton(variant='ghost', @click='close') Отмена
      BaseButton(
        variant='primary',
        :loading='submitting',
        :disabled='!canSubmit',
        @click='submit'
      ) {{ form.kind === 'approve' ? 'Утвердить' : 'Отклонить' }}
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { BaseDialog } from 'src/shared/ui/base/BaseDialog';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { BaseInput } from 'src/shared/ui/base/BaseInput';
import { DataRow } from 'src/shared/ui/domain';
import {
  getExpenseProposal,
  type IExpenseProposalResult,
} from '../api';
import { useExpenseProposalActions, type ICreateProposalDraftItem } from '../model';

const props = defineProps<{
  modelValue: boolean;
  proposalHash: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'authorized'): void;
}>();

const { authorizeProposal } = useExpenseProposalActions();

const proposal = ref<NonNullable<IExpenseProposalResult> | null>(null);

const form = reactive({
  kind: 'approve' as 'approve' | 'decline',
  reason: '',
  protocol_number: '',
  protocol_date: '',
});

const submitting = ref(false);

const kindOptions = [
  { label: 'Утвердить', value: 'approve' },
  { label: 'Отклонить', value: 'decline' },
];

const canSubmit = computed(() => {
  if (!proposal.value) return false;
  if (form.kind === 'decline' && !form.reason.trim()) return false;
  return true;
});

watch(
  () => [props.modelValue, props.proposalHash],
  async ([open]) => {
    if (!open || !props.proposalHash) return;
    try {
      const result = await getExpenseProposal({ proposal_hash: props.proposalHash });
      proposal.value = result as NonNullable<IExpenseProposalResult> | null;
    } catch (e) {
      FailAlert(e);
    }
  },
  { immediate: true },
);

function truncateHash(hash?: string | null): string {
  if (!hash) return '';
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

function close(): void {
  emit('update:modelValue', false);
}

async function submit(): Promise<void> {
  if (!proposal.value) return;
  try {
    submitting.value = true;
    const items: ICreateProposalDraftItem[] = (proposal.value.items ?? []).map((it: any, idx: number) => ({
      number: String(idx + 1),
      description: it.description ?? '',
      amount: it.planned_amount ?? '',
      recipient_type: (it.recipient_type ?? 'SELF') as 'SELF' | 'MEMBER' | 'ORG',
      mechanics: (it.mechanics ?? 'ADVANCE') as 'ADVANCE' | 'DIRECT',
      recipient_name: it.recipient ?? '',
      requisites: '',
      item_hash: it.item_hash,
      recipient_account: it.recipient ?? '',
    }));

    await authorizeProposal({
      proposal_hash: proposal.value.proposal_hash,
      description: proposal.value.operation_code ?? 'Расход',
      source_wallet: proposal.value.source_wallet ?? '',
      items,
      decision_kind: form.kind,
      decision_reason: form.reason || undefined,
      protocol_number: form.protocol_number || undefined,
      protocol_date: form.protocol_date || undefined,
    });

    SuccessAlert(
      form.kind === 'approve'
        ? 'СЗ утверждена — решение подписано и отправлено в блокчейн'
        : 'СЗ отклонена — решение подписано и отправлено в блокчейн',
    );
    emit('authorized');
    close();
  } catch (e) {
    FailAlert(e);
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--p-4);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
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
