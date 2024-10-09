<template lang="pug">
div
  q-form(ref="localUserDataForm")
    slot(name="top")

    div.full-width.text-center
      q-btn-group(flat)
        q-btn(glossy label="Физлицо" :color="userData.type === 'individual' ? 'primary' : undefined" @click="userData.type = 'individual'")
        q-btn(glossy label="Предприниматель"  :color="userData.type === 'entrepreneur' ? 'primary' : undefined" @click="userData.type='entrepreneur'")
        q-btn(glossy label="Организация" :color="userData.type === 'organization' ? 'primary' : undefined" @click="userData.type = 'organization'")

    div(v-if="userData.type === 'individual'")
      IndividualDataForm(v-model:userData="userData")

    div(v-if="userData.type === 'organization'")
      OrganizationDataForm(v-model:userData="userData")

    div(v-if="userData.type === 'entrepreneur'")
      EntrepreneurDataForm(v-model:userData="userData")

    slot(name="bottom" :userDataForm="localUserDataForm")


  </template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import type { IUserData } from 'src/shared/lib/types/user/IUserData';
import { IndividualDataForm } from '../IndividualDataForm';
import { OrganizationDataForm } from '../OrganizationDataForm';
import { EntrepreneurDataForm } from '../EntrepreneurDataForm';

const props = defineProps<{ userData: IUserData }>();

const userData = ref<IUserData>(props.userData)

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

</script>
<style>
.dataInput .q-btn-selected {
  color: teal;
}
</style>
