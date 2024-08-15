<template lang="pug">
div.q-pa-md
  p Контактные данные для отображения в разделе 'Контакты':
  div.q-pa-md
    q-input(v-model="phone" label="Телефон")
    q-input(v-model="email" label="Е-почта")

  q-btn(@click='update') Сохранить

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
