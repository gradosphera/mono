<template lang="pug">
div
  q-card(flat)
    q-card-section
      .text-h6.text-center.q-mb-lg Настройки системы

      // Раздел настроек по умолчанию
      .q-mb-xl
        .text-subtitle1.q-mb-md Настройки по умолчанию
        .text-body2.text-grey-7.q-mb-md
          | Настройте рабочие столы и страницы, которые будут открываться по умолчанию для новых пользователей

        UpdateSettingsForm(
          :loading='saving'
          @submit='onSubmit'
          @success='onSuccess'
          @error='onError'
        )

    // Сообщения
    q-banner(v-if='saveSuccess' class='text-white bg-positive' rounded)
      template(v-slot:avatar)
        q-icon(name='check_circle')
      | Настройки сохранены успешно

    q-banner(v-if='saveError' class='text-white bg-negative' rounded)
      template(v-slot:avatar)
        q-icon(name='error')
      | Ошибка сохранения настроек: {{ saveError }}
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useSystemStore } from 'src/entities/System/model'
import UpdateSettingsForm from 'app/extensions/chairman/features/UpdateSettings/ui/UpdateSettingsForm.vue'

// Состояние компонента
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

// Системный store для доступа к настройкам
const systemStore = useSystemStore()

// Загрузка системной информации при монтировании
onMounted(async () => {
  if (!systemStore.info) {
    await systemStore.loadSystemInfo()
  }
})

// Обработчики событий формы
const onSubmit = () => {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
}

const onSuccess = () => {
  saving.value = false
  saveSuccess.value = true

  // Скрываем сообщение об успехе через 3 секунды
  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}

const onError = (error: Error) => {
  saving.value = false
  saveError.value = error.message || 'Неизвестная ошибка'
  console.error('Ошибка сохранения настроек:', error)
}
</script>

<style scoped>
.q-card {
  max-width: 1200px;
  margin: 0 auto;
}

.text-subtitle1 {
  font-weight: 500;
  color: #1976d2;
}
</style>
