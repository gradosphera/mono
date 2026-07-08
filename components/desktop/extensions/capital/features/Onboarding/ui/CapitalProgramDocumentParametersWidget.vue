<template lang="pug">
BaseCard(title='Параметры документов ЦПП')
  p.capital-doc-params__intro.t-body2
    | Заполните поля, которые будут подставлены в положения и оферты программ «ГЕНЕРАТОР» и «БЛАГОРОСТ».
    |  Перед установкой расширения сформируйте предпросмотр документов: так параметры сохранятся в PrivateData, а в config попадёт только hash.

  BaseInput(
    :model-value='config?.capital_program_doc_data_hash || ""'
    label='Hash PrivateData документов'
    hint='Появится после формирования предпросмотра'
    readonly
    mono
  )

  BaseBanner(v-if='config?.capital_program_doc_data_hash' variant='pos')
    | Параметры сохранены. Hash: {{ config.capital_program_doc_data_hash }}

  q-expansion-item(default-opened label='Протокол и кооператив' icon='description')
    .row.q-col-gutter-md.q-mt-sm
      .col-12.col-md-3(v-for='field in protocolFields' :key='field.key')
        BaseInput(
          v-model='form[field.key]'
          :label='field.label'
          :error='fieldErrors[field.key]'
        )
      .col-12.col-md-6(v-for='field in cooperativeFields' :key='field.key')
        BaseInput(
          v-model='form[field.key]'
          :label='field.label'
          :error='fieldErrors[field.key]'
        )

  q-expansion-item(label='Программа ГЕНЕРАТОР' icon='bolt')
    .capital-doc-params__section
      BaseInput(
        v-for='field in generatorFields'
        :key='field.key'
        v-model='form[field.key]'
        :label='field.label'
        :type='field.type || "textarea"'
        :autogrow='field.type !== "text"'
        :error='fieldErrors[field.key]'
      )

  q-expansion-item(label='Программа БЛАГОРОСТ' icon='eco')
    .capital-doc-params__section
      BaseInput(
        v-for='field in blagorostFields'
        :key='field.key'
        v-model='form[field.key]'
        :label='field.label'
        type='textarea'
        autogrow
        :error='fieldErrors[field.key]'
      )

  q-expansion-item(label='Возврат, источники и оферты' icon='article')
    .capital-doc-params__section
      BaseInput(
        v-for='field in returnFields'
        :key='field.key'
        v-model='form[field.key]'
        :label='field.label'
        :type='field.type || "textarea"'
        :autogrow='field.type !== "text"'
        :error='fieldErrors[field.key]'
      )

  .capital-doc-params__footer
    p.capital-doc-params__hint.t-caption
      | Предпросмотр генерирует документы без публикации и сохраняет PrivateData по hash.
    BaseButton(:loading='isGenerating' @click='generatePreview')
      | Сформировать предпросмотр

  BaseDialog(v-model='previewOpen' title='Предпросмотр положений ЦПП' size='xl')
    .capital-doc-params__preview(v-if='previewDocuments.length')
      q-tabs(v-model='activePreviewTab' dense align='left' class='capital-doc-params__tabs')
        q-tab(
          v-for='doc in previewDocuments'
          :key='doc.registry_id'
          :name='String(doc.registry_id)'
          :label='doc.title'
        )
      q-separator
      q-tab-panels(v-model='activePreviewTab' animated)
        q-tab-panel(
          v-for='doc in previewDocuments'
          :key='doc.registry_id'
          :name='String(doc.registry_id)'
        )
          .doc-preview
            DocumentHtmlReader(:html='doc.html' :sanitize='false')
    template(#footer)
      BaseButton(variant='ghost' @click='previewOpen = false')
        | Закрыть
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { Mutations } from '@coopenomics/sdk';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { client } from 'src/shared/api/client';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { BaseBanner, BaseButton, BaseCard, BaseDialog, BaseInput } from 'src/shared/ui/base';
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';

type CapitalProgramPrivateData = {
  approval_protocol_number: string;
  approval_protocol_day: string;
  approval_protocol_month: string;
  approval_protocol_year: string;
  cooperative_name: string;
  cooperative_short_name: string;
  cooperative_quoted_name: string;
  website: string;
  chairman_full_name: string;
  generator_program_purpose: string;
  eoap_definition: string;
  generator_task_goal: string;
  idea_unit_cost: string;
  idea_unit_cost_words: string;
  blagorost_goal_expansion: string;
  blagorost_task_expansion: string;
  blagorost_task_development: string;
  return_source_description: string;
  return_additional_source: string;
  offer_template_number: string;
};

type FieldDefinition = {
  key: keyof CapitalProgramPrivateData;
  label: string;
  type?: 'text' | 'textarea';
};

type CapitalProgramConfig = Record<string, unknown> & {
  capital_program_doc_data_hash?: string | null;
};

type GeneratedPreviewDocument = NonNullable<
  Mutations.Documents.GenerateDocument.IOutput[typeof Mutations.Documents.GenerateDocument.name]
>;

interface Props {
  config: CapitalProgramConfig;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'update:config', value: CapitalProgramConfig): void;
}>();

const system = useSystemStore();
const session = useSessionStore();
const isGenerating = ref(false);
const previewOpen = ref(false);
const activePreviewTab = ref('994');
const previewDocuments = ref<Array<{ registry_id: number; title: string; html: string; hash: string }>>([]);
const fieldErrors = reactive<Partial<Record<keyof CapitalProgramPrivateData, string>>>({});

const form = reactive<Omit<CapitalProgramPrivateData, 'cooperative_quoted_name'>>({
  approval_protocol_number: '',
  approval_protocol_day: '',
  approval_protocol_month: '',
  approval_protocol_year: '',
  cooperative_name: '',
  cooperative_short_name: '',
  website: '',
  chairman_full_name: '',
  generator_program_purpose: '',
  eoap_definition: '',
  generator_task_goal: '',
  idea_unit_cost: '',
  idea_unit_cost_words: '',
  blagorost_goal_expansion: '',
  blagorost_task_expansion: '',
  blagorost_task_development: '',
  return_source_description: '',
  return_additional_source: '',
  offer_template_number: '______',
});

const protocolFields: FieldDefinition[] = [
  { key: 'approval_protocol_number', label: 'Номер протокола' },
  { key: 'approval_protocol_day', label: 'День протокола' },
  { key: 'approval_protocol_month', label: 'Месяц протокола' },
  { key: 'approval_protocol_year', label: 'Год протокола' },
];

const cooperativeFields: FieldDefinition[] = [
  { key: 'cooperative_name', label: 'Наименование кооператива' },
  { key: 'cooperative_short_name', label: 'Краткое наименование (ПК)' },
  { key: 'website', label: 'Сайт' },
  { key: 'chairman_full_name', label: 'ФИО председателя' },
];

const generatorFields: FieldDefinition[] = [
  { key: 'generator_program_purpose', label: 'Назначение программы ГЕНЕРАТОР' },
  { key: 'eoap_definition', label: 'Определение ЕОАП' },
  { key: 'generator_task_goal', label: 'Цель задач ГЕНЕРАТОР' },
  { key: 'idea_unit_cost', label: 'Стоимость единицы идеи', type: 'text' },
  { key: 'idea_unit_cost_words', label: 'Стоимость единицы идеи прописью', type: 'text' },
];

const blagorostFields: FieldDefinition[] = [
  { key: 'blagorost_goal_expansion', label: 'Расширение цели БЛАГОРОСТ' },
  { key: 'blagorost_task_expansion', label: 'Задача расширения БЛАГОРОСТ' },
  { key: 'blagorost_task_development', label: 'Задача развития БЛАГОРОСТ' },
];

const returnFields: FieldDefinition[] = [
  { key: 'return_source_description', label: 'Источник возврата' },
  { key: 'return_additional_source', label: 'Дополнительный источник возврата' },
  { key: 'offer_template_number', label: 'Номер шаблона оферты', type: 'text' },
];

const allFields = computed(() => [
  ...protocolFields,
  ...cooperativeFields,
  ...generatorFields,
  ...blagorostFields,
  ...returnFields,
]);

watch(
  () => system.info,
  (info) => {
    if (!info) return;
    form.cooperative_name ||= String(info.coopname || '').toUpperCase();
    form.cooperative_short_name ||= 'ПК';
    form.website ||= info.website || info.contacts?.website || '';
    form.chairman_full_name ||= info.chairman?.full_name || info.chairman_full_name || '';
  },
  { immediate: true }
);

function getPayload(): CapitalProgramPrivateData {
  const cooperativeName = String(form.cooperative_name || '').trim();
  return {
    ...Object.fromEntries(
      allFields.value.map(({ key }) => [key, String(form[key] || '').trim()])
    ) as Omit<CapitalProgramPrivateData, 'cooperative_quoted_name'>,
    cooperative_quoted_name: cooperativeName ? `«${cooperativeName}»` : '',
  };
}

function validatePayload(payload: CapitalProgramPrivateData): string[] {
  return allFields.value
    .filter(({ key }) => !payload[key])
    .map(({ label }) => label);
}

function clearFieldErrors(): void {
  for (const key of Object.keys(fieldErrors) as Array<keyof CapitalProgramPrivateData>) {
    delete fieldErrors[key];
  }
}

function setFieldErrors(missingLabels: string[]): void {
  clearFieldErrors();
  for (const { key, label } of allFields.value) {
    if (missingLabels.includes(label)) {
      fieldErrors[key] = 'Заполните поле';
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getDocDataHash(doc: GeneratedPreviewDocument): string | null {
  if (!isRecord(doc.meta)) return null;
  const hash = doc.meta.doc_data_hash;
  return typeof hash === 'string' && hash.length > 0 ? hash : null;
}

async function generateDocument(registry_id: number, payload: CapitalProgramPrivateData): Promise<GeneratedPreviewDocument> {
  const { [Mutations.Documents.GenerateDocument.name]: result } = await client.Mutation(
    Mutations.Documents.GenerateDocument.mutation,
    {
      variables: {
        input: {
          data: {
            coopname: system.info?.coopname || '',
            username: session.username,
            lang: 'ru',
            registry_id,
            doc_data: payload,
          },
          options: { skip_save: true },
        },
      },
    }
  );

  if (!result) {
    throw new Error('Документ не был сгенерирован');
  }

  return result;
}

async function generatePreview() {
  const payload = getPayload();
  const missing = validatePayload(payload);
  if (missing.length) {
    setFieldErrors(missing);
    FailAlert(`Заполните параметры документов: ${missing.join(', ')}`);
    return;
  }

  clearFieldErrors();

  try {
    isGenerating.value = true;
    const docs = await Promise.all([
      generateDocument(994, payload),
      generateDocument(998, payload),
    ]);

    const docDataHash = docs
      .map(getDocDataHash)
      .find((hash: unknown): hash is string => typeof hash === 'string' && hash.length > 0);

    if (!docDataHash) {
      throw new Error('Генератор не вернул doc_data_hash');
    }

    previewDocuments.value = docs.map((doc, index) => ({
      registry_id: index === 0 ? 994 : 998,
      title: doc.full_title,
      html: doc.html,
      hash: doc.hash,
    }));
    activePreviewTab.value = '994';
    previewOpen.value = true;
    emit('update:config', {
      ...props.config,
      capital_program_doc_data_hash: docDataHash,
    });
    SuccessAlert('Параметры документов сохранены в PrivateData');
  } catch (error) {
    FailAlert(error);
  } finally {
    isGenerating.value = false;
  }
}
</script>

<style scoped lang="scss">
.capital-doc-params__intro {
  margin: 0 0 var(--p-4);
  color: var(--p-ink-secondary);
}

.capital-doc-params__section {
  display: flex;
  flex-direction: column;
  gap: var(--p-3);
  margin-top: var(--p-2);
}

.capital-doc-params__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--p-4);
  margin-top: var(--p-6);
}

.capital-doc-params__hint {
  margin: 0;
  color: var(--p-ink-secondary);
}

.capital-doc-params__tabs {
  color: var(--p-primary);
}

.doc-preview :deep([data-doc-param]) {
  background: var(--p-warn-soft);
  border-radius: var(--p-r-sm);
  padding: 0 2px;
}
</style>
