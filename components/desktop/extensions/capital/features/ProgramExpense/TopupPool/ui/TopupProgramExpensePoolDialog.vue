<template lang="pug">
BaseDialog(
  :model-value='modelValue',
  title='Пополнение пула программных расходов',
  size='sm',
  @update:model-value='$emit("update:modelValue", $event)'
)
  .form
    .t-eyebrow.t-muted.q-mb-sm Перевод средств из инвестиционного пула в пул программных расходов
    BaseInput(
      v-model='amount',
      label='Сумма пополнения',
      :placeholder='amountPlaceholder',
      required
    )
    .hint Средства списываются с `global_available_invest_pool` и зачисляются в `program_expense_pool`.

  template(#footer)
    .footer-bar
      BaseButton(variant='ghost', @click='close') Отмена
      BaseButton(
        variant='primary',
        :loading='submitting',
        :disabled='!canSubmit',
        @click='submit'
      ) Пополнить
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';
import { BaseDialog } from 'src/shared/ui/base/BaseDialog';
import { BaseButton } from 'src/shared/ui/base/BaseButton';
import { BaseInput } from 'src/shared/ui/base/BaseInput';
import { useTopupProgramExpensePool } from '../model';

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'topped-up'): void;
}>();

const system = useSystemStore();
const { submitTopup } = useTopupProgramExpensePool();

const amount = ref('');
const submitting = ref(false);

const amountPlaceholder = computed(() => {
  const symbol = system.info?.symbols?.root_govern_symbol ?? 'RUB';
  return `10000 (${symbol})`;
});

const canSubmit = computed(() => amount.value.trim().length > 0);

function close(): void {
  emit('update:modelValue', false);
}

async function submit(): Promise<void> {
  try {
    submitting.value = true;
    await submitTopup(amount.value);
    SuccessAlert('Пул пополнен', 'Средства переведены в пул программных расходов.');
    emit('topped-up');
    amount.value = '';
    close();
  } catch (e) {
    FailAlert(e);
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
  padding: var(--p-4);
}

.hint {
  color: var(--p-ink-2);
  font-size: var(--p-fs-body-sm);
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
