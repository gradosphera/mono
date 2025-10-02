<template lang="pug">
div
  .q-pa-md
    q-card(flat)
      q-card-section
        .text-h6.q-mb-md Планирование проекта

        // Если проект не запланирован - показываем форму планирования
        template(v-if='project && !project.is_planed')
          .q-gutter-md
            q-card.q-pa-sm(flat)
              q-card-section.q-pa-sm
                .text-subtitle2.q-mb-xs Установить план проекта
                .text-captionspan.text-grey-7.q-mb-md Настройка финансового плана и сроков реализации проекта

                q-form(@submit='handleSubmitPlan' class='q-gutter-md')
                  q-input(
                    v-model.number='planForm.plan_creators_hours'
                    label='Плановое количество часов создателей'
                    type='number'
                    :rules='[val => val > 0 || "Количество часов должно быть больше 0"]'
                    outlined
                  )
                    template(#append)
                      span.text-grey-7 ч

                  q-input(
                    v-model='planForm.plan_expenses'
                    label='Плановые расходы'
                    :rules='[val => !!val || "Плановые расходы обязательны"]'
                    outlined
                  )
                    template(#append)
                      span.text-grey-7 {{ governSymbol }}

                  q-input(
                    v-model='planForm.plan_hour_cost'
                    label='Стоимость часа работы'
                    :rules='[val => !!val || "Стоимость часа работы обязательна"]'
                    outlined
                  )
                    template(#append)
                      span.text-grey-7 {{ governSymbol }}

                  q-btn(
                    type='submit'
                    color='primary'
                    label='Установить план'
                    :loading='submitting'
                    :disable='!isFormValid'
                  )

        // Если проект запланирован - показываем сравнение плана и факта
        template(v-if='project && project.is_planed')
          .q-gutter-md
            q-card.q-pa-sm(flat bordered)
              q-card-section.q-pa-sm
                .text-subtitle2.q-mb-md Сравнение плана и факта

                .row.q-gutter-md
                  .col-6
                    .text-subtitle2.text-primary План
                  .col-6
                    .text-subtitle2.text-positive Факт

                // Сравнение основных показателей
                .q-mt-md
                  .row.q-gutter-md.q-mb-sm(v-for='field in comparisonFields' :key='field.key')
                    .col-6
                      .text-body2 {{ field.label }}:
                      .text-weight-bold {{ formatValue(project.plan[field.key]) }}
                    .col-6
                      .text-body2 {{ field.label }}:
                      .text-weight-bold.text-positive {{ formatValue(project.fact[field.key]) }}

                // Кнопка для изменения плана
                q-btn.q-mt-md(
                  size='sm'
                  color='secondary'
                  outline
                  @click='showPlanForm = true'
                  label='Изменить план'
                  v-if='!showPlanForm'
                )

            // Форма изменения плана (показывается при нажатии "Изменить план")
            q-card.q-pa-sm(v-if='showPlanForm' flat bordered)
              q-card-section.q-pa-sm
                .text-subtitle2.q-mb-xs Изменить план проекта

                q-form(@submit='handleUpdatePlan' class='q-gutter-md')
                  q-input(
                    v-model.number='planForm.plan_creators_hours'
                    label='Плановое количество часов создателей'
                    type='number'
                    :rules='[val => val > 0 || "Количество часов должно быть больше 0"]'
                    outlined
                  )
                    template(#append)
                      span.text-grey-7 ч

                  q-input(
                    v-model='planForm.plan_expenses'
                    label='Плановые расходы'
                    :rules='[val => !!val || "Плановые расходы обязательны"]'
                    outlined
                  )
                    template(#append)
                      span.text-grey-7 {{ governSymbol }}

                  q-input(
                    v-model='planForm.plan_hour_cost'
                    label='Стоимость часа работы'
                    :rules='[val => !!val || "Стоимость часа работы обязательна"]'
                    outlined
                  )
                    template(#append)
                      span.text-grey-7 {{ governSymbol }}

                  .row.q-gutter-sm
                    q-btn(
                      type='submit'
                      color='primary'
                      label='Сохранить изменения'
                      :loading='submitting'
                      :disable='!isFormValid'
                    )
                    q-btn(
                      flat
                      color='grey'
                      @click='cancelEdit'
                      label='Отмена'
                    )
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSetPlan } from '../../features/Project/SetPlan/model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { useSessionStore } from 'src/entities/Session';
import type { IProject } from '../../entities/Project/model';

const props = defineProps<{ project: IProject | null | undefined }>();

const session = useSessionStore();
const { setPlan, governSymbol, formatAmount, formatAmountForEOSIO } = useSetPlan();

const submitting = ref(false);
const showPlanForm = ref(false);

// Форма планирования
const planForm = ref({
  plan_creators_hours: 0,
  plan_expenses: '',
  plan_hour_cost: ''
});

// Поля для сравнения плана и факта
const comparisonFields = [
  { key: 'hour_cost', label: 'Стоимость часа работы' },
  { key: 'creators_hours', label: 'Часы создателей' },
  { key: 'creators_base_pool', label: 'Базовый пул создателей' },
  { key: 'authors_base_pool', label: 'Базовый пул авторов' },
  { key: 'coordinators_base_pool', label: 'Базовый пул координаторов' },
  { key: 'creators_bonus_pool', label: 'Бонусный пул создателей' },
  { key: 'authors_bonus_pool', label: 'Бонусный пул авторов' },
  { key: 'contributors_bonus_pool', label: 'Бонусный пул вкладчиков' },
  { key: 'target_expense_pool', label: 'Целевой пул расходов' },
  { key: 'invest_pool', label: 'Инвестиционный пул' },
  { key: 'total_generation_pool', label: 'Общий генерационный пул' },
  { key: 'total', label: 'Общая сумма' }
];

// Валидация формы
const isFormValid = computed(() => {
  return planForm.value.plan_creators_hours > 0 &&
         planForm.value.plan_expenses.trim() &&
         planForm.value.plan_hour_cost.trim();
});

// Сброс формы
const resetForm = () => {
  planForm.value = {
    plan_creators_hours: 0,
    plan_expenses: '',
    plan_hour_cost: ''
  };
};

// Форматирование значений для отображения
const formatValue = (value: any): string => {
  if (value == null || value === '') {
    return '—';
  }
  if (typeof value === 'string') {
    // Для строковых значений пробуем отформатировать как сумму
    return formatAmount(value);
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return String(value);
};

// Инициализация формы при изменении проекта
watch(
  () => props.project,
  (newProject) => {
    if (newProject && newProject.is_planed) {
      // Для запланированного проекта заполняем форму текущими значениями
      planForm.value.plan_creators_hours = newProject.plan.creators_hours || 0;
      planForm.value.plan_expenses = newProject.plan.target_expense_pool || '';
      planForm.value.plan_hour_cost = newProject.plan.hour_cost || '';
    } else {
      // Для нового проекта сбрасываем форму
      resetForm();
    }
  },
  { immediate: true }
);

// Обработка отправки формы для нового плана
const handleSubmitPlan = async () => {
  if (!props.project || !session.username) return;

  submitting.value = true;
  try {
    const planData = {
      coopname: props.project.coopname,
      master: session.username,
      project_hash: props.project.project_hash,
      plan_creators_hours: planForm.value.plan_creators_hours,
      plan_expenses: formatAmountForEOSIO(planForm.value.plan_expenses),
      plan_hour_cost: formatAmountForEOSIO(planForm.value.plan_hour_cost)
    };

    await setPlan(planData);
    SuccessAlert('План проекта успешно установлен');

    // После успешного сохранения можно обновить проект или показать уведомление
    // emit('project-updated', props.project.project_hash);

  } catch (error) {
    FailAlert(error);
  } finally {
    submitting.value = false;
  }
};

// Обработка обновления существующего плана
const handleUpdatePlan = async () => {
  await handleSubmitPlan();
  showPlanForm.value = false;
};

// Отмена редактирования
const cancelEdit = () => {
  showPlanForm.value = false;
  // Восстанавливаем значения из проекта
  if (props.project && props.project.is_planed) {
    planForm.value.plan_creators_hours = props.project.plan.creators_hours || 0;
    planForm.value.plan_expenses = props.project.plan.target_expense_pool || '';
    planForm.value.plan_hour_cost = props.project.plan.hour_cost || '';
  }
};
</script>
