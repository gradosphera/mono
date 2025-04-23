<template lang="pug">
div.row.justify-center
  div.col-12
    DocumentsTable(
      :documents="documentStore.documents"
      :loading="documentStore.loading"
      @toggle-expand="toggleExpand"
    )
      template(#top v-if="showFilter")
        div.full-width
          q-btn-toggle.full-width(
            size="sm"
            :model-value="typeForToggle"
            @update:model-value="onTypeChange"
            spread
            toggle-color="teal"
            color="white"
            text-color="black"
            :options="[{label: 'Все входящие', value: 'newsubmitted'}, {label: 'Только утверждённые', value: 'newresolved'}]"
          )
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { DocumentModel } from 'src/entities/Document'
import { DocumentsTable } from '../ui'
import { FailAlert } from 'src/shared/api'
import type { DocumentType } from 'src/entities/Document/model/types'

const props = defineProps({
  filter: {
    type: Object,
    required: true,
    validator: (value: any) => {
      return typeof value.receiver === 'string'
    }
  },
  showFilter: {
    type: Boolean,
    required: false,
    default: false,
  },
  initialDocumentType: {
    type: String as () => DocumentType,
    required: false,
    default: 'newsubmitted',
  }
})

const emit = defineEmits(['toggle-expand'])

// Получаем store документов
const documentStore = DocumentModel.useDocumentStore()

// Переменная для отслеживания типа в интерфейсе
const typeForToggle = ref<DocumentType>(props.initialDocumentType)

// Обработчик изменения типа документов
async function onTypeChange(newType: DocumentType) {
  if (newType === 'newresolved' || newType === 'newsubmitted') {
    typeForToggle.value = newType
    try {
      await documentStore.changeDocumentType(newType, props.filter)
    } catch (e) {
      FailAlert(e)
    }
  }
}

// Функция для переключения состояния раскрытия
function toggleExpand(document: any) {
  emit('toggle-expand', document)
}

// Загрузка документов при монтировании
onMounted(() => {
  documentStore.changeDocumentType(typeForToggle.value, props.filter)
    .catch(e => FailAlert(e))
})
</script>
