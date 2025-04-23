<template lang="pug">
q-page.padding
  DocumentsTable(
    :documents="documentStore.documents"
    :loading="documentStore.loading"
    @toggle-expand="toggleExpand"
  )
    template(#top)
      div.full-width
        q-btn-toggle(
          size="sm"
          :model-value="typeForToggle"
          @update:model-value="onTypeChange"
          spread
          toggle-color="teal"
          color="white"
          text-color="black"
          :options="[{label: 'Входящие', value: 'newsubmitted'}, {label: 'Утверждённые', value: 'newresolved'}]"
        ).full-width
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSystemStore } from 'src/entities/System/model'
import { DocumentModel } from 'src/entities/Document'
import { DocumentsTable } from 'src/widgets/Cooperative/Documents/ListOfDocuments/ui'
import { FailAlert } from 'src/shared/api'

// Получаем системную информацию
const { info } = useSystemStore()
const coopname = computed(() => info.coopname)

// Получаем store документов
const documentStore = DocumentModel.useDocumentStore()

// Переменная для отслеживания типа в интерфейсе
const typeForToggle = ref('newsubmitted')

// Обработчик изменения типа документов
function onTypeChange(newType) {
  if (newType === 'newresolved' || newType === 'newsubmitted') {
    typeForToggle.value = newType
    documentStore.changeDocumentType(newType, { receiver: coopname.value })
      .catch(e => FailAlert(e))
  }
}

// Локальное состояние для работы с UI
const expanded = ref(new Map<string, boolean>())

// Обработчики событий
const toggleExpand = (id: string) => {
  expanded.value.set(id, !expanded.value.get(id))
}

// Загрузка данных при монтировании
onMounted(() => {
  documentStore.loadDocuments({ receiver: coopname.value })
})

// Периодическое обновление данных
const interval = setInterval(
  () => documentStore.loadDocuments({ receiver: coopname.value }, undefined, true),
  10000
)
onBeforeUnmount(() => clearInterval(interval))
</script>
