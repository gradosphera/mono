<template lang="pug">
div.row.justify-center.q-pa-md
  div.col-md-8.col-xs-12
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
        q-badge(v-if="coop.status == 'pending'" color="orange").q-ml-sm на утверждении
        q-badge(v-if="coop.status == 'active'" color="teal").q-ml-sm активен
        q-badge(v-if="coop.status == 'blocked'" color="red").q-ml-sm заблокирован

        q-btn(@click="reload" color="primary" size="sm").q-ml-md
          q-icon(name="refresh")
          span обновить

      p Пожалуйста, перешлите инструкцию ниже вашему техническому специалисту. После её выполнения, мы автоматически выполним запуск. Далее, Вам необходимо завершить установку уже на Вашем сайте следуя инструкциям, представленным там.

      q-card(flat bordered).q-pa-sm
        p.text-bold Инструкция
        div.flex.justify-between
          span {{instruction}}
          q-btn(size="sm" icon="fas fa-copy" flat @click="copy")

</template>
<script setup lang="ts">
import { DigitalDocument } from 'src/entities/Document';
import { useSessionStore } from 'src/entities/Session';
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
import { computed, ref } from 'vue';
import { Loader } from 'src/shared/ui/Loader';
import { AddCooperativeForm } from 'src/features/Union/AddCooperative';
import { useLoadCooperatives } from 'src/features/Union/LoadCooperatives';
import { copyToClipboard } from 'quasar';
import { SuccessAlert } from 'src/shared/api';
import { Cooperative } from 'cooptypes';

const session = useSessionStore()
const document = ref(new DigitalDocument())
const {loadOneCooperative} = useLoadCooperatives()

const coop = ref()
const instruction = computed(() => `Создайте A-запись домена ${coop.value?.announce} на IP-адрес: 95.174.93.156`)

const html = computed(() => document.value?.data?.html)
const signedDocument = computed(() => document.value?.signedDocument)
const is_finish = ref(false)

const copy = () => {
  copyToClipboard(instruction.value)
    .then(() => {
      SuccessAlert('Инструкция скопирована в буфер')
    })
    .catch((e) => {
      console.log(e)
    })
}


const finish = () => {
  is_finish.value = true
  reload()
}

//todo loadCooperative by username and check status
const reload = async() => {
  coop.value = await loadOneCooperative(session.username)
}

const init = async () => {
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
  await document.value.sign()
}

init()


/**
 * Здесь необходимо получить соглашение для подключения и проверить заполнено ли оно.
 *
 *
 */
</script>
