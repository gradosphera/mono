<template lang="pug">
.expense-proposal-documents(v-if='docs.length')
  DocumentRow(
    v-for='doc in docs',
    :key='doc.key',
    :document='doc.row',
    @open='open(doc)'
  )

  //- Просмотр документа во всплывающем окне — канон крупных документов
  //- (как оферта/соглашение): maximized BaseDialog + DocumentPreview (html).
  BaseDialog(
    v-model='dialogOpen',
    :title='activeTitle',
    maximized
  )
    DocumentPreview(
      :document='{ type: "html", html: activeHtml }',
      height='72vh'
    )
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { BaseDialog } from 'src/shared/ui/base/BaseDialog';
import { DocumentRow } from '../DocumentRow';
import type { DocumentRowDoc } from '../DocumentRow';
import { DocumentPreview } from '../DocumentPreview';
import type {
  ExpenseProposalDocumentsProps,
  ExpenseDocumentAggregate,
} from './ExpenseProposalDocuments.types';

const props = defineProps<ExpenseProposalDocumentsProps>();

interface DocEntry {
  key: string;
  title: string;
  html: string;
  row: DocumentRowDoc;
}

function firstSignedAt(agg?: ExpenseDocumentAggregate | null): string | undefined {
  const signatures = agg?.document?.signatures;
  if (!signatures?.length) return undefined;
  return signatures[0]?.signed_at ?? undefined;
}

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  try {
    return new Date(iso).toLocaleDateString('ru-RU');
  } catch {
    return iso;
  }
}

// Документ показываем только если есть его html (rawDocument). Без html
// открывать нечего — строка не появляется.
const docs = computed<DocEntry[]>(() => {
  const out: DocEntry[] = [];
  const add = (agg: ExpenseDocumentAggregate | null | undefined, fallbackTitle: string, key: string): void => {
    const html = agg?.rawDocument?.html;
    if (!agg || !html) return;
    const title = agg.rawDocument?.full_title || fallbackTitle;
    out.push({
      key,
      title,
      html,
      row: {
        type: 'html',
        title: fallbackTitle,
        status: agg.document?.signatures?.length ? 'signed' : undefined,
        date: formatDate(firstSignedAt(agg)),
      },
    });
  };
  add(props.statement, 'Служебная записка', 'statement');
  add(props.decision, 'Протокол решения совета', 'decision');
  return out;
});

const dialogOpen = ref(false);
const activeTitle = ref('');
const activeHtml = ref('');

function open(doc: DocEntry): void {
  activeTitle.value = doc.title;
  activeHtml.value = doc.html;
  dialogOpen.value = true;
}
</script>

<style scoped>
.expense-proposal-documents {
  display: flex;
  flex-direction: column;
  gap: var(--p-2, 8px);
}
</style>
