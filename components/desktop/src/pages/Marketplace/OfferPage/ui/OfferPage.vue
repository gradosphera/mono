<template lang="pug">
div
div(v-if="localRequest").row.justify-around.q-pt-lg
  div.col-md-6.col-xs-12
    //виджет предпросмотра
    ImageCarousel(v-if="localRequest.data.images" :images="localRequest.data.images")
    q-card(flat bordered).q-pa-md.q-mt-lg
      div(v-if="!showEdit").text-h6.q-mb-md {{ localRequest.data.title }}
      q-input(v-else v-model="localRequest.data.title" :readonly="!showEdit" standout="bg-teal text-white" label="Заголовок" type="text")
      div(v-if="!showEdit").description {{ localRequest.data.description }}
      q-input(v-else v-model="localRequest.data.description" standout="bg-teal text-white" label="Описание" type="textarea" rows="7").q-mt-md

  div.col-md-4.col-xs-12
    q-card(v-if="!showBuy" flat bordered).no-select
      div.q-pa-md
        q-input(v-model="localRequest.remain_units" :readonly="!showEdit" standout="bg-teal text-white" label="Остаток" type="number")
          template(#append)
            span единиц

        q-input(v-model="price" :readonly="!showEdit" standout="bg-teal text-white" label="Цена" type="number" step="100" min="0")
          template(#append)
            span {{ symbol }}

    div(v-if="isMy")
      div(v-if="loggedIn")
        q-checkbox(v-if="!showEdit && iAmOwner" v-model="localRequest.status" :label="statusCheckbox" disable true-value="published")

        div(v-if="!showEdit").text-center.q-mt-lg.q-gutter-sm
          q-btn(size="md" @click="edit" ) Редактировать
          UnpublishRequestButton(v-if="localRequest.status == 'published' || localRequest.status == 'moderation'" :disabled="localRequest.status == 'moderation'" :coopname="coopname" :username="username" :request-id="Number(localRequest.id)")

          PublishRequestButton(v-if="localRequest.status == 'unpublished' || localRequest.status == 'prohibit'" :coopname="coopname" :username="username" :request-id="Number(localRequest.id)")

        div(v-else).text-center.q-mt-lg.q-gutter-sm
          q-btn(color="grey" size="md" @click="cancel") Отмена

          //- q-btn(color="primary" size="md" @click="save" style="margin-bottom: 50px;") Сохранить
          UpdateRequestButton(:coopname="coopname" :username="username" :request-id="localRequest.id" :remain-units="localRequest.remain_units" :unit-cost="unitCost" :data="localRequest.data" @saved="saved")


      div(v-else).q-mt-lg
        span Для редактирования
          q-btn(flat dense color="primary" @click="signin").q-ml-xs.q-mr-xs войдите.

    q-card(v-else flat bordered).q-pa-md
      div(v-if="loggedIn")
        //виджет заказа
        div(v-if="!showBuy").text-center
          q-btn(v-if="localRequest.type == 'offer'" color="primary" size="lg" @click="buy" ) Заказать

        div(v-else).q-mt-md
          CreateChildOrderCard(:offer="localRequest")

      div(v-else).q-mt-lg
        //виджет приглашения зарегистрироваться / войти
        span Для заказа
          q-btn(flat dense color="primary" @click="signup").q-ml-xs.q-mr-xs зарегистрируйтесь
          | или
          q-btn(flat dense color="primary" @click="signin").q-ml-xs.q-mr-xs войдите.
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ImageCarousel } from 'src/shared/ui/ImageCarousel'
import { CreateChildOrderCard } from 'src/widgets/Request/CreateChildOrderCard'

import { PublishRequestButton } from 'src/features/Request/PublishRequest'
import { UnpublishRequestButton } from 'src/features/Request/UnpublishRequest'
import { UpdateRequestButton } from 'src/features/Request/UpdateRequest'
import { useRequestStore } from 'src/entities/Request/model/stores'
import { useSessionStore } from 'src/entities/Session'
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

import type { IRequestData } from 'src/entities/Request'
const session = useSessionStore()
const username = computed(() => session.username)

const router = useRouter()
const requestStore = useRequestStore()


const props = defineProps({
  object: {
    type: Object as () => IRequestData,
    required: true,
  },
})
const localRequest = ref(props.object)

watch(
  () => props.object,
  () => {
    localRequest.value = props.object
  },
  { deep: true }
)
const iAmOwner = computed(() => localRequest.value.username == username.value)
const coopname = computed(() => info.coopname)

let [temp_price, temp_symbol] = localRequest.value.unit_cost.split(' ')
temp_price = parseFloat(temp_price).toFixed(0)

const price = ref(temp_price)
const symbol = ref(temp_symbol)

watch(price, (newValue) => {
  price.value = parseFloat(newValue).toFixed(0)
})

const showBuy = ref(false)
const buy = () => {
  showBuy.value = true
}

const showEdit = ref(false)
const edit = () => {
  showEdit.value = true
}

const unitCost = computed(() => parseFloat(price.value).toFixed(4) + ' ' + symbol.value)

const saved = () => (showEdit.value = false)

const cancel = () => {
  showEdit.value = false
  requestStore.updateOneRequest({
    coopname: coopname.value as string,
    request_id: localRequest.value.id as string,
  })
}

const signup = () => {
  router.push({ name: 'sign-up' })
}

const signin = () => {
  router.push({ name: 'sign-in' })
}

const loggedIn = computed(() => {
  return session.isAuth
})

const isMy = computed(() => {
  return localRequest.value.username === username.value
})

const statusCheckbox = computed(() => {
  if (localRequest.value.status == 'moderation') return 'на модерации'
  else if (localRequest.value.status == 'published') return 'опубликовано'
  else if (localRequest.value.status == 'unpublished') return 'снято с публикации'

  return ''
})
</script>

<style>
.description {
  font-size: 14px;
  white-space: pre-wrap;
}
</style>
