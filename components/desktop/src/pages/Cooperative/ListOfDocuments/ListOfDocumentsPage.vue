<template lang="pug">
q-page.padding
  ListOfDocumentsWidget(
    :username='coopname',
    :filter='{}',
    :showFilter='false',
    :initialDocumentType='typeForToggle'
  )
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSystemStore } from 'src/entities/System/model';
import { ListOfDocumentsWidget } from 'src/widgets/Cooperative/Documents/ListOfDocuments/ui';
import { SearchHeaderAction } from 'src/features/DocumentSearch';
import { useHeaderActions } from 'src/shared/hooks';
import type { DocumentType } from 'src/entities/Document/model/types';

const system = useSystemStore();
const { info } = system;
const coopname = computed(() => info.coopname);
const typeForToggle = ref<DocumentType>('newresolved');

const { registerAction } = useHeaderActions();

onMounted(() => {
  const hasSearch = (info as any)?.features?.search === true;
  if (hasSearch) {
    registerAction({
      id: 'document-search',
      component: SearchHeaderAction,
      order: 10,
    });
  }
});
</script>
