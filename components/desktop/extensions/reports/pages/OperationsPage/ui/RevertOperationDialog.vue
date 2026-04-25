<template lang="pug">
q-dialog(
  :model-value='modelValue'
  @update:model-value='emit("update:modelValue", $event)'
  persistent
)
  q-card(style='min-width: 480px; max-width: 560px;')
    q-bar.bg-warning.text-white
      q-icon(name='fa-solid fa-rotate-left' size='sm')
      .text-subtitle1.q-ml-sm Откат операции
      q-space
      q-btn(flat dense icon='fa-solid fa-xmark' @click='close')
        q-tooltip Закрыть

    q-card-section.q-pa-md(v-if='operation')
      .text-caption.text-grey-7.q-mb-md
        | Зеркальная проводка по выбранной операции. Балансы вернутся к состоянию ДО оригинала.
        | Откат миграционных операций (o.mig.*) запрещён. Доступен только председателю.

      q-card.q-mb-md(flat bordered)
        q-card-section.q-pa-sm
          .row.items-center.q-gutter-sm
            .col
              .text-caption.text-grey-6 Операция
              .text-body2.text-weight-medium {{ operationLabel }}
            .col-auto
              q-chip(dense square color='grey-3' text-color='grey-9') {{ operation.operationCode }}
          .row.q-mt-xs
            .col-6
              .text-caption.text-grey-6 Сумма
              .text-body2.font-monospace {{ operation.quantity || '—' }}
            .col-6
              .text-caption.text-grey-6 Пайщик
              .text-body2 {{ operation.username || '—' }}
          .row.q-mt-xs(v-if='operation.processHash')
            .col-12
              .text-caption.text-grey-6 ID оригинального процесса
              .text-caption.font-monospace {{ operation.processHash }}

      q-banner.bg-amber-1.text-amber-9.q-mb-md(v-if='isMigOperation' dense)
        template(#avatar)
          q-icon(name='fa-solid fa-triangle-exclamation' color='amber-9')
        | Откат миграционных операций (o.mig.*) запрещён.
        | Используйте перевод между кошельками или ручную корректировку через совет.

      q-form(@submit.prevent='submit' v-else)
        q-input(
          v-model='memo'
          label='Причина отката'
          outlined dense type='textarea' rows='3' counter maxlength='255'
          :rules='[(v) => (v && v.trim().length > 0) || "Обязательно — укажите причину"]'
        )

        .row.justify-end.q-gutter-sm.q-mt-md
          q-btn(flat label='Отмена' color='grey-7' :disable='loading' @click='close')
          q-btn(
            type='submit'
            color='warning'
            label='Откатить'
            icon='fa-solid fa-rotate-left'
            :loading='loading'
          )
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Ledger2 } from 'cooptypes'
import { FailAlert, SuccessAlert } from 'src/shared/api'
import { useSystemStore } from 'src/entities/System/model'
import { useLedger2Store, type ILedger2Operation } from 'src/entities/Ledger2'

interface Props {
  modelValue: boolean
  /** Оригинальная apply-операция (из реестра). */
  operation: ILedger2Operation | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', payload: { processHash: string }): void
}>()

const { info } = useSystemStore()
const ledger2Store = useLedger2Store()

const memo = ref('')
const loading = ref(false)

const operationLabel = computed(() => {
  if (!props.operation?.operationCode) return '—'
  return Ledger2.getOperationHumanName(props.operation.operationCode) ?? props.operation.operationCode
})

const isMigOperation = computed(() =>
  !!props.operation?.operationCode && props.operation.operationCode.startsWith('o.mig.'),
)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      memo.value = ''
    }
  },
)

async function submit(): Promise<void> {
  if (!props.operation) return
  if (isMigOperation.value) return

  loading.value = true
  try {
    const result = await ledger2Store.revertOperation({
      coopname: info.coopname,
      originalGlobalSequence: String(props.operation.globalSequence),
      memo: memo.value.trim(),
    })
    SuccessAlert('Операция откачена')
    emit('success', { processHash: result.processHash })
    // Закрываем явно — guard в close() блокирует, пока loading=true.
    emit('update:modelValue', false)
  } catch (e) {
    FailAlert(e)
  } finally {
    loading.value = false
  }
}

function close() {
  if (loading.value) return
  emit('update:modelValue', false)
}
</script>
