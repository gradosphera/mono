<template lang="pug">
div.row.q-pa-md
  div.col-md-12.col-xs-12
    div(v-if="system.info.is_providered")
      ConnectionAgreementStepper(
        :initial-step="currentStep"
        :is-finish="is_finish"
        :signed-document="signedDocument"
        :coop="coop"
        :html="html"
        :domain-valid="domainValid"
        :installation-progress="installationProgress"
        :instance-status="instanceStatus"
        :subscriptions-loading="subscriptionsLoading"
        :subscriptions-error="subscriptionsError"
        @step-change="handleStepChange"
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
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useLoadCooperatives } from 'src/features/Union/LoadCooperatives';
import { useProviderSubscriptions } from 'src/features/Provider';
import { Cooperative } from 'cooptypes';
import { ConnectionAgreementStepper } from 'src/widgets/ConnectionAgreementStepper';
import { ColorCard } from 'src/shared/ui';


const session = useSessionStore()
const system = useSystemStore()
const document = ref(new DigitalDocument())
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

const html = computed(() => document.value?.data?.html)
const signedDocument = computed(() => document.value?.signedDocument)
const is_finish = ref(false)

// Управление шагом степпера
const currentStep = ref(1)

const handleStepChange = (step: number) => {
  currentStep.value = step
}

const handleTariffSelected = (tariff: any) => {
  // Здесь можно сохранить выбранный тариф
  console.log('Selected tariff:', tariff)
}

const handleTariffDeselected = () => {
  // Здесь можно обработать снятие выбора тарифа
  console.log('Tariff deselected')
}

// Остановка автообновления при размонтировании компонента
let stopRefresh: (() => void) | null = null

const handleContinue = async () => {
  // Если документ еще не сгенерирован, генерируем его
  if (!document.value.data?.html && !coop.value) {
    await document.value.generate({
      registry_id: Cooperative.Registry.CoopenomicsAgreement.registry_id,
      coopname: 'voskhod',
      username: session.username,
    })
  }
}

const openProviderWebsite = () => {
  window.open('https://цифровой-кооператив.рф', '_blank')
}


const finish = () => {
  // Эта функция имеет смысл только если провайдер доступен
  if (!system.info.is_providered) return

  is_finish.value = true
  reload()

  // Запускаем автообновление подписок каждую минуту
  if (!stopRefresh) {
    stopRefresh = startAutoRefresh(60000) // 1 минута
  }
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

  coop.value = await loadOneCooperative(session.username)

  if (!coop.value) {
    await document.value.generate({
      registry_id: Cooperative.Registry.CoopenomicsAgreement.registry_id,
      coopname: 'voskhod',
      username: session.username,
    })
  } else {
    is_finish.value = true
    currentStep.value = 4 // Переходим на последний шаг если кооператив уже создан
  }
}

const sign = async() => {
  await document.value.sign(session.username)
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

init()


/**
 * Здесь необходимо получить соглашение для подключения и проверить заполнено ли оно.
 *
 *
 */
</script>
