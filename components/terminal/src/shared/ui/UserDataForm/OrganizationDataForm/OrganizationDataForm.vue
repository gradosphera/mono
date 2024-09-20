<template lang="pug">
div(v-if="userData.organization_data").q-gutter-sm.q-mt-md
  q-select(
    v-model="userData.organization_data.type"
    label="Выберите тип организации"
    filled
    :options="[{ label: 'ООО', value: 'ooo' }, { label: 'Потребительский Кооператив', value: 'coop' }]"
    emit-value
    map-options).q-mb-md
  q-input(v-model="userData.organization_data.short_name" filled hint="ООО Ромашка" label="Краткое наименование организации" :rules="[val => notEmpty(val)]" autocomplete="off")
  q-input(v-model="userData.organization_data.full_name" filled hint="Общество Ограниченной Ответственности 'Ромашка'" label="Полное наименование организации" :rules="[val => notEmpty(val)]" autocomplete="off")
  q-input(v-model="userData.organization_data.represented_by.last_name" filled label="Фамилия представителя" hint="Иванов" :rules="[val => notEmpty(val), val => validatePersonalName(val)]" autocomplete="off")
  q-input(v-model="userData.organization_data.represented_by.first_name" filled label="Имя представителя" hint="Иван" :rules="[val => notEmpty(val), val => validatePersonalName(val)]" autocomplete="off")
  q-input(v-model="userData.organization_data.represented_by.middle_name" filled label="Отчество представителя" hint="Иванович" :rules="[val => validatePersonalName(val)]" autocomplete="off")

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
    v-model="userData.organization_data.details.kpp"
    filled
    mask="#########"
    label="КПП организации"
    hint="9 цифр"
    :rules="[val => notEmpty(val), val => val.length === 9 || 'КПП должен содержать 9 цифр']"
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

</template>

<script setup lang="ts">
import { validatePersonalName, notEmpty, notEmptyPhone } from 'src/shared/lib/utils';

import type { IUserData } from 'src/shared/lib/types/user/IUserData';
import { ref } from 'vue';

const props = defineProps<{ userData: IUserData }>();

const userData = ref<IUserData>(props.userData)

</script>
