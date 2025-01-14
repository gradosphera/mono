<template lang="pug">

div.row.justify-center
  div.col-12
    q-table(
      ref="tableRef"
      flat
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
      template(#top v-if="showFilter")
        q-btn-toggle(
          size="sm"
          v-model="documentType"
          spread
          toggle-color="teal"
          color="white"
          text-color="black"
          :options="[{label: 'Все входящие', value: 'newsubmitted'}, {label: 'Только утверждённые', value: 'newresolved'}]"
        ).full-width

      template(#header="props")

        q-tr(:props="props")
          q-th(auto-width)

          q-th(
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
          ) {{ col.label }}

      template(#body="props")
        q-tr(:key="`m_${props.row?.statement?.action?.global_sequence}`" :props="props")
          q-td(auto-width)
            q-btn(v-if="!expand" size="sm" color="primary" round dense :icon="expanded.get(props.row?.statement?.action?.global_sequence) ? 'remove' : 'add'" @click="toggleExpand(props.row?.statement?.action?.global_sequence)")

          q-td {{ props.row.statement?.action?.data?.document.hash.substring(0, 10) }}

          q-td {{ props.row.statement?.document?.full_title }}

        q-tr(v-if="expanded.get(props.row?.statement?.action?.global_sequence) || expand" :key="`e_${props.row?.statement?.action?.global_sequence}`" :props="props" class="q-virtual-scroll--with-prev")
          q-td(colspan="100%")
            ComplexDocument(:documents="props.row")


</template>

<script setup lang="ts">
import { onMounted, ref, computed, reactive, watch } from 'vue'
import { Notify } from 'quasar'
import { sendGET } from 'src/shared/api';
import { ComplexDocument } from 'src/shared/ui/ComplexDocument';
import type { IComplexDocument, IGetDocuments } from '@coopenomics/controller';

const documents = ref<IComplexDocument[]>([])
const onLoading = ref(false)

const props = defineProps({
  filter: {
    type: Object,
    required: true,
    validator: (value: any) => {
      // Проверка на наличие поля 'receiver' и типа string
      return typeof value.receiver === 'string'
    }
  },
  expand: {
    type: Boolean,
    required: false,
    default: false
  },
  showFilter: {
    type: Boolean,
    required: false,
    default: false,
  },
  documentType: {
    type: String,
    required: false,
  }
})

const receiver = computed(() => props.filter.receiver)
const documentType = ref(props.documentType || 'newsubmitted')

const loadDocuments = async () => {
  try {
    onLoading.value = true

    const data: IGetDocuments = {
      filter: {
        receiver: receiver.value,
        ...props.filter
      },
      type: documentType.value as 'newresolved' | 'newsubmitted'
    }

    documents.value = (await sendGET('/v1/documents/get-documents', {
      ...data
    })).results as IComplexDocument[]

    onLoading.value = false
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

watch(documentType, (newValue, oldValue) => {
  if (newValue != oldValue) {
    documents.value = []
    loadDocuments()
  }
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
