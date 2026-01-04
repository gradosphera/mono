<template lang="pug">
q-dialog(
  v-model='isOpen',
  persistent,
  :maximized='$q.screen.lt.md'
)
  q-card.modal-convert-segment
    q-card-section.modal-header
      .text-h6 Получение сегмента
      .text-subtitle2 Распределите средства между главным кошельком и кошельком программы "Благорост"


    q-card-section.modal-body
      // Всего к распределению
      ColorCard(color='blue')
        .card-label Всего к получению
        .card-value {{ formatAmount(availableForProgram) }}

      // Слайдер распределения
      .distribution-section.q-mt-lg
        .row.justify-between.q-mb-lg
          .distribution-item
            q-icon(name='account_balance_wallet', color='teal', size='24px')
            .distribution-label.text-caption.text-grey-7 Главный Кошелек
            .distribution-value.text-h6.text-weight-bold.text-teal {{ formatAmount(walletAmountValue) }}
          .distribution-item

            q-icon(name='savings', color='teal', size='24px')
            .distribution-label.text-caption.text-grey-7 Программа Благорост
            .distribution-value.text-h6.text-weight-bold.text-teal {{ formatAmount(capitalAmountValue) }}

        q-slider.balance-slider(
          v-model='sliderPercentage',
          :min='0',
          :max='100',
          :step='1',
          :color='sliderColor',
          track-color='grey-3',
          :selection-color='sliderSelectionColor',
          :readonly='isReadonly',
          markers,
          label,
          :label-value='sliderLabel',
          track-size="28px"
          thumb-size="55px"
        )
        .text-caption.text-center.q-mt-sm.text-grey-7(v-if='canMoveSlider')
          | 0% = всё доступное в главный кошелек · 100% = всё в программу Благорост
        .text-caption.text-center.q-mt-sm.text-grey-6(v-else)
          | Все средства автоматически направляются в программу Благорост


    q-card-actions.modal-actions(
      align='right'
    )
      q-btn(
        flat,
        label='Отмена',
        color='primary',
        v-close-popup
      )
      q-btn(
        :loading='loading',
        label='Получить',
        color='primary',
        @click='handleConvert',
        :disable='!isValidDistribution'
      )
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';
import { useConvertSegment } from '../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import ColorCard from 'src/shared/ui/ColorCard/ui/ColorCard.vue';

interface Props {
  segment: ISegment;
  modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const { convertSegmentWithDocumentGeneration } = useConvertSegment();
const loading = ref(false);

// Реактивные состояния для диалога
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Вычисляемые суммы на основе сегмента - ТОЧНО как в контракте

// ТОЧНО как в контракте convertsegm.cpp

// Доступная сумма для конвертации в кошелек
const availableForWallet = computed(() => {
  const provisional = parseFloat(props.segment.provisional_amount || '0');
  const debt = parseFloat(props.segment.debt_amount || '0');
  return Math.max(0, provisional - debt);
});


// Доступная сумма для конвертации в программу
const availableForProgram = computed(() => {
  const total = parseFloat(props.segment.total_segment_cost || '0');
  const debt = parseFloat(props.segment.debt_amount || '0');
  return Math.max(0, total - debt);
});

// Максимум что можно в кошелек (provisional_amount - debt_amount)
const maxWalletAmount = computed(() => availableForWallet.value);


// Проверка - можно ли вообще таскать слайдер (если нет средств для кошелька)
const canMoveSlider = computed(() => {
  return maxWalletAmount.value > 0;
});

// Readonly если нельзя таскать слайдер
const isReadonly = computed(() => !canMoveSlider.value);

// Значения для управления
const sliderPercentage = ref(0); // 0% = все в кошелек, 100% = все в программу
const walletAmountValue = ref(0);
const capitalAmountValue = ref(0);

// Watch на процент слайдера - пересчитываем суммы
watch(sliderPercentage, (newPercentage) => {
  if (!canMoveSlider.value) {
    // Если нельзя таскать слайдер - все в программу
    walletAmountValue.value = 0;
    capitalAmountValue.value = availableForProgram.value;
    return;
  }

  // Слайдер от 0% (все в кошелек) до 100% (все в программу)
  // wallet_amount = available_for_wallet * (1 - percentage/100)
  walletAmountValue.value = maxWalletAmount.value * (1 - newPercentage / 100);
  capitalAmountValue.value = availableForProgram.value - walletAmountValue.value;
});

// Watch на сумму кошелька - обновляем процент и программу
watch(walletAmountValue, (newWallet) => {
  if (!canMoveSlider.value) return;

  // Пересчитываем программу
  capitalAmountValue.value = availableForProgram.value - newWallet;

  // Обновляем процент слайдера
  // 0% = все в кошелек, 100% = все в программу
  if (maxWalletAmount.value > 0) {
    const calculatedPercentage = ((maxWalletAmount.value - newWallet) / maxWalletAmount.value) * 100;
    sliderPercentage.value = Math.max(0, Math.min(100, calculatedPercentage));
  }
});

// Watch на сумму программы - обновляем кошелек
watch(capitalAmountValue, (newCapital) => {
  if (!canMoveSlider.value) return;

  const newWallet = availableForProgram.value - newCapital;
  if (newWallet !== walletAmountValue.value) {
    walletAmountValue.value = Math.max(0, Math.min(newWallet, maxWalletAmount.value));
  }
});

// Цвет слайдера в зависимости от положения
const sliderColor = computed(() => {
  if (!canMoveSlider.value) return 'grey';
  // Красный: только когда все в кошелек (0%)
  if (sliderPercentage.value < 38) return 'red';
  // Teal: любое смещение вправо (1-100%)
  return 'teal';
});

// Цвет selection (трека) слайдера
const sliderSelectionColor = computed(() => {
  if (!canMoveSlider.value) return 'grey-4';
  if (sliderPercentage.value < 38) return 'red';
  return 'teal';
});

// Подсказка для слайдера
const sliderLabel = computed(() => {
  return `${Math.round(sliderPercentage.value)}%`;
});

// Валидация распределения (как в контракте)
const isValidDistribution = computed(() => {
  const total = walletAmountValue.value + capitalAmountValue.value;
  // total_convert == available_for_program
  const totalMatches = Math.abs(total - availableForProgram.value) < 1;
  // wallet_amount <= available_for_wallet
  const walletValid = walletAmountValue.value <= availableForWallet.value;
  // capital_amount == available_for_program - wallet_amount
  const capitalValid = Math.abs(capitalAmountValue.value - (availableForProgram.value - walletAmountValue.value)) < 1;

  return totalMatches && walletValid && capitalValid;
});

// Форматирование сумм
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Инициализация значений при открытии диалога
watch(isOpen, (newValue) => {
  if (newValue) {
    if (!canMoveSlider.value) {
      // Если нельзя таскать слайдер - все в программу
      sliderPercentage.value = 100;
      walletAmountValue.value = 0;
      capitalAmountValue.value = availableForProgram.value;
    } else {
      // По умолчанию все доступное в кошелек (0% на слайдере)
      sliderPercentage.value = 0;
      walletAmountValue.value = maxWalletAmount.value;
      capitalAmountValue.value = availableForProgram.value - walletAmountValue.value;
    }
  }
});

// Получение сегмента
const handleConvert = async () => {
  if (!isValidDistribution.value) return;

  loading.value = true;
  try {
    // Генерируем документ, подписываем и конвертируем сегмент
    await convertSegmentWithDocumentGeneration({
      coopname: props.segment.coopname,
      username: props.segment.username,
      project_hash: props.segment.project_hash,
      wallet_amount: walletAmountValue.value,
      capital_amount: capitalAmountValue.value,
    });

    SuccessAlert('Сегмент успешно конвертирован');
    isOpen.value = false;
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.modal-convert-segment {
  min-width: 600px;
  max-width: 800px;
}

.modal-header {
  background: var(--q-primary);
  color: white;
}

.modal-body {
  padding: 24px;
}

.inputs-section {
  .q-input {
    max-width: 200px;
  }
}

.modal-actions {
  padding: 16px 24px;
  background: var(--q-grey-1);
}

.card-input {
  margin-top: 8px;
}

.distribution-section {
  padding: 20px;
  background: var(--q-grey-2);
  border-radius: 8px;
}

.distribution-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.distribution-label {
  margin-top: 4px;
}

.distribution-value {
  margin-top: 2px;
}


</style>
