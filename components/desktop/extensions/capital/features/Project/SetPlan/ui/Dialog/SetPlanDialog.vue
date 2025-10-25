<template lang="pug">
CreateDialog(
  ref="dialogRef"
  title="Установить план проекта"
  submit-text="Установить план"
  dialog-style="width: 600px; max-width: 100% !important;"
  :is-submitting="isSubmitting"
  @submit="handleSubmit"
  @dialog-closed="clear"
)
  template(#form-fields)
    q-input(
      v-model.number='formData.plan_creators_hours'
      label='Плановое количество часов создателей'
      type='number'
      :rules='[(val) => val > 0 || "Количество часов должно быть больше 0"]'
      outlined
    )
      template(#append)
        span.text-grey-7 ч

    q-input(
      v-model='formData.plan_hour_cost'
      label='Стоимость часа работы'
      :rules='[(val) => !!val || "Стоимость часа работы обязательна"]'
      outlined
    )
      template(#append)
        span.text-grey-7 {{ governSymbol }}
    q-input(
      v-model='formData.plan_expenses'
      label='Дополнительные расходы'
      :rules='[(val) => !!val || "Плановые расходы обязательны"]'
      outlined
    )
      template(#append)
        span.text-grey-7 {{ governSymbol }}


</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSetPlan } from '../../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { CreateDialog } from 'src/shared/ui/CreateDialog';
import type { IProject } from '../../../../../entities/Project/model';

const props = defineProps<{ project: IProject | null | undefined }>();

const emit = defineEmits<{
  success: [];
  error: [error: any];
}>();

const dialogRef = ref();
const { setPlan, governSymbol, formatAmountForEOSIO } = useSetPlan();
const isSubmitting = ref(false);

const formData = ref({
  plan_creators_hours: 0,
  plan_expenses: '',
  plan_hour_cost: ''
});

const clear = () => {
  formData.value = {
    plan_creators_hours: 0,
    plan_expenses: '',
    plan_hour_cost: ''
  };
};

// Обновляем входные данные при изменении проекта
watch(
  () => props.project,
  (newProject) => {
    if (newProject && newProject.is_planed) {
      // Для запланированного проекта заполняем форму текущими значениями
      formData.value.plan_creators_hours = newProject.plan.creators_hours || 0;
      formData.value.plan_expenses = newProject.plan.target_expense_pool || '';
      formData.value.plan_hour_cost = newProject.plan.hour_cost || '';
    } else {
      // Для нового проекта сбрасываем форму
      formData.value = {
        plan_creators_hours: 0,
        plan_expenses: '',
        plan_hour_cost: ''
      };
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (!props.project) return;

  isSubmitting.value = true;
  try {
    const planData = {
      coopname: props.project.coopname || '',
      master: props.project.master || '',
      project_hash: props.project.project_hash,
      plan_creators_hours: formData.value.plan_creators_hours,
      plan_expenses: formatAmountForEOSIO(formData.value.plan_expenses),
      plan_hour_cost: formatAmountForEOSIO(formData.value.plan_hour_cost)
    };

    await setPlan(planData);
    SuccessAlert(props.project.is_planed ? 'План проекта успешно изменен' : 'План проекта успешно установлен');

    // Закрываем диалог после успешного создания
    dialogRef.value?.clear();
    emit('success');
  } catch (error) {
    FailAlert(error);
    emit('error', error);
  } finally {
    isSubmitting.value = false;
  }
};

// Экспортируем функции для внешнего использования
defineExpose({
  openDialog: () => dialogRef.value?.openDialog(),
  clear: () => dialogRef.value?.clear(),
});
</script>
