<template lang="pug">
div.row.q-pa-md
  div.col-md-12.col-xs-12
    div(v-if="system.info.is_providered")

      //- Показываем дашборд если установка завершена
      ConnectionDashboard(
        v-if="isInstallationCompleted"
      )

      //- Показываем степпер если установка не завершена
      ConnectionAgreementStepper(v-else)


    div(v-else).row
      //- Заглушка для недоступного провайдера
      div.col-md-12.col-xs-12
        ColorCard(color="blue")
          .text-center.q-pa-md
            q-icon(name="fas fa-info-circle" size="2rem").q-mb-sm
            .text-h6.q-mb-md Информация о подключении
            p Для подключения к платформе Кооперативной Экономики обратитесь в ПК ВОСХОД.
            q-btn(
              color="primary"
              label="Перейти на сайт"
              @click="openProviderWebsite"
              size="md"
            ).q-mt-md

</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement';
import { ConnectionAgreementStepper } from 'src/widgets/ConnectionAgreementStepper';
import { ConnectionDashboard } from 'src/widgets/ConnectionDashboard';
import { ColorCard } from 'src/shared/ui';
import {Zeus} from '@coopenomics/sdk';

const system = useSystemStore()
const connectionAgreement = useConnectionAgreementStore()

// Остановка автообновления при размонтировании компонента
let stopInstanceRefresh: (() => void) | null = null

// Проверка завершения установки
const isInstallationCompleted = computed(() => {
  // Не показываем поздравление если идет загрузка или есть ошибка
  if (connectionAgreement.currentInstanceLoading || connectionAgreement.currentInstanceError) {
    return false
  }

  const instance = connectionAgreement.currentInstance
  return instance?.progress === 100 && instance?.status === Zeus.InstanceStatus.ACTIVE
})

const openProviderWebsite = () => {
  window.open('https://цифровой-кооператив.рф', '_blank')
}

const init = async () => {
  // Инициализация имеет смысл только если провайдер доступен
  if (!system.info.is_providered) return

  // Инициализируем persistent store если он еще не инициализирован
  if (!connectionAgreement.isInitialized) {
    connectionAgreement.setInitialized(true)
  }


  // Загружаем текущий инстанс
  await connectionAgreement.loadCurrentInstance()

  // Запускаем автообновление инстанса каждые 30 секунд
  stopInstanceRefresh = connectionAgreement.startInstanceAutoRefresh(30000)
}

// Watch за изменением currentInstance для автоматического перехода между шагами
watch(() => connectionAgreement.currentInstance, (instance) => {
  // Не обрабатываем изменения если идет загрузка или есть ошибка
  if (connectionAgreement.currentInstanceLoading || connectionAgreement.currentInstanceError) {
    return
  }

  if (!instance) return

  const currentStep = connectionAgreement.currentStep

  console.log('📊 Instance обновлен:', {
    step: currentStep,
    is_valid: instance.is_valid,
    is_delegated: instance.is_delegated,
    blockchain_status: instance.blockchain_status,
    progress: instance.progress,
    status: instance.status
  })

  // Логика автоматических переходов (только для шагов 4, 5, 6)
  if (currentStep === 4) {
    // Шаг 4: Проверка домена
    if (instance.is_valid && instance.is_delegated) {
      // Домен валиден и делегирован
      if (instance.blockchain_status === 'active') {
        // Можно переходить сразу к установке
        console.log('✅ Домен готов и blockchain_status активен → переход к шагу 6')
        connectionAgreement.setCurrentStep(6)
      } else {
        // Ожидаем подтверждения от союза
        console.log('⏳ Домен готов, но ожидаем подтверждения → переход к шагу 5')
        connectionAgreement.setCurrentStep(5)
      }
    }
  } else if (currentStep === 5) {
    // Шаг 5: Ожидание подтверждения от союза
    if (instance.blockchain_status === 'active') {
      console.log('✅ Подтверждение получено → переход к шагу 6')
      connectionAgreement.setCurrentStep(6)
    }
  } else if (currentStep === 6) {
    // Шаг 6: Установка
    if (instance.progress === 100 && instance.status === Zeus.InstanceStatus.ACTIVE) {
      console.log('🎉 Установка завершена!')
      // Не переходим автоматически, просто покажется дашборд через computed
    }
  }
}, { deep: true })

// Lifecycle хуки
onMounted(() => {
  // Если провайдер доступен - делаем полную инициализацию
  if (system.info.is_providered) {
    init()
  }
  // Если провайдер недоступен - ничего не делаем, показываем заглушку
})

onUnmounted(() => {
  // Останавливаем автообновление инстанса при размонтировании компонента
  if (stopInstanceRefresh) {
    stopInstanceRefresh()
    stopInstanceRefresh = null
  }
})
</script>
