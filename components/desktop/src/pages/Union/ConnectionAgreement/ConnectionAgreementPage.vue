<template lang="pug">
div.row.q-pa-md
  div.col-md-12.col-xs-12
    div(v-if="system.info.is_providered")
      ConnectionAgreementStepper(
        :coop="coop"
        :domain-valid="domainValid"
        :installation-progress="installationProgress"
        :instance-status="instanceStatus"
        :subscriptions-loading="subscriptionsLoading"
        :subscriptions-error="subscriptionsError"
      )

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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement';
import { useLoadCooperatives } from 'src/features/Union/LoadCooperatives';
import { useProviderSubscriptions } from 'src/features/Provider';
import { ConnectionAgreementStepper } from 'src/widgets/ConnectionAgreementStepper';
import { ColorCard } from 'src/shared/ui';

const session = useSessionStore()
const system = useSystemStore()
const connectionAgreement = useConnectionAgreementStore()
const { loadOneCooperative } = useLoadCooperatives()
const {
  domainValid,
  installationProgress,
  instanceStatus,
  isLoading: subscriptionsLoading,
  error: subscriptionsError,
  startAutoRefresh
} = useProviderSubscriptions()

const coop = ref()

// Остановка автообновления при размонтировании компонента
let stopRefresh: (() => void) | null = null

const openProviderWebsite = () => {
  window.open('https://цифровой-кооператив.рф', '_blank')
}

// Загружаем кооператив
const loadCooperative = async () => {
  if (system.info.is_providered) {
    coop.value = await loadOneCooperative(session.username)
  }
}

const init = async () => {
  // Инициализация имеет смысл только если провайдер доступен
  if (!system.info.is_providered) return

  // Инициализируем persistent store если он еще не инициализирован
  if (!connectionAgreement.isInitialized) {
    connectionAgreement.setInitialized(true)
  }

  // Загружаем кооператив
  await loadCooperative()

  // Если кооператив существует, инициализируем данные формы из него
  if (coop.value) {
    const formData = {
      announce: coop.value.announce || '',
      initial: parseFloat(coop.value.initial || '0').toString(),
      minimum: parseFloat(coop.value.minimum || '0').toString(),
      org_initial: parseFloat(coop.value.org_initial || '0').toString(),
      org_minimum: parseFloat(coop.value.org_minimum || '0').toString()
    }
    connectionAgreement.setFormData(formData)
  }
}

const finish = () => {
  // Эта функция имеет смысл только если провайдер доступен
  if (!system.info.is_providered) return

  // Запускаем автообновление подписок каждую минуту
  if (!stopRefresh) {
    stopRefresh = startAutoRefresh(60000) // 1 минута
  }

  // Сбрасываем persistent состояние после завершения
  connectionAgreement.reset()
}

// Watch за изменением шага для автоматического завершения
watch(() => connectionAgreement.currentStep, (newStep) => {
  if (newStep >= 5) {
    finish()
  }
})

// Lifecycle хуки
onMounted(() => {
  // Если провайдер доступен - делаем полную инициализацию
  if (system.info.is_providered) {
    init()
  }
  // Если провайдер недоступен - ничего не делаем, показываем заглушку
})

onUnmounted(() => {
  // Останавливаем автообновление при размонтировании компонента
  if (stopRefresh) {
    stopRefresh()
    stopRefresh = null
  }
})

/**
 * Здесь необходимо получить соглашение для подключения и проверить заполнено ли оно.
 *
 *
 */
</script>
