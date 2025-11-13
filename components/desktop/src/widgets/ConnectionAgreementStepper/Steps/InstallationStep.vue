<template lang="pug">
  q-step(
    :name="6"
    title="Установка платформы"
    icon="cloud_download"
    :done="isDone"
  )
    .installation-container.q-pa-md

      //- Установка в процессе
      div(v-if="instance?.progress < 100")

        //- Заголовок с градиентом
        .installation-header
          .text-h6.installation-title Установка платформы
          .subtitle.text-body2.text-grey-7.q-mt-sm
            | Создание кооперативной цифровой экосистемы

        //- Основная карточка прогресса
        .progress-card.q-mb-xl
          .progress-header
            .progress-title
              q-icon(name="rocket_launch" size="24px" color="primary").q-mr-sm
              span.text-subtitle1.text-weight-medium Прогресс установки

          //- Живой прогресс-бар с анимацией
          .progress-bar-container.q-mt-lg
            .progress-bar-background
              .progress-bar-fill(
                :style="{ width: (instance?.progress || 0) + '%' }"
              )
                .progress-bar-shimmer
            .progress-bar-glow(:style="{ width: (instance?.progress || 0) + '%' }")

          //- Оставшееся время
          .remaining-time.q-mt-md
            .time-display
              q-icon(name="schedule" size="18px" color="primary").q-mr-sm
              span.text-body2 Осталось: {{ remainingTime }} мин

          //- Статус текущего этапа
          .current-stage.q-mt-lg
            .stage-info
              .stage-icon
                q-icon(:name="currentStageIcon" size="32px" :color="currentStageColor")
              .stage-details
                .stage-title.text-body1.text-weight-medium {{ currentStageTitle }}
                .stage-description.text-body2.text-grey-7.q-mt-xs {{ currentStageDescription }}


      //- Установка завершена
      div(v-else)
        .completion-container
          .completion-card
            .completion-header
              .celebration-icon
                q-icon(name="celebration" color="positive" size="80px")
                .sparkle.sparkle-1
                .sparkle.sparkle-2
                .sparkle.sparkle-3
              .completion-title.text-h5.text-positive.q-mt-lg Установка завершена!
              .completion-subtitle.text-body1.text-grey-7.q-mt-sm
            | Ваш кооператив успешно развернут и готов к работе

            .completion-details.q-mt-xl
              .detail-item
                q-icon(name="check_circle" color="positive" size="24px").q-mr-md
                .detail-text
                  .text-body2.text-weight-medium Серверная инфраструктура
                  .text-caption.text-grey-6 Полностью настроена и оптимизирована

              .detail-item.q-mt-md
                q-icon(name="check_circle" color="positive" size="24px").q-mr-md
                .detail-text
                  .text-body2.text-weight-medium Блокчейн интеграция
                  .text-caption.text-grey-6 Подключена и протестирована

              .detail-item.q-mt-md
                q-icon(name="check_circle" color="positive" size="24px").q-mr-md
                .detail-text
                  .text-body2.text-weight-medium База данных
                  .text-caption.text-grey-6 Инициализирована и готова к работе

              .detail-item.q-mt-md
                q-icon(name="check_circle" color="positive" size="24px").q-mr-md
                .detail-text
                  .text-body2.text-weight-medium Платформенные сервисы
                  .text-caption.text-grey-6 Запущены и функционируют

            .next-steps.q-mt-xl
              .text-subtitle2.text-weight-medium.q-mb-md Что дальше?
              .text-body2.text-grey-8
                | Дашборд подключения откроется автоматически через несколько секунд. Здесь вы сможете управлять подписками, просматривать баланс кошелька AXON и настраивать параметры платформы.

</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IStepProps } from '../model/types'
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement'

const props = withDefaults(defineProps<IStepProps>(), {})

const connectionAgreement = useConnectionAgreementStore()

// Получаем данные напрямую из store
const instance = computed(() => connectionAgreement.currentInstance)

const isDone = computed(() => props.isDone)

// Текущий этап (соответствует логике из startup-workflow.service.ts)
const currentStageInfo = computed(() => {
  const progress = instance.value?.progress || 0

  if (progress < 20) {
    return {
      icon: 'settings',
      color: 'primary',
      title: 'Подготовка серверного окружения',
      description: 'Настраиваем инфраструктуру для развертывания платформы'
    }
  } else if (progress < 40) {
    return {
      icon: 'download',
      color: 'info',
      title: 'Загрузка компонентов платформы',
      description: 'Устанавливаем необходимые компоненты и зависимости'
    }
  } else if (progress < 60) {
    return {
      icon: 'storage',
      color: 'warning',
      title: 'Настройка базы данных и хранилищ',
      description: 'Инициализируем базы данных и настраиваем хранилища'
    }
  } else if (progress < 80) {
    return {
      icon: 'security',
      color: 'secondary',
      title: 'Конфигурация блокчейн-интеграции',
      description: 'Подключаем и тестируем блокчейн функциональность'
    }
  } else {
    return {
      icon: 'check_circle',
      color: 'positive',
      title: 'Финализация установки',
      description: 'Выполняем заключительные настройки и тестирование'
    }
  }
})

const currentStageIcon = computed(() => currentStageInfo.value.icon)
const currentStageColor = computed(() => currentStageInfo.value.color)
const currentStageTitle = computed(() => currentStageInfo.value.title)
const currentStageDescription = computed(() => currentStageInfo.value.description)

// Расчет оставшегося времени (общая установка 100 минут)
const remainingTime = computed(() => {
  const progress = instance.value?.progress || 0
  const totalMinutes = 100
  const remaining = totalMinutes - progress
  return Math.max(0, remaining) // Не показываем отрицательные значения
})

// Реактивно следим за изменениями прогресса
import { watch } from 'vue'

watch(() => instance.value?.progress, () => {
  // Ничего не делаем, просто реактивно обновляем отображение
}, { immediate: true })
</script>

<style scoped>
.installation-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

/* Заголовок с градиентом */
.installation-header {
  text-align: center;
  margin-bottom: 2rem;
}

.installation-title {
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 118, 210, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

/* Основная карточка прогресса */
.progress-card {
  border-radius: 20px;
  padding: 2.5rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.progress-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--q-primary) 0%, var(--q-secondary) 50%, var(--q-accent) 100%);
  background-size: 200% 100%;
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--q-primary);
}


/* Живой прогресс-бар */
.progress-bar-container {
  position: relative;
  height: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar-background {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 100%);
}

.progress-bar-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
  border-radius: 20px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 0 20px rgba(25, 118, 210, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.progress-bar-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.6) 30%,
    rgba(255, 255, 255, 0.8) 50%,
    rgba(255, 255, 255, 0.6) 70%,
    transparent 100%
  );
  animation: progress-shimmer 1.2s infinite cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes progress-shimmer {
  0% {
    left: -100%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

.progress-bar-glow {
  position: absolute;
  top: -2px;
  left: 0;
  height: 16px;
  background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 118, 210, 0.3) 100%);
  border-radius: 20px;
  filter: blur(4px);
  opacity: 0.6;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Текущий этап */
.current-stage {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(25, 118, 210, 0.02);
  border-radius: 16px;
  border: 1px solid rgba(25, 118, 210, 0.1);
}

.stage-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stage-icon {
  background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 118, 210, 0.8) 100%);
  border-radius: 50%;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

.stage-details {
  flex: 1;
}

.stage-title {
  color: var(--q-primary);
  margin-bottom: 0.25rem;
}

.stage-description {
  color: #666;
}

/* Оставшееся время */
.remaining-time {
  display: flex;
  justify-content: center;
  align-items: center;
}

.time-display {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(25, 118, 210, 0.1);
}


/* Экран завершения */
.completion-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.completion-card {
  max-width: 600px;
  width: 100%;
  text-align: center;
  padding: 3rem;
  border-radius: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fff9 100%);
  border: 1px solid rgba(76, 175, 80, 0.1);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.completion-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--q-positive) 0%, #4CAF50 50%, var(--q-positive) 100%);
  background-size: 200% 100%;
  animation: completion-shimmer 3s ease-in-out infinite;
}

@keyframes completion-shimmer {
  0%, 100% { background-position: -200% 0; }
  50% { background-position: 200% 0; }
}

.completion-header {
  position: relative;
}

.celebration-icon {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--q-positive);
  border-radius: 50%;
  animation: sparkle 2s infinite ease-in-out;
}

.sparkle-1 {
  top: -10px;
  right: -10px;
  animation-delay: 0s;
}

.sparkle-2 {
  top: 20px;
  left: -15px;
  animation-delay: 0.5s;
}

.sparkle-3 {
  bottom: -5px;
  right: 15px;
  animation-delay: 1s;
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.completion-title {
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--q-positive) 0%, #4CAF50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.completion-details {
  margin-top: 2rem;
  text-align: left;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.1);
  transition: all 0.3s ease;
}

.detail-item:hover {
  transform: translateX(4px);
  background: rgba(76, 175, 80, 0.05);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1);
}

.detail-text {
  margin-left: 1rem;
}

.next-steps {
  margin-top: 2rem;
  text-align: left;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .progress-card {
    padding: 2rem;
  }

  .progress-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }


  .stage-info {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .completion-card {
    padding: 2rem;
  }

  .detail-item {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .time-display {
    padding: 0.5rem 1rem;
  }
}

@media (max-width: 480px) {
  .installation-container {
    padding: 1rem;
  }

  .progress-card {
    padding: 1.5rem;
  }

  .time-display {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
