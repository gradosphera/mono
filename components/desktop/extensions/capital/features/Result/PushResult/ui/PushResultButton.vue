<template lang="pug">
q-btn(
  color='primary',
  @click='showDialog = true',
  :loading='loading',
  label='Добавить результат'
)

  q-dialog(v-model='showDialog', @hide='clear')
    ModalBase(:title='"Подтверждение внесения результата"')
      .q-pa-md
        // Общая сумма стоимости сегмента
        ColorCard(color='green')
          .card-label Общая сумма сегмента
          .card-value {{ totalAmount }}

        // Сумма взятой ссуды (только если > 0)
        ColorCard(color='orange', v-if='parseFloat(debtAmount) > 0')
          .card-label Сумма погашаемой ссуды
          .card-value {{ debtAmount }}

      Form.q-pa-md(
        :handler-submit='handlePushResult',
        :is-submitting='isSubmitting',
        :button-submit-txt='"Подтвердить внесение"',
        :button-cancel-txt='"Отмена"',
        @cancel='clear'
      )

      template(#footer='')
        .q-pa-md.text-center
          p.text-caption Подтверждая внесение результата, вы соглашаетесь с генерацией и подписью заявления на паевой взнос
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePushResult } from '../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { useSystemStore } from 'src/entities/System/model';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { ColorCard } from 'src/shared/ui/ColorCard';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';

interface Props {
  projectHash: string;
  segment: ISegment;
}

const props = defineProps<Props>();

const { info } = useSystemStore();
const { pushResultWithGeneratedStatement } = usePushResult();

const loading = ref(false);
const showDialog = ref(false);
const isSubmitting = ref(false);

// Вычисляемые суммы
const totalAmount = computed(() => {
  if (!props.segment) return '0.00';

  // Общая стоимость сегмента
  return formatAsset2Digits(props.segment.total_segment_cost || '0');
});

const debtAmount = computed(() => {
  if (!props.segment || !props.segment.debt_amount) return '0.00';

  return formatAsset2Digits(props.segment.debt_amount);
});

// Сырые значения для API
const rawTotalAmount = computed(() => {
  if (!props.segment) return '0';

  const totalCost = parseFloat(props.segment.total_segment_cost || '0');
  return totalCost.toFixed(info.symbols.root_govern_precision) + ' ' + info.symbols.root_govern_symbol;
});

const rawDebtAmount = computed(() => {
  if (!props.segment || !props.segment.debt_amount) return '0';

  const debt = parseFloat(props.segment.debt_amount);
  return debt.toFixed(info.symbols.root_govern_precision) + ' ' + info.symbols.root_govern_symbol;
});

const clear = () => {
  showDialog.value = false;
  isSubmitting.value = false;
};

const handlePushResult = async () => {
  try {
    isSubmitting.value = true;

    // Отправляем результат с генерацией и подписью заявления
    await pushResultWithGeneratedStatement(
      props.projectHash,
      props.segment.username || '',
      rawTotalAmount.value,
      rawDebtAmount.value,
    );

    SuccessAlert('Результат успешно внесен');
    clear();
  } catch (error) {
    FailAlert(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
