<template lang="pug">
div.q-pa-xs.col-xs-12.col-sm-12.col-md-12.q-mt-md
  q-card(bordered flat)
    q-card-section.q-py-xs
      div.text-subtitle2 {{ document.statement?.documentAggregate?.rawDocument?.full_title || '' }}
      div.text-caption ID: {{ getDocumentHash(document).substring(0, 10) || '' }}

    q-separator

    q-card-actions(align="right")
      q-btn(size="sm" flat icon="expand_more" @click="$emit('toggle-expand')")
        | {{ expanded ? 'Скрыть' : 'Подробнее' }}

    q-slide-transition
      div(v-show="expanded")
        q-separator
        q-card-section
          ComplexDocument(:documents="document")
</template>

<script setup lang="ts">
import { ComplexDocument } from 'src/shared/ui/ComplexDocument'
import type { IDocumentPackageAggregate } from 'src/entities/Document/model'

withDefaults(defineProps<{
  document: IDocumentPackageAggregate
  expanded?: boolean
}>(), {
  expanded: false
})

defineEmits<{
  (e: 'toggle-expand'): void
}>()

// Получение хеша документа из агрегата
function getDocumentHash(doc: IDocumentPackageAggregate) {
  if (doc.statement?.documentAggregate?.rawDocument?.hash) {
    return doc.statement.documentAggregate.rawDocument.hash
  }

  if (doc.decision?.documentAggregate?.rawDocument?.hash) {
    return doc.decision.documentAggregate.rawDocument.hash
  }

  return 'нет хеша'
}
</script>
