<template lang="pug">
q-dialog(
  :model-value='modelValue',
  @update:model-value='$emit("update:modelValue", $event)',
  persistent,
  :maximized='true'
)
  q-card
    div
      q-bar.bg-gradient-dark.text-white
        span Объявить общее собрание
        q-space
        q-btn(
          v-close-popup,
          dense,
          flat,
          icon='close',
          @click='$emit("update:modelValue", false)'
        )
          q-tooltip Закрыть

      .q-pa-sm.row.justify-center
        .q-pa-md(style='max-width: 800px; width: 100%')
          .text-caption.text-grey.q-mt-md При объявлении собрания будет сгенерирован документ повестки и отправлен в совет для принятия решения.
            |
            | После того, как решение будет принято, собрание будет запланировано, а все пайщики получат оповещения с предложением ознакомиться с повесткой и подписать Уведомление.

          q-form.q-mt-md(@submit='handleSubmit')
            // Выбор типа собрания
            q-select(
              v-model='formData.type',
              :options='meetTypeOptions',
              label='Тип собрания',
              emit-value,
              map-options,
              :rules='[(val) => !!val || "Обязательное поле"]',
              dense,
              standout='bg-teal text-white'
            )

            UserSearchSelector(
              v-model='formData.presider',
              label='Председатель собрания',
              :rules='[(val) => !!val || "Обязательное поле"]',
              dense,
              standout='bg-teal text-white'
            )

            UserSearchSelector(
              v-model='formData.secretary',
              label='Секретарь собрания',
              :rules='[(val) => !!val || "Обязательное поле"]',
              dense,
              standout='bg-teal text-white'
            )

            q-input(
              v-model='formData.open_at',
              :label='`Дата и время открытия (мин. через 15 дней, ${timezoneLabel})`',
              type='datetime-local',
              :rules='[(val) => !!val || "Обязательное поле"]',
              dense,
              standout='bg-teal text-white'
            )

            q-input(
              v-model='formData.close_at',
              :label='`Дата и время закрытия (${timezoneLabel})`',
              type='datetime-local',
              :rules='[(val) => !!val || "Обязательное поле"]',
              dense,
              standout='bg-teal text-white'
            )

            .text-h6.q-mt-md Повестка собрания

            q-card.q-mb-lg.q-pa-sm(
              flat,
              v-for='(point, index) in agendaPoints',
              :key='index'
            )
              .row.items-center.q-mb-sm
                .text-subtitle1.q-mr-md № {{ index + 1 }}
                .col-auto
                  q-btn(
                    flat,
                    icon='delete',
                    size='sm',
                    color='grey',
                    @click='removeAgendaPoint(index)'
                  )

              .q-mb-sm
                q-input(
                  v-model='point.title',
                  label='Вопрос',
                  :rules='[(val) => !!val || "Обязательное поле"]',
                  dense,
                  type='textarea',
                  autogrow,
                  standout='bg-teal text-white'
                )

              .q-mb-sm
                q-input(
                  v-model='point.decision',
                  label='Проект Решения',
                  :rules='[(val) => !!val || "Обязательное поле"]',
                  dense,
                  type='textarea',
                  autogrow,
                  standout='bg-teal text-white'
                )

              .q-mb-sm
                q-input(
                  v-model='point.context',
                  label='Приложения',
                  dense,
                  type='textarea',
                  autogrow,
                  standout='bg-teal text-white'
                )

              q-separator(v-if='index < agendaPoints.length - 1')

            .text-center.q-mb-md
              q-btn(
                flat,
                icon='add',
                label='Добавить',
                @click='addAgendaPoint'
              )

          .q-mt-lg
            q-btn(
              flat,
              label='Отмена',
              @click='$emit("update:modelValue", false)',
              :disable='loading'
            )
            q-btn.q-ml-sm(
              color='primary',
              label='Создать',
              @click='handleSubmit',
              :loading='loading'
            )
</template>

<script setup lang="ts">
import { reactive, computed, watch, ref } from 'vue';
import { useAgendaPoints } from 'src/shared/hooks/useAgendaPoints';
import {
  convertLocalDateToUTC,
  getTimezoneLabel,
  getFutureDateForForm,
} from 'src/shared/lib/utils/dates/timezone';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { UserSearchSelector } from 'src/shared/ui';
import type { CreateMeetPreset } from './types';
import type { AgendaPoint } from 'src/shared/hooks/useAgendaPoints';

// Определяем пропсы один раз
const props = defineProps<{
  modelValue: boolean;
  loading?: boolean;
  isChairman: boolean;
  preset?: CreateMeetPreset;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'create', data: any): void;
}>();

// Название часового пояса для отображения в лейблах
const timezoneLabel = getTimezoneLabel();
const session = useSessionStore();
const system = useSystemStore();

// Опции для выбора типа собрания в зависимости от роли
const meetTypeOptions = computed(() => {
  // Выведем отладочную информацию, чтобы увидеть значение флага
  console.log('isChairman в форме для опций:', props.isChairman);

  // Председатель может выбирать любой тип
  if (props.isChairman) {
    return [
      { label: 'Очередное собрание', value: 'regular' },
      { label: 'Внеочередное собрание', value: 'extra' },
    ];
  }
  // Члены совета могут создавать только внеочередное
  return [{ label: 'Внеочередное собрание', value: 'extra' }];
});

// Форма для создания собрания
const buildDefaults = () => ({
  coopname: system.info.coopname,
  initiator: session.username,
  presider: '',
  secretary: '',
  open_at: getFutureDateForForm(15, 6, 0), // через 15 дней, 6:00
  close_at: getFutureDateForForm(18, 12, 0), // через 18 дней, 12:00
  username: session.username,
  type: props.isChairman ? 'regular' : 'extra', // Тип по умолчанию в зависимости от роли
});

// Локальная копия пунктов повестки, чтобы пользователь мог добавлять новые
const agendaPoints = ref<AgendaPoint[]>([]);

// Инициализируем пункты повестки из пресета при первом открытии
watch(() => props.preset, (newPreset) => {
  if (newPreset && newPreset.agenda_points) {
    // Если это первый раз или массив пустой, инициализируем из пресета
    if (agendaPoints.value.length === 0) {
      agendaPoints.value = newPreset.agenda_points.map(point => ({
        title: point.title,
        decision: point.decision,
        context: point.context || ''
      }));
    }
    // Иначе оставляем существующие пункты (пользователь мог добавить свои)
  }
}, { immediate: true });

const formData = reactive({
  ...buildDefaults(),
  ...(props.preset || {}),
});

// Синхронизируем agenda_points с локальной переменной
watch(agendaPoints, (newPoints) => {
  formData.agenda_points = newPoints;
}, { immediate: true });

// Следим за изменениями preset (кроме agenda_points) и обновляем formData
watch(() => props.preset, (newPreset) => {
  if (newPreset) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { agenda_points, ...presetWithoutAgenda } = newPreset;
    Object.assign(formData, {
      ...buildDefaults(),
      ...presetWithoutAgenda,
      agenda_points: agendaPoints.value,
    });
  }
}, { immediate: true });

const { addAgendaPoint, removeAgendaPoint } = useAgendaPoints(agendaPoints);

const handleSubmit = () => {
  // Конвертируем локальные даты в UTC для отправки в блокчейн
  const dataToSend = {
    ...formData,
    open_at: convertLocalDateToUTC(formData.open_at),
    close_at: convertLocalDateToUTC(formData.close_at),
  };

  emit('create', dataToSend);
};
</script>
