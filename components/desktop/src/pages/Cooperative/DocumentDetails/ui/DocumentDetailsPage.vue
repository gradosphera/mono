<template lang="pug">
.document-details-page
  //- Canon back-link под шапкой, слева (вместо кнопки «Назад» в топбаре).
  button.document-back(type='button', @click='goBack')
    q-icon(name='arrow_back', size='18px')
    span К реестру документов

  div(v-if='loading')
    q-skeleton.q-mb-md.rounded-borders(type='rect', height='220px')
    q-skeleton.q-mb-md.rounded-borders(type='rect', height='140px')

  ComplexDocument(v-else-if='document', :documents='document')

  EmptyState(
    v-else,
    title='Документ не найден',
    body='Проверьте правильность ссылки или вернитесь к реестру документов.'
  )
    template(#icon)
      q-icon(name='search_off', size='48px')
</template>

<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ComplexDocument } from 'src/shared/ui/ComplexDocument';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { DocumentModel } from 'src/entities/Document';
import { useDesktopStore } from 'src/entities/Desktop';
import { useSessionStore } from 'src/entities/Session';
import { FailAlert } from 'src/shared/api';
import type { IDocumentPackageAggregate } from 'src/entities/Document/model/types';

const route = useRoute();
const router = useRouter();
const documentStore = DocumentModel.useDocumentStore();
const desktopStore = useDesktopStore();
const session = useSessionStore();

const coopname = computed(() => route.params.coopname as string);
const documentHash = computed(() => route.params.hash as string);

const document = ref<IDocumentPackageAggregate | null>(null);
const loading = ref(true);

// Заголовок документа — в шапку (вместо статичного «Документ»).
const documentTitle = computed(() => {
  const meta = (document.value?.statement?.documentAggregate?.document?.meta ??
    document.value?.decision?.documentAggregate?.document?.meta) as Record<string, any> | undefined;
  const title = typeof meta?.title === 'string' ? meta.title : '';
  return title || 'Документ';
});

// Стол совета видит весь документооборот кооператива; пайщик — только свои документы.
const isCouncilWorkspace = computed(() => desktopStore.activeWorkspaceName === 'soviet');
const scopeUsername = computed(() =>
  isCouncilWorkspace.value ? coopname.value : session.username,
);
const targetRouteName = computed(() =>
  isCouncilWorkspace.value ? 'documents' : 'user-documents',
);

// Возврат к реестру документов (back-link под шапкой).
const goBack = (): void => {
  void router.push({
    name: targetRouteName.value,
    params: { coopname: coopname.value },
  });
};

const loadDocument = async (): Promise<void> => {
  loading.value = true;
  try {
    document.value = await documentStore.loadDocument(
      scopeUsername.value,
      documentHash.value,
    );
  } catch (error: any) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};

// Наименование документа держим в заголовке шапки, пока открыта страница.
watch(documentTitle, (title) => desktopStore.setPageTitleOverride(title), {
  immediate: true,
});

onMounted(loadDocument);

onUnmounted(() => desktopStore.clearPageTitleOverride());
</script>

<style lang="scss" scoped>
/* Полная ширина контента, как на canon-страницах документов/платежей. */
.document-details-page {
  padding: var(--p-6, 24px);
}
@media (max-width: 768px) {
  .document-details-page {
    padding: var(--p-4, 16px);
  }
}

.document-back {
  display: inline-flex;
  align-items: center;
  gap: var(--p-1, 4px);
  margin-bottom: var(--p-4, 16px);
  padding: 0;
  border: none;
  background: transparent;
  color: var(--p-ink-2);
  font-size: var(--p-fs-body-sm, 13px);
  cursor: pointer;
  transition: color var(--p-dur-fast, 120ms) var(--p-ease-standard);
}
.document-back:hover {
  color: var(--p-ink);
}
</style>
