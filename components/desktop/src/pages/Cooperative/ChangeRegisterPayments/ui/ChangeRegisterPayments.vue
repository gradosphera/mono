<script setup lang="ts">
import { RegistratorContract } from 'cooptypes';
import { useCooperativeStore } from 'src/entities/Cooperative';
import { useSessionStore } from 'src/entities/Session';
import { useUpdateCoop } from 'src/features/Cooperative/UpdateCoop';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { formatToAsset } from 'src/shared/lib/utils/formatToAsset';
import { ref, watch, computed } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { env } from 'src/shared/config';

const { info } = useSystemStore()
const currency = computed(() => env.CURRENCY)
const coop = useCooperativeStore()
coop.loadPublicCooperativeData(info.coopname)
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
        coopname: info.coopname,
        username: session.username,
        initial: formatToAsset(localCoop.value.initial, env.CURRENCY as string),
        minimum: formatToAsset(localCoop.value.minimum, env.CURRENCY as string),
        org_initial: formatToAsset(localCoop.value.org_initial, env.CURRENCY as string),
        org_minimum: formatToAsset(localCoop.value.org_minimum, env.CURRENCY as string),
        announce: coop.publicCooperativeData?.announce,
        description: coop.publicCooperativeData?.description
      })
      await coop.loadPublicCooperativeData(info.coopname)

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
  p Вступительные и минимальные паевые взносы принимаются от новых пайщиков при их вступлении в кооператив.

  div.q-mb-lg
    q-card(flat).q-pa-md.q-gutter-sm.q-mt-lg.q-mb-lg
      p.text-overline ФИЗИЧЕСКИЕ ЛИЦА И ИНДИВИДУАЛЬНЫЕ ПРЕДПРИНИМАТЕЛИ

      q-input(standout="bg-teal text-white" v-model="localCoop.initial" label="Вступительный взнос")
        template(#append)
          span.text-overline {{ currency }}

      q-input(standout="bg-teal text-white" v-model="localCoop.minimum" label="Минимальный паевый взнос")
        template(#append)
          span.text-overline {{ currency }}

    q-card(flat).q-pa-md.q-gutter-sm
      p.text-overline ЮРИДИЧЕСКИЕ ЛИЦА
      q-input(standout="bg-teal text-white" v-model="localCoop.org_initial" label="Вступительный взнос")
        template(#append)
          span.text-overline {{ currency }}
      q-input(standout="bg-teal text-white" v-model="localCoop.org_minimum" label="Минимальный паевый взнос")
        template(#append)
          span.text-overline {{ currency }}

  q-btn(@click="save" size="sm" color="primary")
    q-icon(name="save").q-mr-sm
    span Сохранить

  </template>
