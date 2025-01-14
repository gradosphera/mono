<template lang="pug">
div
  q-input(dense v-model="data.phone" standout="bg-teal text-white" label="Телефон")
  q-input(dense v-model="data.email" standout="bg-teal text-white" label="Email")
  q-input(dense v-model="data.short_name" standout="bg-teal text-white" label="Краткое наименование")
  q-input(dense v-model="data.full_name" standout="bg-teal text-white" label="Полное наименование")
  q-input(dense v-model="data.full_address" standout="bg-teal text-white" label="Юридический адрес" type="textarea" rows="2")
  q-input(dense v-model="data.fact_address" standout="bg-teal text-white" label="Фактический адрес" type="textarea" rows="2")
  q-input(dense v-model="data.represented_by.last_name" standout="bg-teal text-white" label="Фамилия представителя")
  q-input(dense v-model="data.represented_by.first_name" standout="bg-teal text-white" label="Имя представителя")
  q-input(dense v-model="data.represented_by.middle_name" standout="bg-teal text-white" label="Отчество представителя")
  q-input(dense v-model="data.represented_by.position" standout="bg-teal text-white" label="Должность")
  q-input(dense v-model="data.represented_by.based_on" standout="bg-teal text-white" label="Действует на основании")
  q-input(dense v-model="data.details.inn" standout="bg-teal text-white" label="ИНН")
  q-input(dense v-model="data.details.ogrn" standout="bg-teal text-white" label="ОГРН")
  q-input(dense v-model="data.details.kpp" standout="bg-teal text-white" label="КПП")

</template>
<script lang="ts" setup>
import {Cooperative} from 'cooptypes'
import { ref, watch } from 'vue';

const props = defineProps({
  organization: {
    type: Object as () => Cooperative.Users.IOrganizationData,
    required: true
  }
})

const data = ref(props.organization)

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
