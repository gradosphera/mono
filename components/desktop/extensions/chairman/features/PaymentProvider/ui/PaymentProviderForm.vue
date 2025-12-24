<template lang="pug">
form.full-width(@submit.prevent='submit')
  .q-gutter-md
    // Провайдер платежей по умолчанию
    .row.q-gutter-md
      .col-md-6.col-sm-12
        q-select(
          v-model='formData.provider_name'
          :options='providerOptions'
          label='Провайдер входящих платежей'
          placeholder='Выберите провайдера'
          dense
          standout="bg-teal text-white"
          emit-value
          map-options
          option-value='value'
          option-label='label'
          :loading='loading'
        )

      .col-md-12(v-if='selectedProviderDescription')
        .q-mt-sm.text-caption.text-grey-7 {{ selectedProviderDescription }}

  .q-mt-md
    .row.justify-start.q-gutter-sm
      q-btn(
        flat
        label='Отменить'
        color='grey'
        @click='resetForm'
        :loading='loading'
        :disable='!hasChanges'
      )
      q-btn(
        type='submit'
        label='Сохранить'
        color='primary'
        :loading='loading'
        :disable='!hasChanges'
      )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useSystemStore } from 'src/entities/System/model'
import { usePaymentProvider } from '../model'
import { FailAlert, SuccessAlert } from 'src/shared/api'

interface Props {
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  submit: []
  success: []
  error: [error: Error]
}>()

// Система настроек
const systemStore = useSystemStore()
const { updatePaymentProvider } = usePaymentProvider()

// Данные формы
const formData = ref({
  provider_name: ''
})

// Оригинальные данные для сравнения
const originalData = ref({ ...formData.value })

// Опции провайдеров платежей
const providerOptions = [
  {
    value: 'qrpay',
    label: 'Банковский платеж по QR-коду',
    description: 'Пайщик получает реквизиты для оплаты по QR-коду, который можно отсканировать любым банковским приложением. Обработка платежей производится вручную в разделе "Реестр платежей" кассиром.'
  }
]

// Проверка наличия изменений
const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalData.value)
})

// Описание выбранного провайдера
const selectedProviderDescription = computed(() => {
  const selectedOption = providerOptions.find(option => option.value === formData.value.provider_name)
  return selectedOption?.description || ''
})

// Сброс формы
const resetForm = () => {
  formData.value = { ...originalData.value }
}

// Загрузка данных при монтировании
onMounted(() => {
  if (systemStore.info?.settings) {
    const settings = systemStore.info.settings
    formData.value = {
      provider_name: settings.provider_name || ''
    }
    originalData.value = { ...formData.value }
  }
})

// Отправка формы
const submit = async () => {
  if (!hasChanges.value) return

  emit('submit')

  try {
    await updatePaymentProvider({
      provider_name: formData.value.provider_name,
    })

    // Обновляем оригинальные данные
    originalData.value = { ...formData.value }

    SuccessAlert('Провайдер платежей сохранен успешно')
    emit('success')

  } catch (error: any) {
    console.error('Ошибка сохранения провайдера платежей:', error)
    FailAlert(error)
    emit('error', error)
  }
}
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>
