<template lang="pug">
div
  div(v-if="installStore.vars")
    q-card(flat).q-mb-md
      q-card-section
        div.text-h6 Наименование
        div
          q-badge.q-mr-sm ОПФ+
          | - основа полного наименования
          .text-caption.text-grey Например, ОПФ+: "Потребительский Кооператив Социального Комплекса" или "Потребительский Кооператив"
          .text-caption.text-grey.q-mb-md Ввод осуществляйте без кавычек.
        q-input(
          autofocus
          v-model="installStore.vars.name"
          label="Собственное наименование кооператива"
          placeholder="Ромашка"
          standout="bg-teal text-white"
          hint="Название кооператива без кавычек, которое будет добавляться к ОПФ+"
          :rules="[val => notEmpty(val)]"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.full_abbr"
          label="ОПФ+ в именительном падеже"
          hint="Например: Потребительский Кооператив Социального Комплекса"
          standout="bg-teal text-white"
          :rules="[val => notEmpty(val)]"
        )


        q-input.q-mt-md(
          v-model="installStore.vars.full_abbr_genitive"
          label="ОПФ+ в родительном падеже"
          hint="Например: Потребительского Кооператива Социального Комплекса"
          standout="bg-teal text-white"
          :rules="[val => notEmpty(val)]"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.full_abbr_dative"
          label="ОПФ+ в дательном падеже"
          hint="Например: Потребительскому Кооперативу Социального Комплекса"
          standout="bg-teal text-white"
          :rules="[val => notEmpty(val)]"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.short_abbr"
          label="Краткая аббревиатура ОПФ+"
          hint="Например: ПКСК"
          standout="bg-teal text-white"
          :rules="[val => notEmpty(val)]"
        )

    q-card(flat).q-mb-md
      q-card-section
        div.text-h6 Устав
        p Укажите ссылку на устав вашего кооператива, ознакомиться с которым будет предложено пайщикам при регистрации.
        q-input.q-mt-md(
          v-model="installStore.vars.statute_link"
          label="Ссылка на устав кооператива"
          placeholder="https://example.com/statute.pdf"
          type="url"
          standout="bg-teal text-white"
          :rules="[val => notEmpty(val)]"
        )

    q-card(flat).q-mb-md
      q-card-section
        div.text-h6 Паспортные данные
        p Укажите, должны ли заявления на вступление в кооператив и система в целом запрашивать паспортные данные пайщиков при регистрации.

        q-toggle.q-mt-md(
          v-model="installStore.vars.passport_request"
          label="Запрашивать паспортные данные"
          :true-value="'yes'"
          :false-value="'no'"
          color="teal"
        )

    q-card(flat).q-mb-md
      q-card-section
        div.text-h6 Контактная информация

        //- q-input.q-mt-md(
        //-   v-model="installStore.vars.website"
        //-   label="Веб-сайт"
        //-   standout="bg-teal text-white"
        //- )

        //- q-input.q-mt-md(
        //-   v-model="installStore.vars.contact_email"
        //-   label="Контактный email"
        //-   type="email"
        //-   standout="bg-teal text-white"
        //- )
        p Заполните электронную почту, которая будет размещена в политике конфиденциальности как контактная.
        q-input.q-mt-md(
          v-model="installStore.vars.confidential_email"
          label="Email по вопросам конфиденциальности"
          type="email"
          standout="bg-teal text-white"
          :rules="[val => notEmpty(val)]"
        )

        //- q-input.q-mt-md(
        //-   v-model="installStore.vars.confidential_link"
        //-   label="Конфиденциальная ссылка"
        //-   standout="bg-teal text-white"
        //- )

    div.flex.justify-between.q-mt-md
      q-btn(@click="back" color="grey" label="Назад" icon="arrow_back")
      div.flex.q-gutter-sm
        q-btn(@click="next" color="primary" label="Завершить установку" icon="done" :loading="loading")

</template>

<script lang="ts" setup>
import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useInstallCooperative } from '../../model';
import { notEmpty } from 'src/shared/lib/utils';
import { ref, onMounted } from 'vue';

const installStore = useInstallCooperativeStore()
const { info } = useSystemStore()
const loading = ref(false)

// Функции для генерации текущей даты в нужных форматах

onMounted(() => {
  // Инициализируем переменные если их нет
  if (!installStore.vars) {
    installStore.vars = {
      coopname: info.coopname,
      full_abbr: '',
      full_abbr_genitive: '',
      full_abbr_dative: '',
      short_abbr: '',
      website: window.location.origin,
      name: '',
      confidential_link: window.location.origin + '/privacy',
      confidential_email: '',
      contact_email: '',
      passport_request: 'no',
      statute_link: '',
      wallet_agreement: {
        protocol_number: '',
        protocol_day_month_year: '',
      },
      signature_agreement: {
        protocol_number: '',
        protocol_day_month_year: '',
      },
      privacy_agreement: {
        protocol_number: '',
        protocol_day_month_year: '',
      },
      user_agreement: {
        protocol_number: '',
        protocol_day_month_year: '',
      },
      participant_application: {
        protocol_number: '',
        protocol_day_month_year: '',
      },
    }
  }
})

const back = () => {
  installStore.current_step = 'soviet'
}

const next = async () => {
  try {
    const { install } = useInstallCooperative()
    loading.value = true
    await install()
    await useSystemStore().loadSystemInfo()

    loading.value = false
    installStore.is_finish = true
    installStore.wif = ''
    installStore.soviet = []
    installStore.vars = undefined
    installStore.current_step = 'key'

    SuccessAlert('Установка произведена успешно')
  } catch(e: any){
    FailAlert(e)
    loading.value = false
  }
}


</script>

