<template lang="pug">
div
  div(v-if="installStore.vars")
    q-card(flat).q-mb-md
      q-card-section
        div.text-h6 Основная информация

        q-input.q-mt-md(
          v-model="installStore.vars.coopname"
          label="Имя аккаунта (coopname)"
          readonly
          filled
          standout="bg-grey-3 text-black"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.name"
          label="Наименование организации"
          hint="Например: Восход"
          standout="bg-teal text-white"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.full_abbr"
          label="Полная аббревиатура в именительном падеже"
          hint="Например: Потребительский Кооператив"
          standout="bg-teal text-white"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.full_abbr_genitive"
          label="Аббревиатура в родительном падеже"
          hint="Например: Потребительского Кооператива"
          standout="bg-teal text-white"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.full_abbr_dative"
          label="Аббревиатура в дательном падеже"
          hint="Например: Потребительскому Кооперативу"
          standout="bg-teal text-white"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.short_abbr"
          label="Краткая аббревиатура"
          hint="Например: ПК"
          standout="bg-teal text-white"
        )

    q-card(flat).q-mb-md
      q-card-section
        div.text-h6 Контактная информация

        q-input.q-mt-md(
          v-model="installStore.vars.website"
          label="Веб-сайт"
          standout="bg-teal text-white"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.contact_email"
          label="Контактный email"
          type="email"
          standout="bg-teal text-white"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.confidential_email"
          label="Конфиденциальный email"
          type="email"
          standout="bg-teal text-white"
        )

        q-input.q-mt-md(
          v-model="installStore.vars.confidential_link"
          label="Конфиденциальная ссылка"
          standout="bg-teal text-white"
        )

    q-card(flat).q-mb-md
      q-card-section
        div.text-h6 Настройки системы

        q-toggle.q-mt-md(
          v-model="installStore.vars.passport_request"
          label="Запрашивать паспорт при регистрации?"
          :true-value="'yes'"
          :false-value="'no'"
          color="teal"
        )

    q-card(flat).q-mb-md
      q-card-section
        div.text-h6 Протоколы соглашений

        div.q-mt-md
          div.text-subtitle1 Соглашение о кошельке
          q-input.q-mt-sm(
            v-model="installStore.vars.wallet_agreement.protocol_number"
            label="Номер протокола"
            hint="Например: 10-04-2024"
            standout="bg-teal text-white"
          )
          q-input.q-mt-sm(
            v-model="installStore.vars.wallet_agreement.protocol_day_month_year"
            label="Дата протокола"
            hint="Например: 10 апреля 2024 г."
            standout="bg-teal text-white"
          )

        div.q-mt-md
          div.text-subtitle1 Соглашение о подписи
          q-input.q-mt-sm(
            v-model="installStore.vars.signature_agreement.protocol_number"
            label="Номер протокола"
            hint="Например: 10-04-2024"
            standout="bg-teal text-white"
          )
          q-input.q-mt-sm(
            v-model="installStore.vars.signature_agreement.protocol_day_month_year"
            label="Дата протокола"
            hint="Например: 10 апреля 2024 г."
            standout="bg-teal text-white"
          )

        div.q-mt-md
          div.text-subtitle1 Политика конфиденциальности
          q-input.q-mt-sm(
            v-model="installStore.vars.privacy_agreement.protocol_number"
            label="Номер протокола"
            hint="Например: 10-04-2024"
            standout="bg-teal text-white"
          )
          q-input.q-mt-sm(
            v-model="installStore.vars.privacy_agreement.protocol_day_month_year"
            label="Дата протокола"
            hint="Например: 10 апреля 2024 г."
            standout="bg-teal text-white"
          )

        div.q-mt-md
          div.text-subtitle1 Пользовательское соглашение
          q-input.q-mt-sm(
            v-model="installStore.vars.user_agreement.protocol_number"
            label="Номер протокола"
            hint="Например: 10-04-2024"
            standout="bg-teal text-white"
          )
          q-input.q-mt-sm(
            v-model="installStore.vars.user_agreement.protocol_day_month_year"
            label="Дата протокола"
            hint="Например: 10 апреля 2024 г."
            standout="bg-teal text-white"
          )

        div.q-mt-md
          div.text-subtitle1 Заявка участника
          q-input.q-mt-sm(
            v-model="installStore.vars.participant_application.protocol_number"
            label="Номер протокола"
            hint="Например: 14-03-2024"
            standout="bg-teal text-white"
          )
          q-input.q-mt-sm(
            v-model="installStore.vars.participant_application.protocol_day_month_year"
            label="Дата протокола"
            hint="Например: 14 марта 2024 г."
            standout="bg-teal text-white"
          )

    div.flex.justify-between.q-mt-md
      q-btn(@click="back" color="grey" label="Назад" icon="arrow_back")
      div.flex.q-gutter-sm
        q-btn(@click="saveToLocalStorage" color="grey" label="Сохранить" icon="save")
        q-btn(@click="loadFromLocalStorage" color="grey" label="Загрузить" icon="upload")
        q-btn(@click="next" color="primary" label="Завершить установку" icon="done" :loading="loading")

</template>

<script lang="ts" setup>
import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { useSystemStore } from 'src/entities/System/model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { useInstallCooperative } from '../../model';
import { ref, onMounted } from 'vue';

const installStore = useInstallCooperativeStore()
const { info } = useSystemStore()
const loading = ref(false)

onMounted(() => {
  // Инициализируем переменные если их нет
  if (!installStore.vars) {
    installStore.vars = {
      coopname: info.coopname,
      full_abbr: '',
      full_abbr_genitive: '',
      full_abbr_dative: '',
      short_abbr: '',
      website: '',
      name: '',
      confidential_link: '',
      confidential_email: '',
      contact_email: '',
      passport_request: 'no',
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
    await useDesktopStore().healthCheck()

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

// Функция сохранения данных в localStorage
const saveToLocalStorage = () => {
  if (installStore.vars) {
    localStorage.setItem(
      `installVars:${info.coopname}`,
      JSON.stringify(installStore.vars)
    );
    SuccessAlert('Данные сохранены в локальное хранилище')
  }
};

// Функция загрузки данных из localStorage
const loadFromLocalStorage = () => {
  const savedData = localStorage.getItem(`installVars:${info.coopname}`);

  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      installStore.vars = { ...installStore.vars, ...parsedData };
      SuccessAlert('Данные загружены из локального хранилища')
    } catch {
      FailAlert('Ошибка при загрузке данных')
    }
  } else {
    FailAlert('Нет сохраненных данных в локальном хранилище')
  }
};

</script>

