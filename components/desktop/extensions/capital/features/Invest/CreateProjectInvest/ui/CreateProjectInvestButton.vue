<template lang="pug">
q-btn(
  color='primary',
  :loading='isGenerating',
  @click='showDialog = true',
  label='Инвестировать в проект'
)
  q-dialog(v-model='showDialog', @hide='clear')
    ModalBase(:title='"Инвестирование в проект"')
      Form.q-pa-sm(
        :handler-submit='handleInvest',
        :is-submitting='isGenerating',
        :button-cancel-txt='"Отменить"',
        :button-submit-txt='"Инвестировать"',
        @cancel='clear'
      )
        q-input(
          v-model='quantity',
          standout='bg-teal text-white',
          placeholder='Введите сумму инвестиций',
          type='number',
          :min='0',
          :rules='[(val) => val > 0 || "Сумма инвестиций должна быть положительной"]'
        )
          template(#append)
            span.text-overline {{ currency }}
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Form } from 'src/shared/ui/Form';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { useCreateProjectInvest } from '../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { useSetPlan } from '../../../Project/SetPlan/model';
import type { IProject } from '../../../../entities/Project/model';

const props = defineProps<{ project: IProject | null | undefined }>();

const {
  createProjectInvestWithGeneratedStatement,
  isGenerating
} = useCreateProjectInvest();
const { governSymbol } = useSetPlan();

const quantity = ref();
const showDialog = ref(false);

const clear = (): void => {
  showDialog.value = false;
  quantity.value = 1000;
};

// Обработка инвестирования (генерация + подпись + создание)
const handleInvest = async (): Promise<void> => {
  if (!props.project?.project_hash) {
    FailAlert('Не указан проект');
    return;
  }

  isGenerating.value = true;
  try {
    // Создаем инвестицию с сгенерированным и подписанным заявлением
    await createProjectInvestWithGeneratedStatement(
      quantity.value.toString(),
      props.project.project_hash
    );

    // Показываем сообщение об успехе и закрываем диалог
    SuccessAlert('Заявление на инвестицию отправлено председателю на утверждение');
    clear();
  } catch (e: any) {
    console.log('e.message', e.message);
    FailAlert(e);
  } finally {
    isGenerating.value = false;
  }
};

const currency = computed(() => governSymbol.value);

// Инициализация данных для инвестирования при изменении проекта
watch(() => props.project, () => {
  // Теперь инициализация происходит в createProjectInvestWithGeneratedStatement
}, { immediate: true });
</script>
