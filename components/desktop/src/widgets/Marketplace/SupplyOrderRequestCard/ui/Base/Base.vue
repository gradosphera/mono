<script setup lang="ts">
import { computed } from 'vue'
import type { IRequestData } from 'src/entities/Request/model'
import {
  FirstStep,
  SecondStep,
  ThirdStep,
  FourthStep,
  FifthStep,
  SixthStep,
  SeventhStep,
  EightStep,
} from '../Steps'

//TODO изменить на обязательный импорт с типом
const props = defineProps<{
  request: IRequestData
}>()

const request = computed(() => props.request)

const step = computed(() => {
  const statuses = {
    published: 1,
    accepted: 2,
    authorized: 3,
    supplied1: 4,
    supplied2: 5,
    delivered: 6,
    recieved1: 7,
    recieved2: 8,
    completed: 9,
    canceled: 10,
    declined: 0,
  }

  type StatusType = keyof typeof statuses
  return statuses[props.request.status as StatusType]
})

import { useSessionStore } from 'src/entities/Session'
const session = useSessionStore()
const username = computed(() => session.username)
const iAmSupplier = computed(() => props.request.product_contributor == username.value)
const iAmReciever = computed(() => props.request.money_contributor == username.value)
const iAmAuthorizer = computed(() => username.value === 'chairman') // TODO получить имя аккаунта председателя => проверить уполномоченного на наличие в листе уполномоченных

// TODO move it to shared storage api
const src = computed(() => {
  const preview = props.request?.data?.preview
  if (!preview) return

  if (preview && preview.startsWith('https://')) {
    return preview // Превью уже содержит HTTPS, оставляем его как есть
  } else {
    return process.env.STORAGE_URL + preview // Иначе, добавляем config.storageUrl
  }
})
</script>

<template lang="pug">
q-card(flat ).no-select
  div.q-pa-md
    div.row
      div.col-md-2.col-xs-12
        div.text-h6.q-mb-md {{request.data?.title}}
        div
          span Заказ:
            q-badge(size="lg").q-ml-xs {{request.remain_units || request.blocked_units || request.delivered_units}} единиц
        div
          span Цена:
            q-badge(size="lg").q-ml-xs {{request.unit_cost}}
        img(v-if="src" :src="src").full-width.q-mt-lg
      div.col-md-10.col-xs-12
        q-stepper(
          v-model="step"
          flat
          vertical
          color="primary"
          animated
          done-color="green"
        )
          FirstStep(:request='request' :i-am-supplier="iAmSupplier" :i-am-authorizer="iAmAuthorizer" :i-am-reciever="iAmReciever" :username="username" :current-step="step")
          SecondStep(:request='request' :i-am-supplier="iAmSupplier" :i-am-authorizer="iAmAuthorizer" :i-am-reciever="iAmReciever" :username="username" :current-step="step")
          ThirdStep(:request='request' :i-am-supplier="iAmSupplier" :i-am-authorizer="iAmAuthorizer" :i-am-reciever="iAmReciever" :username="username"  :current-step="step")
          FourthStep(:request='request' :i-am-supplier="iAmSupplier" :i-am-authorizer="iAmAuthorizer" :i-am-reciever="iAmReciever" :username="username"  :current-step="step")
          FifthStep(:request='request' :i-am-supplier="iAmSupplier" :i-am-authorizer="iAmAuthorizer" :i-am-reciever="iAmReciever" :username="username"  :current-step="step")
          SixthStep(:request='request' :i-am-supplier="iAmSupplier" :i-am-authorizer="iAmAuthorizer" :i-am-reciever="iAmReciever" :username="username"  :current-step="step")
          SeventhStep(:request='request' :i-am-supplier="iAmSupplier" :i-am-authorizer="iAmAuthorizer" :i-am-reciever="iAmReciever" :username="username"  :current-step="step")
          EightStep(:request='request' :i-am-supplier="iAmSupplier" :i-am-authorizer="iAmAuthorizer" :i-am-reciever="iAmReciever" :username="username"  :current-step="step")

</template>
