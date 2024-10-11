<template lang="pug">
div.q-pa-md
  p.text-h6 Изменить контакты кооператива
  p Контактные данные, которые отображаются в разделе 'Контакты' для пайщиков:

  div.q-pa-md.q-gutter-sm
    q-input(v-model="phone" standout="bg-teal text-white" label="Телефон" style="max-width: 300px;")
    q-input(v-model="email" standout="bg-teal text-white" label="Е-почта" style="max-width: 300px;")

  q-btn(@click='update' size="sm" color="primary")
    q-icon(name="save").q-mr-sm
    span сохранить

</template>
<script lang="ts" setup>
import { Cooperative } from 'cooptypes';
import { useCooperativeStore } from 'src/entities/Cooperative';
import { useUpdateMeta } from 'src/features/Registrator/UpdateMeta';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { COOPNAME } from 'src/shared/config';
import { ref, watch } from 'vue';

const coop = useCooperativeStore()
const phone = ref()
const email = ref()

watch(() => coop.contacts, (newValue: Cooperative.Model.IContacts | undefined) => {

  if (newValue) {
    phone.value = newValue.phone
    email.value = newValue.email
  }
})

coop.loadPublicCooperativeData(COOPNAME)
coop.loadContacts()

const update = async () => {

  const { updateMeta } = useUpdateMeta()

  try {
    await updateMeta(
      COOPNAME,
      {
        phone: phone.value,
        email: email.value
      }
    )

    SuccessAlert('Контакты успешно обновлены')
  } catch (e: any) {
    FailAlert(`Возникла ошибка при обновлении: ${e.message}`)
  }
}

</script>
