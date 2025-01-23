<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Map } from 'src/shared/ui/Map'
import { CreateChildOrderButton } from 'src/features/Request/CreateChildOrder'
import type { IRequestData } from 'src/entities/Request'
import { useCooperativeStore, type IAddressesData } from 'src/entities/Cooperative'

import { useSessionStore } from 'src/entities/Session'
const session = useSessionStore()
const username = computed(() => session.username)
const cooperativeStore = useCooperativeStore()
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

let units = ref(1)
const selectedAddress = ref<IAddressesData>()

defineProps({
  offer: {
    type: Object as () => IRequestData,
    required: true,
  },
})

const addresses = computed(() =>
cooperativeStore.addresses.map((el: any) => {
    return { ...el, address: el.data.street + ', ' + el.data.house_number }
  })
)

onMounted(async () => {
  await cooperativeStore.loadAddresses({ coopname: info.coopname })
  selectedAddress.value = addresses.value[0]
})

</script>

<template lang="pug">
div.q-pl-md.q-pr-md
  q-select(
    v-model="selectedAddress"
    :options="addresses"
    map-options
    emit-value
    option-label="address"
    option-value="id"
    label="Выберите адрес для получения заказа"
  )
  div(style="font-size: 12px !important; ").text-grey.q-mt-md
    p {{ selectedAddress?.data?.directions }}
    p телефон: {{ selectedAddress?.data?.phone_number }}
    p часы работы: {{ selectedAddress?.data?.business_hours }}

  Map(v-if="selectedAddress" :lat="Number(selectedAddress.data.latitude)" :long="Number(selectedAddress.data.longitude)")

  q-input(v-model="units" label="Введите количество единиц")

  CreateChildOrderButton(:coopname="info.coopname" :username="username" :offer="offer" :units="units")
</template>
