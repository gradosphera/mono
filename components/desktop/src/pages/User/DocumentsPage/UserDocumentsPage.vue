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
import { ref, computed, onMounted } from 'vue'
import { useSessionStore } from 'src/entities/Session'
import { useSystemStore } from 'src/entities/System/model'
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments/ui'
import { SearchHeaderAction } from 'src/features/DocumentSearch'
import { useHeaderActions } from 'src/shared/hooks'
import type { DocumentType } from 'src/entities/Document/model/types'

const session = useSessionStore()
const system = useSystemStore()
const username = computed(() => session.username)
const typeForToggle = ref<DocumentType>('newsubmitted')

const { registerAction, clearActions } = useHeaderActions()

onMounted(() => {
  const hasSearch = (system.info as any)?.features?.search === true
  if (hasSearch) {
    registerAction({
      id: 'document-search',
      component: SearchHeaderAction,
      order: 10,
    })
  }
})
</script>
