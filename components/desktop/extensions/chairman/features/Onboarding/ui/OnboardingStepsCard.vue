<template lang="pug">
q-card
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
          ) Ожидаем решение совета
        q-item-section(side)
          q-btn(
            v-if="step.type === 'agenda' && showAction(index)"
            :disable="loadingAction"
            color="primary"
            label="Провести собрание совета"
            @click="openAgendaDialog(step)"
          )

          ImportParticipantsButton(
            v-else-if="step.type === 'import' && showAction(index)"
            :disable="loadingAction"
          )
          q-btn(
            v-else-if="step.type === 'meet' && showAction(index)"
            :disable="loadingAction"
            color="primary"
            label="Объявить общее собрание"
            @click="openMeetDialog"
          )

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
          q-btn(color="primary" label="Создать" :loading="loadingAction" @click="submitAgenda")

  CreateMeetForm(
    v-model="meetDialog"
    :loading="loadingAction"
    :is-chairman="true"
    :preset="meetPreset"
    @create="handleCreateMeet"
  )
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { CreateMeetForm } from 'src/features/Meet/CreateMeet/ui';
import { ImportParticipantsButton } from 'src/features/User/ImportParticipants/ui';
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { useOnboardingFlow } from '../model';

const {
  steps,
  countdownLabel,
  loadingAction,
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

const getIcon = (step: { done: boolean; pending: boolean }) => {
  if (step.done) return 'task_alt';
  if (step.pending) return 'hourglass_top';
  return 'radio_button_unchecked';
};

const getIconColor = (step: { done: boolean; pending: boolean }) => {
  if (step.done) return 'green-6';
  if (step.pending) return 'orange-6';
  return 'grey-6';
};

const isPrevStarted = (index: number) => {
  if (index === 0) return true;
  const prev = steps.value[index - 1];
  if (!prev) return true;
  return prev.done || prev.pending || prev.type === 'import';
};

const showAction = (index: number) => {
  const step = steps.value[index];
  if (!step) return false;
  if (step.done || step.pending) return false;
  return isPrevStarted(index);
};

onMounted(init);
</script>
