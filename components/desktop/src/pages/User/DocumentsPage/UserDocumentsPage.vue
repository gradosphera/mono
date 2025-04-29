<template lang="pug">
q-page.padding
  ListOfDocumentsWidget(
    :username="username"
    :filter="{}"
    :showFilter="false"
    :initialDocumentType="typeForToggle"
  )
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionStore } from 'src/entities/Session'
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments/ui'
import type { DocumentType } from 'src/entities/Document/model/types'

// Получаем системную информацию
const session = useSessionStore()
const username = computed(() => session.username)

// Переменная для отслеживания типа в интерфейсе
const typeForToggle = ref<DocumentType>('newsubmitted')
</script>
