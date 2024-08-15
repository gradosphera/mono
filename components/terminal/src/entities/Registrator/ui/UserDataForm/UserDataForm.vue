<template lang="pug">
div
  q-form(ref="localUserDataForm")
    slot(name="top")

    div.full-width.text-center
      q-btn-group(flat)
        q-btn(glossy label="Физлицо" :color="userData.type === 'individual' ? 'primary' : undefined" @click="userData.type = 'individual'")
        q-btn(glossy label="Предприниматель"  :color="userData.type === 'entrepreneur' ? 'primary' : undefined" @click="userData.type='entrepreneur'")
        q-btn(glossy label="Организация" :color="userData.type === 'organization' ? 'primary' : undefined" @click="userData.type = 'organization'")

    div(v-if="userData.type === 'individual' && userData.individual_data").q-gutter-md.q-mt-md
      q-input(v-model="userData.individual_data.last_name" filled hint="Иванов" label="Фамилия" :rules="[val => notEmpty(val), val => validateNames(val)]" autocomplete="off")
      q-input(v-model="userData.individual_data.first_name" filled hint="Иван" label="Имя" :rules="[val => notEmpty(val), val => validateNames(val)]" autocomplete="off")
      q-input(v-model="userData.individual_data.middle_name" filled hint="Иванович" label="Отчество" :rules="[val => validateNames(val)]" autocomplete="off")

      q-input(v-model="userData.individual_data.full_address" filled hint="г. Москва, ул. Арбат, д.12" label="Адрес регистрации (как в паспорте)" :rules="[val => notEmpty(val)]" autocomplete="off")

      q-input(
        filled
        v-model="userData.individual_data.birthdate"
        mask="date"
        label="Дата рождения"
        hint="Формат: год/месяц/день"
        :rules="['date', val => notEmpty(val)]"
        autocomplete="off"
      )
        template(v-slot:append)
          q-icon(name="event" class="cursor-pointer")
            q-popup-proxy(cover transition-show="scale" transition-hide="scale")
              q-date(v-model="userData.individual_data.birthdate")
                .row.items-center.justify-end
                  q-btn(v-close-popup label="Close" color="primary" flat)

      q-input(v-model="userData.individual_data.phone" filled mask="+7 (###) ###-##-##" fill-mask label="Номер телефона" hint="+7 (###) ###-##-##" :rules="[val => notEmpty(val), val => notEmptyPhone(val)]" autocomplete="off")

    div(v-if="userData.type === 'organization' && userData.organization_data").q-gutter-md.q-mt-md
      q-select(
        v-model="userData.organization_data.type"
        label="Выберите тип организации"
        filled
        :options="[{ label: 'ООО', value: 'ooo' }, { label: 'Потребительский Кооператив', value: 'coop' }]"
        emit-value
          map-options)
      q-input(v-model="userData.organization_data.short_name" filled hint="ООО Ромашка" label="Краткое наименование организации" :rules="[val => notEmpty(val)]" autocomplete="off")
      q-input(v-model="userData.organization_data.full_name" filled hint="Общество Ограниченной Ответственности 'Ромашка'" label="Полное наименование организации" :rules="[val => notEmpty(val)]" autocomplete="off")
      q-input(v-model="userData.organization_data.represented_by.last_name" filled label="Фамилия представителя" hint="Иванов" :rules="[val => notEmpty(val), val => validateNames(val)]" autocomplete="off")
      q-input(v-model="userData.organization_data.represented_by.first_name" filled label="Имя представителя" hint="Иван" :rules="[val => notEmpty(val), val => validateNames(val)]" autocomplete="off")
      q-input(v-model="userData.organization_data.represented_by.middle_name" filled label="Отчество представителя" hint="Иванович" :rules="[val => validateNames(val)]" autocomplete="off")

      q-input(v-model="userData.organization_data.represented_by.based_on" filled label="Представитель действует на основании" hint="решения учредителей №1 от 01.01.2021 г" :rules="[val => notEmpty(val)]" autocomplete="off")
      q-input(v-model="userData.organization_data.represented_by.position" filled label="Должность представителя" hint="Директор" :rules="[val => notEmpty(val)]" autocomplete="off")

      q-input(v-model="userData.organization_data.phone" filled label="Номер телефона представителя"  mask="+7 (###) ###-##-##" fill-mask  hint="+7 (###) ###-##-##" :rules="[val => notEmpty(val), val => notEmptyPhone(val)]" autocomplete="off")

      q-select(v-model="userData.organization_data.country" filled map-options emit-value option-label="label" option-value="value" label="Страна" :options="[{ label: 'Россия', value: 'Russia' }]" :rules="[val => notEmpty(val)]" autocomplete="off")
      q-input(v-model="userData.organization_data.city" filled label="Город" hint="Москва" :rules="[val => notEmpty(val)]" autocomplete="off")
      q-input(v-model="userData.organization_data.full_address" filled hint="г. Москва, ул. Арбат, д.12" label="Юридический адрес регистрации" :rules="[val => notEmpty(val)]" autocomplete="off")


      q-input(
        v-model="userData.organization_data.details.inn"
        filled
        mask="############"
        label="ИНН организации"
        hint="10 или 12 цифр"
        :rules="[val => notEmpty(val), val => (val.length === 10 || val.length === 12) || 'ИНН должен содержать 10 или 12 цифр']"
        autocomplete="off"
      )

      q-input(
        v-model="userData.organization_data.details.ogrn"
        filled
        mask="###############"
        label="ОГРН организации"
        hint="13 или 15 цифр"
        :rules="[val => notEmpty(val), val => (val.length === 13 || val.length === 15) || 'ОГРН должен содержать 13 или 15 цифр']"
        autocomplete="off"
      )

      q-input(
        v-model="userData.organization_data.bank_account.bank_name"
        filled
        label="Наименование банка"
        hint="ПАО Сбербанк"
        :rules="[val => notEmpty(val)]"
        autocomplete="off"
      )

      q-input(
        v-model="userData.organization_data.bank_account.details.corr"
        filled
        mask="####################"
        label="Корреспондентский счет"
        hint="20 цифр"
        :rules="[val => notEmpty(val), val => val.length === 20 || 'Корреспондентский счет должен содержать 20 цифр']"
        autocomplete="off"
      )
      q-input(
        v-model="userData.organization_data.bank_account.details.bik"
        filled
        mask="#########"
        label="БИК"
        hint="9 цифр"
        :rules="[val => notEmpty(val), val => val.length === 9 || 'БИК должен содержать 9 цифр']"
        autocomplete="off"
      )

      q-input(
        v-model="userData.organization_data.bank_account.details.kpp"
        filled
        mask="#########"
        label="КПП (банка)"
        hint="9 цифр"
        :rules="[val => notEmpty(val), val => val.length === 9 || 'КПП должен содержать 9 цифр']"
        autocomplete="off"
      )

      q-input(
        v-model="userData.organization_data.bank_account.account_number"
        filled
        mask="####################"
        label="Номер счета"
        hint="20 цифр"
        :rules="[val => notEmpty(val), val => val.length === 20 || 'Номер счета должен содержать 20 цифр']"
        autocomplete="off"
      )

      q-select(
        v-model="userData.organization_data.bank_account.currency"
        label="Валюта счёта"
        filled
        :options="[{ label: 'RUB', value: 'RUB' }]"
        emit-value
        :rules="[val => notEmpty(val)]"
        map-options
      )


    div(v-if="userData.type === 'entrepreneur' && userData.entrepreneur_data").q-gutter-md.q-mt-md
      q-input(v-model="userData.entrepreneur_data.last_name" filled hint="Иванов" label="Фамилия" :rules="[val => notEmpty(val), val => validateNames(val)]" autocomplete="off")
      q-input(v-model="userData.entrepreneur_data.first_name" filled hint="Иван" label="Имя" :rules="[val => notEmpty(val), val => validateNames(val)]" autocomplete="off")
      q-input(v-model="userData.entrepreneur_data.middle_name" filled hint="Иванович" label="Отчество" :rules="[val => validateNames(val)]" autocomplete="off")

      q-input(
        filled
        v-model="userData.entrepreneur_data.birthdate"
        mask="date"
        label="Дата рождения"
        hint="Формат: год/месяц/день"
        :rules="['date', val => notEmpty(val)]"
        autocomplete="off"
      )
        template(v-slot:append)
          q-icon(name="event" class="cursor-pointer")
            q-popup-proxy(cover transition-show="scale" transition-hide="scale")
              q-date(v-model="userData.entrepreneur_data.birthdate")
                .row.items-center.justify-end
                  q-btn(v-close-popup label="Close" color="primary" flat)

      q-input(v-model="userData.entrepreneur_data.phone" filled mask="+7 (###) ###-##-##" fill-mask label="Номер телефона" hint="+7 (###) ###-##-##" :rules="[val => notEmpty(val), val => notEmptyPhone(val)]" autocomplete="off")

      q-select(v-model="userData.entrepreneur_data.country" filled map-options emit-value option-label="label" option-value="value" label="Страна" :options="[{ label: 'Россия', value: 'Russia' }]" :rules="[val => notEmpty(val)]" autocomplete="off")

      q-input(v-model="userData.entrepreneur_data.city" filled label="Город" hint="Москва" :rules="[val => notEmpty(val)]" autocomplete="off")
      q-input(v-model="userData.entrepreneur_data.full_address" filled label="Адрес регистрации (как в паспорте)" hint="г. Москва, ул. Арбат, д.12" :rules="[val => notEmpty(val)]" autocomplete="off")

      q-input(
        v-model="userData.entrepreneur_data.details.inn"
        filled
        mask="############"
        label="ИНН предпринимателя"
        hint="10 или 12 цифр"
        :rules="[val => notEmpty(val), val => (val.length === 10 || val.length === 12) || 'ИНН должен содержать 10 или 12 цифр']"
        autocomplete="off"
      )
      q-input(
        v-model="userData.entrepreneur_data.details.ogrn"
        filled
        mask="###############"
        label="ОГРНИП"
        hint="13 или 15 цифр"
        :rules="[val => notEmpty(val), val => (val.length === 13 || val.length === 15) || 'ОГРНИП должен содержать 13 или 15 цифр']"
        autocomplete="off"
      )

      q-input(
        v-model="userData.entrepreneur_data.bank_account.bank_name"
        filled
        label="Наименование банка"
        hint="ПАО Сбербанк"
        :rules="[val => notEmpty(val)]"
        autocomplete="off"
      )

      q-input(
        v-model="userData.entrepreneur_data.bank_account.details.corr"
        filled
        mask="####################"
        label="Корреспондентский счёт"
        hint="20 цифр"
        :rules="[val => notEmpty(val), val => val.length === 20 || 'Корреспондентский счёт должен содержать 20 цифр']"
        autocomplete="off"
      )

      q-input(
        v-model="userData.entrepreneur_data.bank_account.details.bik"
        filled
        mask="#########"
        label="БИК"
        hint="9 цифр"
        :rules="[val => notEmpty(val), val => val.length === 9 || 'БИК должен содержать 9 цифр']"
      )

      q-input(
        v-model="userData.entrepreneur_data.bank_account.details.kpp"
        filled
        mask="#########"
        label="КПП (банка)"
        hint="9 цифр"
        :rules="[val => notEmpty(val), val => val.length === 9 || 'КПП должен содержать 9 цифр']"
        autocomplete="off"
      )

      q-select(v-model="userData.entrepreneur_data.bank_account.currency"
        label="Валюта счёта"
        filled
        :options="[{ label: 'RUB', value: 'RUB' }]"
        emit-value
        map-options
      )

      q-input(
        v-model="userData.entrepreneur_data.bank_account.account_number"
        filled
        mask="####################"
        label="Номер счёта"
        hint="20 цифр"
        :rules="[val => notEmpty(val), val => val.length === 20 || 'Номер счёта должен содержать 20 цифр']"
        autocomplete="off"
      )

    slot(name="bottom" :userDataForm="localUserDataForm" :notEmpty="notEmpty")


  </template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { IUserData } from 'src/entities/User';

import { useRegistratorStore } from '../../model';
const store = useRegistratorStore().state

const userData = ref<IUserData>(store.userData)

if (!userData.value.type)
  userData.value.type = 'individual'

watch(() => userData.value?.organization_data?.type, (newValue) => {
  if (userData.value.organization_data) {
    if (newValue === 'coop') {
      userData.value.organization_data.is_cooperative = true;
    } else {
      userData.value.organization_data.is_cooperative = false;
    }
  }
});

const localUserDataForm = ref(null)

const validateNames = (val: any) => {
  return val === '' || /^[a-zA-Zа-яА-Я\- ]*$/.test(val) || 'Разрешены только буквы латинского алфавита, кириллица, знак - и пробел'
}

const notEmpty = (val: any) => {
  return !!val || 'Это поле обязательно для заполнения'
}

const notEmptyPhone = (val: any) => {
  return val != '+7 (___) ___-__-__' || 'Это поле обязательно для заполнения'
}

</script>
<style>
.dataInput .q-btn-selected {
  color: teal;
}
</style>
