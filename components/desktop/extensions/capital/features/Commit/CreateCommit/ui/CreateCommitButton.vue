<template lang="pug">
q-btn(
  color='accent',
  @click.stop='showDialog = true',
  :loading='loading',
  label="Коммит",
  icon="add",
  :size='mini ? "sm" : "md"',
  :dense="isMobile"
  :disabled='disabled'
)

  q-dialog(v-model='showDialog', @hide='clear')
    ModalBase(:title='"Создать коммит"')
      Form.q-pa-md(
        :handler-submit='handleCreateCommit',
        :is-submitting='isSubmitting',
        :button-submit-txt='"Создать"',
        :button-cancel-txt='"Отмена"',
        @cancel='clear'
      )
        q-card.q-mb-md(flat bordered)
          q-card-section.text-body2
            .text-subtitle2.q-mb-sm Что будет зафиксировано
            ul.q-my-none.q-pl-md
              li
                span.text-weight-medium Проект:
                |
                | {{ projectLabel }}
              li
                span.text-weight-medium Время:
                |
                | {{ formatHours(formData.creator_hours) }} из накопленного по завершённым задачам


        .text-caption.text-grey-7.q-mb-md(v-if='commitBreakdown')
          | Доступно: {{ formatHours(commitBreakdown.total) }}.
          | Будет зафиксировано: {{ formatHours(commitBreakdown.chain) }}.
          span(v-if='commitBreakdown.tail > 1e-6')
            |  Останется в накоплении: {{ formatHours(commitBreakdown.tail) }}.
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useCreateCommit, type ICreateCommitInput } from '../model';
import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { useWindowSize } from 'src/shared/hooks';
import { formatHours } from 'src/shared/lib/utils';

const HOURS_EPS = 1e-9;

const { isMobile } = useWindowSize();
const props = defineProps<{
  mini?: boolean;
  projectHash?: string;
  /** Название проекта для сводки в диалоге */
  projectTitle?: string;
  uncommittedHours?: number;
  disabled?: boolean;
}>();

const projectLabel = computed(() => {
  const t = props.projectTitle?.trim();
  if (t) return t;
  const h = props.projectHash?.trim();
  return h || '—';
});

const system = useSystemStore();
const session = useSessionStore();
const { createCommit, createCommitInput } = useCreateCommit(props.projectHash, session.username);

const loading = ref(false);
const showDialog = ref(false);
const isSubmitting = ref(false);

const formData = ref({
  creator_hours: 0,
  description: '',
});

const commitBreakdown = computed(() => {
  const total = formData.value.creator_hours || 0;
  if (total <= HOURS_EPS) return null;
  const chain = Math.floor(total + HOURS_EPS);
  const tail = Math.max(0, total - chain);
  return { total, chain, tail };
});

// Устанавливаем часы при открытии диалога
watch(showDialog, (isOpen) => {
  if (isOpen) {
    formData.value.creator_hours = props.uncommittedHours || 0;
  }
});

const clear = () => {
  showDialog.value = false;
  formData.value = {
    creator_hours: props.uncommittedHours || 0,
    description: '',
  };
};

const handleCreateCommit = async () => {
  try {
    isSubmitting.value = true;

    const commitDataPayload: ICreateCommitInput = {
      coopname: system.info.coopname,
      commit_hours: formData.value.creator_hours,
      project_hash: props.projectHash || createCommitInput.value.project_hash,
      username: session.username || createCommitInput.value.username,
      description: formData.value.description,
      meta: JSON.stringify({}),
    };

    await createCommit(commitDataPayload);

    SuccessAlert('Коммит успешно создан');
    clear();
  } catch (error) {
    FailAlert(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
