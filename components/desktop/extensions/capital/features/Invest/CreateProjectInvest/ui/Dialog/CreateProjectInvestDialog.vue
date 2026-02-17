<template lang="pug">
CreateDialog(
  ref="dialogRef"
  title="Инвестирование в проект"
  submit-text="Инвестировать"
  dialog-style="width: 600px; max-width: 100% !important;"
  :is-submitting="isGenerating"
  @submit="handleSubmit"
  @dialog-closed="clear"
)
  template(#form-fields)
    q-input(
      v-model='quantity'
      standout='bg-teal text-white'
      placeholder='Введите сумму инвестиций'
      type='number'
      :min='0'
      :rules='[(val) => val > 0 || "Сумма инвестиций должна быть положительной"]'
    )
      template(#append)
        span.text-overline {{ currency }}
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { CreateDialog } from 'src/shared/ui/CreateDialog';
import { useCreateProjectInvest } from '../../model';
import { useSetPlan } from 'app/extensions/capital/features/Project/SetPlan';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import type { IProject } from '../../../../../entities/Project/model';

const props = defineProps<{ project: IProject | null | undefined }>();

const emit = defineEmits<{
  success: [];
  error: [error: any];
}>();

const dialogRef = ref();
const {
  createProjectInvestWithGeneratedStatement,
  isGenerating
} = useCreateProjectInvest();
const { governSymbol } = useSetPlan();

const quantity = ref();

const clear = (): void => {
  quantity.value = '';
};

// Обработка инвестирования (генерация + подпись + создание)
const handleSubmit = async (): Promise<void> => {
  if (!props.project?.project_hash) {
    FailAlert('Не указан проект');
    return;
  }

  try {
    // Создаем инвестицию с сгенерированным и подписанным заявлением
    await createProjectInvestWithGeneratedStatement(
      quantity.value.toString(),
      props.project.project_hash
    );

    // Показываем сообщение об успехе и закрываем диалог
    SuccessAlert('Инвестиция принята успешно');

    // Закрываем диалог после успешного создания
    dialogRef.value?.clear();
    emit('success');
  } catch (e: any) {
    console.log('e.message', e.message);
    FailAlert(e);
    emit('error', e);
  }
};

const currency = computed(() => governSymbol.value);

// Инициализация данных для инвестирования при изменении проекта
watch(() => props.project, () => {
  // Теперь инициализация происходит в createProjectInvestWithGeneratedStatement
}, { immediate: true });

// Экспортируем функции для внешнего использования
defineExpose({
  openDialog: () => dialogRef.value?.openDialog(),
  clear: () => dialogRef.value?.clear(),
});
</script>
