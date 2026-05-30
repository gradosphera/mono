<template lang="pug">
q-page.documents-page
  SearchedDocumentBanner(v-if="documentHash" @clear="clearDocumentFilter")
  ListOfDocumentsWidget(
    :username="username"
    :filter="documentFilter"
    :showFilter="false"
    :initialDocumentType="typeForToggle"
  )

  //- Поиск по документам — действие страницы через canon Teleport в шапку.
  //- Кнопка сама скрывается, если фича поиска выключена (features.search).
  Teleport(to='#header-actions-host', defer)
    SearchHeaderAction
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSessionStore } from 'src/entities/Session'
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments/ui'
import { SearchHeaderAction, SearchedDocumentBanner, useDocumentRouteFilter } from 'src/features/DocumentSearch'
import type { DocumentType } from 'src/entities/Document/model/types'

const session = useSessionStore()
const username = computed(() => session.username)
const typeForToggle = ref<DocumentType>('newsubmitted')

// Фильтр по документу, выбранному в поиске (?document=<hash>).
const { documentHash, documentFilter, clearDocumentFilter } = useDocumentRouteFilter()
</script>

<style lang="scss" scoped>
.documents-page {
  padding: var(--p-6, 24px);
}

@media (max-width: 768px) {
  .documents-page {
    padding: var(--p-4, 16px);
  }
}
</style>
