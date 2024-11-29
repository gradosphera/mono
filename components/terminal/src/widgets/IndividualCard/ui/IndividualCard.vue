<template lang="pug">
div
  q-input(:readonly="readonly" dense v-model="data.phone" standout="bg-teal text-white" label="Телефон")
  q-input(:readonly="readonly" dense v-model="data.email" standout="bg-teal text-white" label="Email")
  q-input(:readonly="readonly" dense v-model="data.first_name" standout="bg-teal text-white" label="Имя")
  q-input(:readonly="readonly" dense v-model="data.last_name" standout="bg-teal text-white" label="Фамилия")
  q-input(:readonly="readonly" dense v-model="data.middle_name" standout="bg-teal text-white" label="Отчество")
  q-input(:readonly="readonly" dense v-model="data.birthdate" standout="bg-teal text-white" label="Дата рождения")
  q-input(:readonly="readonly" dense v-model="data.full_address" standout="bg-teal text-white" label="Адрес регистрации")
  div(v-if="data.passport")
    q-input(:readonly="readonly" dense v-model="data.passport.series" standout="bg-teal text-white" label="Серия паспорта")
    q-input(:readonly="readonly" dense v-model="data.passport.number" standout="bg-teal text-white" label="Номер паспорта")
    q-input(:readonly="readonly" dense v-model="data.passport.issued_by" standout="bg-teal text-white" label="Паспорт выдан")
    q-input(:readonly="readonly" dense v-model="data.passport.issued_at" standout="bg-teal text-white" label="Дата выдачи")
    q-input(:readonly="readonly" dense v-model="data.passport.code" standout="bg-teal text-white" label="Код подразделения")


</template>
<script lang="ts" setup>
import {Cooperative} from 'cooptypes'
import { ref, watch } from 'vue';

const props = defineProps({
  individual: {
    type: Object as () => Cooperative.Users.IIndividualData,
    required: true
  },
  readonly: {
    type: Boolean,
    required: false,
    default: true
  }
})

const data = ref(props.individual)

// const emit = defineEmits(['update']);

const showSave = ref(false)

watch(
    data,
    () => {
      showSave.value = true
    },
    { deep: true }
  );

</script>
