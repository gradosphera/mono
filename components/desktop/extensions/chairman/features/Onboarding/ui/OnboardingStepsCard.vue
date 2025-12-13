<template lang="pug">
// Показываем лоадер пока данные загружаются
WindowLoader(
  v-if="loadingState"
  text="Загрузка данных онбординга..."
)

// Показываем поздравление если онбординг завершен
OnboardingCompletionCelebration(
  v-else-if="isOnboardingCompleted"
)

// Показываем шаги если онбординг не завершен и данные загружены
q-card(v-else flat)
  q-card-section.row.items-center.justify-between
    div
      div.text-h5 Подключение
      q-chip(
        dense
        color="primary"
        text-color="white"
        icon="schedule"
      ) {{ countdownLabel || 'Отсчёт появится после получения данных' }}
  q-separator
  q-card-section
    q-list(separator)
      q-item(v-for="(step, index) in steps" :key="step.key")
        q-item-section
          div.row.items-center.q-gutter-sm
            q-icon(
              :name="getIcon(step)"
              :color="getIconColor(step)"
              size="22px"
            )
            div.text-subtitle1 {{ index + 1 }}. {{ step.title }}
          div.text-caption.text-grey-7 {{ step.description }}
          q-chip(
            v-if="!step.done && step.pending"
            dense
            color="amber"
            text-color="black"
            icon="hourglass_top"
            class="q-mt-xs"
          ) {{ getPendingText(step) }}
        q-item-section(side)
          q-btn(
            v-if="step.type === 'agenda' && showAction(index)"
            :disable="loadingAction"
            color="primary"
            label="Объявить собрание совета"
            @click="openAgendaDialog(step)"
          )

          q-btn(
            v-else-if="step.type === 'import' && showAction(index)"
            :disable="loadingAction || isActionDisabled(index)"
            color="primary"
            icon="upload_file"
            push
            label="Импорт пайщиков"
            @click="importDialog = true"
          )
            q-tooltip(
              v-if="isActionDisabled(index)"
              anchor="top middle"
              self="bottom middle"
            ) Для продолжения примите решения советом
          q-btn(
            v-else-if="step.type === 'meet' && showAction(index)"
            :disable="loadingAction || isActionDisabled(index)"
            color="primary"
            label="Объявить общее собрание"
            @click="openMeetDialog"
          )
            q-tooltip(
              v-if="isActionDisabled(index)"
              anchor="top middle"
              self="bottom middle"
            ) Для продолжения примите решения советом

  q-dialog(v-model="agendaDialog.open" persistent)
    ModalBase(title="Предложение повестки" @close="closeAgendaDialog" style="min-width: 640px")
      template(#default)
        q-card-section
          div.row.items-center.q-gutter-xs.text-subtitle1.text-weight-medium
            q-icon(name="help_outline" size="18px" class="text-primary")
            span Вопрос на повестке
          div.q-mt-sm.q-pa-sm.text-body1.rounded-borders {{ agendaDialog.question }}

          q-separator.q-my-md

          div.row.items-center.q-gutter-xs.text-subtitle1.text-weight-medium
            q-icon(name="gavel" size="18px" class="text-primary")
            span Проект решения
          div.q-mt-sm.q-pa-sm.rounded-borders
            DocumentHtmlReader(:html="agendaDialog.decision" :sanitize="false")
        div.q-pb-lg
          q-btn(flat label="Отмена" @click="closeAgendaDialog" :disable="loadingAction")
          q-btn(color="primary" label="Объявить" :loading="loadingAction" @click="submitAgenda")

  CreateMeetForm(
    v-model="meetDialog"
    :loading="loadingAction"
    :is-chairman="true"
    :preset="meetPreset"
    @create="handleCreateMeet"
  )

  ParticipantsImportDialog(v-model="importDialog")
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { CreateMeetForm } from 'src/features/Meet/CreateMeet/ui';
import { ParticipantsImportDialog } from 'src/features/User/ImportParticipants/ui';
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { WindowLoader } from 'src/shared/ui/Loader';
import OnboardingCompletionCelebration from './OnboardingCompletionCelebration.vue';
import { useOnboardingFlow } from '../model';

const {
  steps,
  countdownLabel,
  isOnboardingCompleted,
  loadingAction,
  loadingState,
  meetDialog,
  meetPreset,
  agendaDialog,
  init,
  openAgendaDialog,
  closeAgendaDialog,
  submitAgenda,
  openMeetDialog,
  handleCreateMeet,
} = useOnboardingFlow();

const importDialog = ref(false);

const getIcon = (step: { done: boolean; pending: boolean; type: string }) => {
  if (step.done) return 'task_alt';
  if (step.pending) return 'hourglass_top';
  if (step.type === 'import') return 'arrow_forward';
  return 'radio_button_unchecked';
};

const getIconColor = (step: { done: boolean; pending: boolean; type: string }) => {
  if (step.done) return 'green-6';
  if (step.pending) return 'orange-6';
  if (step.type === 'import') return '';
  return 'grey-6';
};

const getPendingText = (step: { type: string }) => {
  if (step.type === 'meet') return 'Ожидаем решение общего собрания пайщиков';
  return 'Ожидаем решение совета';
};

const isPrevStarted = (index: number) => {
  if (index === 0) return true;
  const prev = steps.value[index - 1];
  if (!prev) return true;

  // Для шагов импорта и общего собрания проверяем завершение 6-го шага (voskhod_membership)
  if (steps.value[index]?.type === 'import' || steps.value[index]?.type === 'meet') {
    const voskhodStep = steps.value[5]; // 6-й шаг (индекс 5)
    return voskhodStep?.done || voskhodStep?.pending;
  }

  return prev.done || prev.pending;
};

const showAction = (index: number) => {
  const step = steps.value[index];
  if (!step) return false;
  if (step.done || step.pending) return false;
  return isPrevStarted(index);
};

const isActionDisabled = (index: number) => {
  const step = steps.value[index];
  if (!step || step.done || step.pending) return false;

  // Для шагов импорта и общего собрания проверяем, что все agenda шаги выполнены
  if (step.type === 'import' || step.type === 'meet') {
    const agendaSteps = steps.value.slice(0, 6); // Первые 6 шагов - agenda шаги
    return !agendaSteps.every(step => step.done);
  }

  return false;
};

onMounted(init);
</script>
