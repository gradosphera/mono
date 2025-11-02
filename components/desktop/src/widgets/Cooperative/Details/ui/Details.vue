<template lang="pug">
div
  q-card(v-if="details" flat bordered).q-pa-sm
    q-input(type="textarea" autogrow readonly label="Полное наименование" v-model="details.full_name")
    q-input(type="textarea" autogrow readonly label="Сокращенное наименование" v-model="details.short_name")
    q-input(type="textarea" autogrow readonly label="ИНН" v-model="details.details.inn")
    q-input(type="textarea" autogrow readonly label="ОГРН" v-model="details.details.ogrn")
    q-input(type="textarea" autogrow readonly label="Юридический адрес" v-model="details.full_address")
    q-input(type="textarea" autogrow readonly label="Телефон" v-model="details.phone")
    q-input(type="textarea" autogrow readonly label="Электронная почта" v-model="details.email")
    q-input(type="textarea" autogrow readonly label="Председатель" v-model="chairman")
    //- q-input(type="textarea" autogrow readonly label="Наименование банка" v-model="details.bank_account.bank_name")
    //- q-input(type="textarea" autogrow readonly label="БИК" v-model="details.bank_account.details.bik")
    //- q-input(type="textarea" autogrow readonly label="Корреспондентский счёт" v-model="details.bank_account.details.corr")
    //- q-input(type="textarea" autogrow readonly label="Номер счета" v-model="details.bank_account.account_number")


</template>

<script lang="ts" setup>
import { useCooperativeStore } from 'src/entities/Cooperative';
import { computed } from 'vue';

const cooperative = useCooperativeStore()
cooperative.loadPrivateCooperativeData()

const details = computed(() => cooperative.privateCooperativeData)
const chairman = computed(() => `${details.value?.chairman?.last_name} ${details.value?.chairman?.first_name} ${details.value?.chairman?.middle_name}`)

</script>
