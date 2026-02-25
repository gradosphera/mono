<template lang="pug">
q-page.padding
  .row.items-center.q-mb-md
    .col
    SearchButton(v-if='isSearchEnabled')

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
import { useSystemStore } from 'src/entities/System/model'
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments/ui'
import { SearchButton } from 'src/features/DocumentSearch'
import type { DocumentType } from 'src/entities/Document/model/types'

const system = useSystemStore()
const isSearchEnabled = computed(() => (system.info as any)?.features?.search === true)

// Получаем системную информацию
const session = useSessionStore()
const username = computed(() => session.username)

// Переменная для отслеживания типа в интерфейсе
const typeForToggle = ref<DocumentType>('newsubmitted')
</script>
