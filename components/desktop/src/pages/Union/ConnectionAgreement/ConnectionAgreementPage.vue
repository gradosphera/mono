<template lang="pug">
div.row.q-pa-md
  div.col-md-12.col-xs-12
    div(v-if="system.info.is_providered")
      ConnectionAgreementStepper(
        :initial-step="currentStep"
        :is-finish="currentStep >= 5"
        :document="document"
        :signed-document="signedDocument"
        :coop="coop"
        :html="html"
        :domain-valid="domainValid"
        :installation-progress="installationProgress"
        :instance-status="instanceStatus"
        :subscriptions-loading="subscriptionsLoading"
        :subscriptions-error="subscriptionsError"
        :selected-tariff="connectionAgreement.selectedTariff"
        @step-change="handleStepChange"
        @clear-signed-document="handleClearSignedDocument"
        @tariff-selected="handleTariffSelected"
        @tariff-deselected="handleTariffDeselected"
        @continue="handleContinue"
        @sign="sign"
        @finish="finish"
        @reload="reload"
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
import { DigitalDocument } from 'src/shared/lib/document';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useLoadCooperatives } from 'src/features/Union/LoadCooperatives';
import { useProviderSubscriptions } from 'src/features/Provider';
import { Cooperative } from 'cooptypes';
import { ConnectionAgreementStepper } from 'src/widgets/ConnectionAgreementStepper';
import { ColorCard } from 'src/shared/ui';


const session = useSessionStore()
const system = useSystemStore()
const connectionAgreement = useConnectionAgreementStore()
const {loadOneCooperative} = useLoadCooperatives()
const {
  domainValid,
  installationProgress,
  instanceStatus,
  isLoading: subscriptionsLoading,
  error: subscriptionsError,
  startAutoRefresh
} = useProviderSubscriptions()

const coop = ref()

// Восстанавливаем документы из persistent store или создаем новые
const document = computed({
  get: () => {
    if (connectionAgreement.document) {
      // Если есть сохраненный документ, пересоздаем экземпляр DigitalDocument
      const doc = new DigitalDocument()
      if (connectionAgreement.document.data) {
        doc.data = connectionAgreement.document.data
      }
      if (connectionAgreement.document.signedDocument) {
        doc.signedDocument = connectionAgreement.document.signedDocument
      }
      return doc
    }
    return new DigitalDocument()
  },
  set: (value) => connectionAgreement.setDocument(value)
})

const signedDocument = computed({
  get: () => connectionAgreement.signedDocument || document.value?.signedDocument,
  set: (value) => connectionAgreement.setSignedDocument(value)
})

const html = computed(() => document.value?.data?.html)

// Используем persistent store для управления шагом
const currentStep = computed({
  get: () => connectionAgreement.currentStep,
  set: (value) => connectionAgreement.setCurrentStep(value)
})

const handleStepChange = async (step: number) => {
  currentStep.value = step

  // Если переходим к шагу 2 (соглашение), всегда генерируем документ заново
  if (step === 2) {
    const newDoc = new DigitalDocument()
    await newDoc.generate({
      registry_id: Cooperative.Registry.CoopenomicsAgreement.registry_id,
      coopname: 'voskhod',
      username: session.username,
    })
    document.value = newDoc
    connectionAgreement.setDocument(newDoc)
  }
}

const handleClearSignedDocument = async () => {
  // Очищаем подписанный документ и регенерируем документ при возврате на шаг 2
  signedDocument.value = null
  connectionAgreement.setSignedDocument(null)

  // Регенерируем документ заново и убеждаемся что он сохраняется
  const newDoc = new DigitalDocument()
  await newDoc.generate({
    registry_id: Cooperative.Registry.CoopenomicsAgreement.registry_id,
    coopname: 'voskhod',
    username: session.username,
  })
  document.value = newDoc
  connectionAgreement.setDocument(newDoc)
}

const handleTariffSelected = (tariff: any) => {
  // Сохраняем выбранный тариф в persistent store
  connectionAgreement.setSelectedTariff(tariff)
  console.log('Selected tariff:', tariff)
}

const handleTariffDeselected = () => {
  // Очищаем выбранный тариф в persistent store
  connectionAgreement.setSelectedTariff(null)
  console.log('Tariff deselected')
}

// Остановка автообновления при размонтировании компонента
let stopRefresh: (() => void) | null = null

const handleContinue = () => {
  // Документ будет сгенерирован при переходе к шагу 2
}

const openProviderWebsite = () => {
  window.open('https://цифровой-кооператив.рф', '_blank')
}


const finish = () => {
  // Эта функция имеет смысл только если провайдер доступен
  if (!system.info.is_providered) return

  reload()

  // Запускаем автообновление подписок каждую минуту
  if (!stopRefresh) {
    stopRefresh = startAutoRefresh(60000) // 1 минута
  }

  // Сбрасываем persistent состояние после завершения
  connectionAgreement.reset()
}

//todo loadCooperative by username and check status
const reload = async() => {
  // Загружаем кооператив только если провайдер доступен
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

  coop.value = await loadOneCooperative(session.username)

  if (!coop.value) {
    // Если кооператива нет и мы на шаге 1, документ будет сгенерирован в handleContinue
    // Если пользователь еще не прошел ни одного шага, начинаем с первого
    if (currentStep.value === 1) {
      // Уже на первом шаге
    }
  } else {
    // Если кооператив существует, переходим на соответствующий шаг
    // Определяем шаг в зависимости от статуса кооператива и домена
    if (coop.value.status === 'active' && domainValid.value === true) {
      currentStep.value = 5 // Установка и настройка
    } else if (coop.value.status === 'pending') {
      currentStep.value = 5 // Ожидание одобрения (последний шаг)
    } else if (domainValid.value === true) {
      currentStep.value = 5 // Домен валиден, переходим к установке
    } else {
      currentStep.value = 4 // Проверка домена
    }
  }
}

const sign = async() => {
  await document.value.sign(session.username)
  signedDocument.value = document.value.signedDocument
}

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
