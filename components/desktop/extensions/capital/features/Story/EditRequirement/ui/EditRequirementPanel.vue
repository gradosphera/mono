<template lang="pug">
q-card.column.no-wrap.edit-req-panel(
  :class='{ "edit-req-panel--dialog": variant === "dialog", "edit-req-panel--page": variant === "page" }'
  flat
)
  q-bar.bg-primary.text-white(style='min-height: 40px')
    q-input(
      v-if='canEdit'
      v-model='localTitle'
      :readonly='!canEdit'
      dense
      color='white'
      input-class='text-white'
      input-style='color: white;'
      placeholder='Заголовок требования'
      :rules='[(val) => !!val?.trim() || "Заголовок обязателен"]'
      style='font-size: 1.25rem; font-weight: 500'
    ).q-mt-md.full-width
    .text-h6(v-else) {{ requirement?.title || "Требование" }}
    q-space
    q-btn(
      v-if='variant === "dialog"'
      dense
      flat
      icon='close'
      @click='handleClose'
    )
      q-tooltip Закрыть

  .edit-req-panel__toolbar.row.items-center.no-wrap.full-width(
    v-if='variant === "page"'
  )
    .col-auto.row.items-center.no-wrap
      slot(name='toolbar-leading')
    q-space
    .col-auto.row.items-center.q-gutter-sm(v-if='canEdit')
      q-btn(
        flat
        color='primary'
        label='Отменить'
        @click='resetChanges'
        :disable='isSaving || !hasChanges'
      )
      q-btn(
        unelevated
        color='primary'
        label='Сохранить'
        @click='handleSave'
        :loading='isSaving'
        :disable='isSaving || !hasChanges || !titleOk'
      )

  q-card-section.col.scroll.column.no-wrap.edit-req-panel__body
    template(v-if='requirement && isBpmnFormat')
      ClientOnly
        template(#fallback)
          .flex.flex-center.bpmn-fallback
            q-spinner(color='primary' size='48px')
        BpmnStoryEditor(
          v-model='localDescription'
          :readonly='!canEdit'
          :min-height='editorMinHeight'
        )
    template(v-else-if='requirement && isMermaidFormat')
      MermaidStoryEditor(
        v-model='localDescription'
        :readonly='!canEdit'
        :min-height='editorMinHeight'
      )
    template(v-else-if='requirement && isDrawioFormat')
      ClientOnly
        template(#fallback)
          .flex.flex-center.drawio-fallback
            q-spinner(color='primary' size='48px')
        DrawioStoryEmbedEditor(
          v-model='localDescription'
          :readonly='!canEdit'
          :min-height='editorMinHeight'
        )
    Editor(
      v-else-if='requirement'
      v-model='localDescription'
      :readonly='!canEdit'
      :placeholder='canEdit ? "Опишите требование подробно..." : "Описание отсутствует"'
      :minHeight='markdownMinHeight'
      :padded='false'
    )

  q-card-actions.q-pa-md(
    v-if='variant === "dialog" || (canEdit && hasChanges)'
    align='right'
  )
    q-btn(
      v-if='variant === "dialog" && !hasChanges'
      flat
      label='Закрыть'
      @click='handleClose'
    )
    template(v-if='canEdit && hasChanges')
      q-btn(flat label='Отменить' @click='resetChanges' :disable='isSaving')
      q-btn(
        label='Сохранить'
        color='primary'
        @click='handleSave'
        :loading='isSaving'
      )
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { ClientOnly } from 'src/shared/ui/ClientOnly';
import { Editor } from 'src/shared/ui';
import { BpmnStoryEditor } from 'app/extensions/capital/features/Story/BpmnStoryEditor';
import { MermaidStoryEditor } from 'app/extensions/capital/features/Story/MermaidStoryEditor';
import { DrawioStoryEmbedEditor } from 'app/extensions/capital/features/Story/DrawioStoryEmbedEditor';
import { useUpdateStory } from '../../UpdateStory/model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import type { IStory } from 'app/extensions/capital/entities/Story/model';

export type EditRequirementPanelVariant = 'dialog' | 'page';

const props = withDefaults(
  defineProps<{
    requirement?: IStory | null;
    canEdit?: boolean;
    /** dialog — полноэкранный режим в q-dialog; page — встроенная карточка на странице */
    variant?: EditRequirementPanelVariant;
  }>(),
  {
    requirement: null,
    canEdit: true,
    variant: 'page',
  },
);

const emit = defineEmits<{
  /** Запрос закрыть (только для variant dialog; родитель снимает диалог) */
  close: [];
  updated: [requirement: IStory];
}>();

const localTitle = ref('');
const localDescription = ref('');
const originalTitle = ref('');
const originalDescription = ref('');
const isSaving = ref(false);
const { updateStory } = useUpdateStory();

const editorMinHeight = computed(() => (props.variant === 'dialog' ? 480 : 520));
const markdownMinHeight = computed(() => (props.variant === 'dialog' ? 400 : 480));

const isBpmnFormat = computed(() => {
  const fmt = props.requirement?.content_format;
  return fmt === Zeus.CapitalStoryContentFormat.BPMN;
});

const isMermaidFormat = computed(() => {
  const fmt = props.requirement?.content_format;
  return fmt === Zeus.CapitalStoryContentFormat.MERMAID;
});

const isDrawioFormat = computed(() => {
  const fmt = props.requirement?.content_format;
  return fmt === Zeus.CapitalStoryContentFormat.DRAWIO;
});

const hasChanges = computed(() => {
  return (
    localTitle.value !== originalTitle.value ||
    localDescription.value !== originalDescription.value
  );
});

const titleOk = computed(() => !!localTitle.value?.trim());

function syncFromRequirement(row: IStory | null) {
  if (row) {
    localTitle.value = row.title || '';
    localDescription.value = row.description || '';
    originalTitle.value = row.title || '';
    originalDescription.value = row.description || '';
  }
}

watch(
  () => props.requirement,
  (newRequirement) => {
    syncFromRequirement(newRequirement ?? null);
  },
  { immediate: true },
);

const handleClose = () => {
  if (hasChanges.value) {
    if (
      confirm('У вас есть несохранённые изменения. Вы уверены, что хотите закрыть?')
    ) {
      if (props.variant === 'dialog') {
        emit('close');
      }
    }
  } else if (props.variant === 'dialog') {
    emit('close');
  }
};

const resetChanges = () => {
  localTitle.value = originalTitle.value;
  localDescription.value = originalDescription.value;
};

const handleSave = async () => {
  if (!props.requirement || !hasChanges.value) return;

  isSaving.value = true;
  try {
    const updateData = {
      story_hash: props.requirement.story_hash,
      title: localTitle.value,
      description: localDescription.value,
    };

    const updatedRequirement = await updateStory(updateData);

    originalTitle.value = localTitle.value;
    originalDescription.value = localDescription.value;

    SuccessAlert('Требование успешно обновлено');
    emit('updated', updatedRequirement);
  } catch (error) {
    console.error('Ошибка при обновлении требования:', error);
    FailAlert('Не удалось обновить требование');
  } finally {
    isSaving.value = false;
  }
};

/** Сброс полей из текущего requirement (например после открытия диалога) */
function resetFromProps() {
  syncFromRequirement(props.requirement ?? null);
}

/** Для «Назад»: true — можно уходить, false — пользователь отменил */
function tryNavigateAway(): boolean {
  if (!hasChanges.value) {
    return true;
  }
  return confirm(
    'У вас есть несохранённые изменения. Уйти со страницы?',
  );
}

defineExpose({
  resetFromProps,
  tryNavigateAway,
});
</script>

<style lang="scss" scoped>
.edit-req-panel--dialog.q-card {
  height: 100vh;
}

.edit-req-panel--page.q-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.edit-req-panel__toolbar {
  flex-shrink: 0;
  min-height: 48px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.edit-req-panel__body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Растягиваем редактор на оставшуюся высоту карточки (страница не 100vh, в отличие от диалога) */
.edit-req-panel__body > :deep(.bpmn-story-editor),
.edit-req-panel__body > :deep(.drawio-story-embed-editor) {
  flex: 1 1 auto;
  min-height: 0;
  align-self: stretch;
}

.bpmn-fallback,
.drawio-fallback {
  min-height: 480px;
  width: 100%;
}
</style>
