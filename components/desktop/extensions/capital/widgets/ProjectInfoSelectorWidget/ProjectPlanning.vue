<template lang="pug">
div
  .q-pa-md
    q-card(flat)
      q-card-section
        // Управление инвестициями (показывается только для запланированных проектов, когда не редактируется план)
        template(v-if='project && project.is_planed && !showPlanForm')
          q-card.q-pa-sm(flat)
            q-card-section.q-pa-sm
              .row.q-gutter-sm
                CreateProjectInvestButton(:project='project')

        // Форма планирования (показывается когда нет плана или редактируется существующий)
        template(v-if='project && (!project.is_planed || showPlanForm)')
          .q-gutter-md
            q-card.q-pa-sm(flat)
              q-card-section.q-pa-sm
                .text-subtitle2.q-mb-xs {{ showPlanForm ? 'Изменить план проекта' : 'Установить план проекта' }}
                .text-caption.text-grey-7.q-mb-md Настройка финансового плана и сроков реализации проекта

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

                  .row.q-gutter-sm
                    q-btn(
                      type='submit'
                      color='accent'
                      :label='showPlanForm ? "Сохранить изменения" : "Установить план"'
                      :loading='submitting'
                    )
                    q-btn(
                      v-if='showPlanForm'
                      flat
                      color='grey'
                      @click='cancelEdit'
                      label='Отмена'
                    )

        // Если проект запланирован и не редактируется - показываем сравнение плана и факта
        template(v-if='project && project.is_planed && !showPlanForm')
          .q-gutter-md
            q-card.q-pa-sm(flat)
              q-card-section.q-pa-sm

                q-table(
                  :rows='comparisonFields',
                  :columns='tableColumns',
                  row-key='key',
                  flat,
                  square,
                  :pagination='{ rowsPerPage: 0 }',
                  :no-data-label='"Нет данных"'
                  hide-bottom
                )
                  template(#body='props')
                    q-tr(:props='props')
                      q-td {{ props.row.label }}
                      q-td.text-right
                        .text-weight-bold {{ formatValue(project.plan[props.row.key]) }}
                      q-td.text-right
                        .text-weight-bold {{ formatValue(project.fact[props.row.key]) }}

                // Кнопка для изменения плана
                q-btn.q-mt-md(
                  size='sm'
                  color='primary'
                  @click='showPlanForm = true'
                  label='Изменить план'
                  v-if='!showPlanForm'
                )


</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSetPlan } from '../../features/Project/SetPlan/model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { useSessionStore } from 'src/entities/Session';
import CreateProjectInvestButton from '../../features/Invest/CreateProjectInvest/ui/CreateProjectInvestButton.vue';
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

// Колонки для таблицы сравнения плана и факта
const tableColumns = [
  {
    name: 'label',
    label: 'Показатель',
    align: 'left' as const,
    field: 'label' as const,
    sortable: false,
  },
  {
    name: 'plan',
    label: 'План',
    align: 'right' as const,
    field: 'plan' as const,
    sortable: false,
  },
  {
    name: 'fact',
    label: 'Факт',
    align: 'right' as const,
    field: 'fact' as const,
    sortable: false,
  },
];

// Поля для сравнения плана и факта
const comparisonFields = [
  { key: 'hour_cost', label: 'Стоимость часа создателей' },
  { key: 'creators_hours', label: 'Требуемый ресурс времени создателей' },
  { key: 'creators_base_pool', label: 'Себестоимость вклада создателей' },
  { key: 'authors_base_pool', label: 'Себестоимость вклада авторов' },
  { key: 'coordinators_base_pool', label: 'Себестоимость вклада координаторов' },
  { key: 'creators_bonus_pool', label: 'Премии создателей' },
  { key: 'authors_bonus_pool', label: 'Премии авторов' },
  { key: 'contributors_bonus_pool', label: 'Премии участников' },
  { key: 'target_expense_pool', label: 'Дополнительные расходы' },
  { key: 'invest_pool', label: 'Привлекаемые инвестиции' },
  // { key: 'total_generation_pool', label: 'Общий генерационный пул' },
  // { key: 'total', label: 'Общая сумма' }
];

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

// Обработка отправки формы для установки/обновления плана
const handleSubmitPlan = async () => {
  console.log('handleSubmitPlan called');
  if (!props.project || !session.username) return;

  submitting.value = true;
  try {
    const planData = {
      coopname: props.project.coopname,
      master: props.project.master,
      project_hash: props.project.project_hash,
      plan_creators_hours: planForm.value.plan_creators_hours,
      plan_expenses: formatAmountForEOSIO(planForm.value.plan_expenses),
      plan_hour_cost: formatAmountForEOSIO(planForm.value.plan_hour_cost)
    };

    await setPlan(planData);
    SuccessAlert(showPlanForm.value ? 'План проекта успешно изменен' : 'План проекта успешно установлен');
    showPlanForm.value = false; // Закрываем форму после успешного сохранения

  } catch (error) {
    FailAlert(error);
  } finally {
    submitting.value = false;
  }
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
