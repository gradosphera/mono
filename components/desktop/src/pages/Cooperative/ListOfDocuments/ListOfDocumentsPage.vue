<template lang="pug">
q-page.padding
  ListOfDocumentsWidget(
    :username="coopname"
    :filter="{}"
    :showFilter="true"
    :initialDocumentType="typeForToggle"
  )
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSystemStore } from 'src/entities/System/model'
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments/ui'
import type { DocumentType } from 'src/entities/Document/model/types'

// Получаем системную информацию
const { info } = useSystemStore()
const coopname = computed(() => info.coopname)

// Переменная для отслеживания типа в интерфейсе
const typeForToggle = ref<DocumentType>('newsubmitted')

</script>
