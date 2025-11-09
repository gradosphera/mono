<template lang="pug">
div.row.justify-center.q-pa-md
  div.col-md-8.col-xs-12
    div(v-if="system.info.is_providered")
      div(v-if="is_finish == false")
        div(v-if="!signedDocument")
          div(v-if="html")
            DocumentHtmlReader(:html="html")
            q-btn(@click="sign" color="primary") подписать

          div(v-else)
            Loader(:text='`Готовим соглашение...`')

        div(v-else)
          p.text-h6 Предварительная настройка
          p Пожалуйста, укажите домен для установки MONO. Также, укажите суммы вступительных и минимальных паевых взносов для физических лиц, юридических лиц и индивидуальных предпринимателей:

          AddCooperativeForm(:document="signedDocument" @finish="finish").q-pt-md
      div(v-if="is_finish == true && coop")

      p.text-h6 Кооператив на подключении
      p Статус:
        q-badge(v-if="coop.status == 'pending'" color="orange").q-ml-sm ожидание
        q-badge(v-if="coop.status == 'active'" color="teal").q-ml-sm активен
        q-badge(v-if="coop.status == 'blocked'" color="red").q-ml-sm заблокирован

        q-btn(@click="reload" color="primary" size="sm").q-ml-md
          q-icon(name="refresh")
          span обновить

    div(v-else)
      //- Заглушка для недоступного провайдера
      q-banner(
        :class="'text-white bg-blue-500'"
        rounded
      )
        template(v-slot:avatar)
          q-icon(name="info" color="white")
        span Для подключения к Кооперативной Экономике обратитесь в ПК ВОСХОД
        q-btn(
          flat
          color="white"
          label="Перейти на сайт"
          @click="openProviderWebsite"
          size="sm"
        ).q-ml-md

    div(v-if="system.info.is_providered").q-mt-md
      p.text-subtitle1 Статус подписки на хостинг:

      //- Статус подписки (только если провайдер доступен)
      div
          div(
            v-if="subscriptionsError"
          ).q-mb-md
            q-banner(
              :class="'text-white bg-red-500'"
              rounded
            )
              template(v-slot:avatar)
                q-icon(name="error" color="white")
              span {{ subscriptionsError }}

          div.flex.items-center.q-gutter-sm
          div
            span.text-body2 Валидность домена:
            q-badge(
              v-if="domainValid === true"
              color="green"
            ).q-ml-sm валиден
            q-badge(
              v-if="domainValid === false"
              color="red"
            ).q-ml-sm не валиден
            q-badge(
              v-if="domainValid === null && !subscriptionsLoading"
              color="grey"
            ).q-ml-sm неизвестно
            q-badge(
              v-if="subscriptionsLoading"
              color="blue"
            ).q-ml-sm загрузка...

          div
            span.text-body2 Прогресс установки:
            q-badge(
              v-if="installationProgress !== null"
              :color="installationProgress === 100 ? 'green' : 'orange'"
            ).q-ml-sm {{ installationProgress }}%
            q-badge(
              v-if="installationProgress === null && !subscriptionsLoading"
              color="grey"
            ).q-ml-sm неизвестно
            q-badge(
              v-if="subscriptionsLoading"
              color="blue"
            ).q-ml-sm загрузка...

          div
            span.text-body2 Статус сервера:
            q-badge(
              v-if="instanceStatus"
              :color="instanceStatus === 'active' ? 'green' : instanceStatus === 'error' ? 'red' : 'orange'"
            ).q-ml-sm {{ instanceStatus }}
            q-badge(
              v-if="!instanceStatus && !subscriptionsLoading"
              color="grey"
            ).q-ml-sm неизвестно
            q-badge(
              v-if="subscriptionsLoading"
              color="blue"
            ).q-ml-sm загрузка...

      p Пожалуйста, перешлите инструкцию ниже вашему техническому специалисту. После её выполнения, мы автоматически выполним запуск. Далее, Вам необходимо завершить установку уже на Вашем сайте следуя инструкциям, представленным там.

      q-card(flat bordered).q-pa-sm
        p.text-bold Инструкция
        div.flex.justify-between
          span {{instruction}}
          q-btn(size="sm" icon="fas fa-copy" flat @click="copy")

</template>
<script setup lang="ts">
import { DigitalDocument } from 'src/shared/lib/document';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Loader } from 'src/shared/ui/Loader';
import { AddCooperativeForm } from 'src/features/Union/AddCooperative';
import { useLoadCooperatives } from 'src/features/Union/LoadCooperatives';
import { useProviderSubscriptions } from 'src/features/Provider';
import { copyToClipboard } from 'quasar';
import { SuccessAlert } from 'src/shared/api';
import { Cooperative } from 'cooptypes';

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
const instruction = computed(() => `Создайте A-запись домена ${coop.value?.announce} на IP-адрес: 51.250.114.13`)

const html = computed(() => document.value?.data?.html)
const signedDocument = computed(() => document.value?.signedDocument)
const is_finish = ref(false)

// Остановка автообновления при размонтировании компонента
let stopRefresh: (() => void) | null = null

const copy = () => {
  copyToClipboard(instruction.value)
    .then(() => {
      SuccessAlert('Инструкция скопирована в буфер')
    })
    .catch((e) => {
      console.log(e)
    })
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

  if (!coop.value)
    await document.value.generate({
      registry_id: Cooperative.Registry.CoopenomicsAgreement.registry_id,
      coopname: 'voskhod',
      username: session.username,
    })
  else is_finish.value = true
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
