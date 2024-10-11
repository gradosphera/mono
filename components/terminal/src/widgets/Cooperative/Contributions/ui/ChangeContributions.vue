<script setup lang="ts">
import { RegistratorContract } from 'cooptypes';
import { useCooperativeStore } from 'src/entities/Cooperative';
import { useSessionStore } from 'src/entities/Session';
import { useUpdateCoop } from 'src/features/Cooperative/UpdateCoop';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { COOPNAME, CURRENCY } from 'src/shared/config';
import { formatToAsset } from 'src/shared/lib/utils/formatToAsset';
import { ref, watch } from 'vue';

const coop = useCooperativeStore()
coop.loadPublicCooperativeData(COOPNAME)
coop.loadPrivateCooperativeData()

const localCoop = ref({
  initial: 0,
  minimum: 0,
  org_initial: 0,
  org_minimum: 0
})

const save = async () => {
  const { updateCoop } = useUpdateCoop()
  const session = useSessionStore()
  if (coop.publicCooperativeData)
    try {
      await updateCoop({
        coopname: COOPNAME,
        username: session.username,
        initial: formatToAsset(localCoop.value.initial, CURRENCY),
        minimum: formatToAsset(localCoop.value.minimum, CURRENCY),
        org_initial: formatToAsset(localCoop.value.org_initial, CURRENCY),
        org_minimum: formatToAsset(localCoop.value.org_minimum, CURRENCY),
        announce: coop.publicCooperativeData?.announce,
        description: coop.publicCooperativeData?.description
      })
      await coop.loadPublicCooperativeData(COOPNAME)

      SuccessAlert('Размеры взносов успешно обновлены')
    } catch (e: any) {
      FailAlert(`${e.message}`)
    }
  else {
    FailAlert('Не удалось обновить взносы. Попробуйте перезагрузить страницу')
  }

}
watch(() => coop.publicCooperativeData, (newCoop: RegistratorContract.Tables.Cooperatives.ICooperative | undefined) => {
  if (newCoop)
    localCoop.value = {
      initial: parseFloat(newCoop.initial),
      minimum: parseFloat(newCoop.minimum),
      org_initial: parseFloat(newCoop.org_initial),
      org_minimum: parseFloat(newCoop.org_minimum)
    }
})

</script>
<template lang="pug">
div.q-pa-md
  p.text-h6 Изменить суммы взносов в кооперативе

  span Для физических лиц и индивидуальных предпринимателей:
  div(style="max-width: 300px")
    div.q-pa-md.q-gutter-sm
      q-input(standout="bg-teal text-white" v-model="localCoop.initial" label="Вступительный взнос")
        template(#append)
          span.text-overline {{ CURRENCY }}

      q-input(standout="bg-teal text-white" v-model="localCoop.minimum" label="Минимальный паевый взнос")
        template(#append)
          span.text-overline {{ CURRENCY }}

    span.q-mt-lg Для юридических лиц:
    div.q-pa-md.q-gutter-sm
      q-input(standout="bg-teal text-white" v-model="localCoop.org_initial" label="Вступительный взнос")
        template(#append)
          span.text-overline {{ CURRENCY }}
      q-input(standout="bg-teal text-white" v-model="localCoop.org_minimum" label="Минимальный паевый взнос")
        template(#append)
          span.text-overline {{ CURRENCY }}

  q-btn(@click="save" size="sm" color="primary")
    q-icon(name="save").q-mr-sm
    span Сохранить

  </template>
