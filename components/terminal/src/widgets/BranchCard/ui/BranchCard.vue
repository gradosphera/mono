<template lang="pug">
div
  q-input(readonly dense v-model="data.braname" standout="bg-teal text-white" label="Имя аккаунта участка" hint=""  autocomplete="off")
  q-input(dense v-model="data.trustee.username" standout="bg-teal text-white" label="Имя аккаунта председателя" hint="" autocomplete="off")
  q-input(dense v-model="data.phone" standout="bg-teal text-white" label="Номер телефона участка"  mask="+7 (###) ###-##-##" fill-mask  hint="" :rules="[val => notEmpty(val), val => notEmptyPhone(val)]" autocomplete="off")
  q-input(dense v-model="data.email" standout="bg-teal text-white" label="Email участка" :rules="[val => validEmail(val)]")
  q-input(dense v-model="data.short_name" standout="bg-teal text-white" label="Краткое наименование" :rules="[val => notEmpty(val)]")
  q-input(dense v-model="data.full_name" standout="bg-teal text-white" label="Полное наименование" :rules="[val => notEmpty(val)]")
  q-input(dense v-model="data.fact_address" standout="bg-teal text-white" label="Фактический адрес" type="textarea" rows="2" :rules="[val => notEmpty(val)]")
  //- q-input(dense v-model="data.represented_by.last_name" standout="bg-teal text-white" label="Фамилия представителя")
  //- q-input(dense v-model="data.represented_by.first_name" standout="bg-teal text-white" label="Имя представителя")
  //- q-input(dense v-model="data.represented_by.middle_name" standout="bg-teal text-white" label="Отчество представителя")
  //- q-input(dense v-model="data.represented_by.position" standout="bg-teal text-white" label="Должность")
  q-input(dense v-model="data.represented_by.based_on" standout="bg-teal text-white" label="Председатель действует на основании" :rules="[val => notEmpty(val)]")
  //- p {{data}}
</template>
<script lang="ts" setup>
import type { IBranch } from 'src/entities/Branch/model';
import { ref } from 'vue';
import { notEmptyPhone } from 'src/shared/lib/utils';
import { notEmpty } from 'src/shared/lib/utils';
import { validEmail } from 'src/shared/lib/utils/validEmailRule';
const props = defineProps({
  branch: {
    type: Object as () => IBranch,
    required: true
  }
})

const data = ref(props.branch)
</script>
