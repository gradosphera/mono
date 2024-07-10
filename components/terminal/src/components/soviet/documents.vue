<template lang="pug">

div.row.justify-center
  div.col-12
    q-table(
      ref="tableRef" flat
      bordered
      :rows="documents"
      :columns="columns"
      :table-colspan="9"
      :pagination="pagination"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :rows-per-page-options="[10]"
      :loading='onLoading'
      :no-data-label="'документы не найдены'"
    ).full-height

      template(#header="props")

        q-tr(:props="props")
          q-th(auto-width)

          q-th(
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          ) {{ col.label }}

      template(#body="props")
        q-tr(:key="`m_${props.row?.statement?.action?.transaction_id}`" :props="props")
          q-td(auto-width)
            q-btn(size="sm" color="primary" round dense :icon="expanded.get(props.row?.statement?.action?.transaction_id) ? 'remove' : 'add'" @click="toggleExpand(props.row?.statement?.action?.transaction_id)")

          q-td {{ props.row.statement?.action?.data?.decision_id }}

          q-td {{ props.row.statement?.document?.full_title }}
          //- {{ getHumanActionName(props.row.act.data.action) }}

          //- q-td {{ moment(props.row.statement.document).format('DD.MM.YY HH:mm:ss') }}

          //- q-td {{ props.row.act.data.username }}


        //- p {{ props.row?.statement?.action?.transaction_id }}
        q-tr(v-if="expanded.get(props.row?.statement?.action?.transaction_id)" :key="`e_${props.row?.statement?.action?.transaction_id}`" :props="props" class="q-virtual-scroll--with-prev")
          q-td(colspan="100%")
            joincoopdoc(v-if="props.row?.statement?.action?.data?.action == 'joincoop'" :documents="props.row")


        // div(v-else)
        //   p.full-width.text-center.text-grey.no-select у кооператива нет документов

</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { Notify } from 'quasar'
import { sendGET } from 'src/shared/api';
import joincoopdoc from './docs/joincoop.vue'
const route = useRoute()
const documents = ref([])
const onLoading = ref(false)

const props = defineProps({
  receiver: {
    type: String,
    required: false,
    default: null
  },
})

const receiver = computed(() => props.receiver)

const loadDocuments = async () => {
  try {
    onLoading.value = true
    documents.value = (await sendGET('/v1/data/get-documents', {
      filter: {
        receiver: receiver.value ? receiver.value : route.params.coopname
      },
    })).results
    onLoading.value = false
    console.log('docunets: ', documents.value)
  } catch (e: any) {
    onLoading.value = false
    console.log(e)
    Notify.create({
      message: e.message,
      type: 'negative',
    })
  }
}

onMounted(() => {
  loadDocuments()
})

// const getHumanActionName = (action) => {
//   if (action == 'joincoop') {
//     return 'Заявление на вступление'
//   }
// }

const columns = [
  { name: 'id', align: 'left', label: 'id', field: 'id', sortable: true },

  { name: 'action', align: 'left', label: 'Документ', field: 'action', sortable: true },
  // { name: 'timestamp', align: 'left', label: 'Дата', field: 'timestamp', sortable: true },
  // { name: 'username', align: 'left', label: 'Аккаунт', field: 'username', sortable: true },
] as any

const expanded = reactive(new Map()) // Используем Map для отслеживания состояния развертывания каждой записи

// Функция для переключения состояния развертывания
const toggleExpand = (id: any) => {
  expanded.set(id, !expanded.get(id))
}


const tableRef = ref(null)
const pagination = ref({ rowsPerPage: 10 })
</script>
src/app/config
