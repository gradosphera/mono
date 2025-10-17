<template lang="pug">
q-btn(
  color="primary"
  label="Участвовать"
  @click="dialogRef?.openDialog()"
  icon="send"
  :fab="fab"
  :disable="isSubmitting"
).bg-fab-accent-radial
  CreateDialog(
    ref="dialogRef"
    title="Откликнуться на приглашение"
    submit-text="Отправить отклик"
    dialog-style="width: 600px; max-width: 100% !important;"
    :is-submitting="isSubmitting"
    @submit="handleConfirmRespond"
    @dialog-closed="clear"
  )
    template(#form-fields)
      .text-body1.q-mb-md
        | Вы собираетесь откликнуться на приглашение в проект:
      .q-mb-md
        ProjectPathWidget(:project="project")
      .text-body2.q-mb-md
        | Расскажите, какой вклад вы можете внести:

      q-input(
        v-model="contributionText"
        type="textarea"
        label="Ваш вклад в проект"
        outlined
        rows="4"
        :rules="[val => !!val || 'Пожалуйста, опишите ваш вклад']"
        required
      )
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useMakeClearance } from '../model';
import { ProjectPathWidget } from 'app/extensions/capital/widgets/ProjectPathWidget';
import type { IGetProjectOutput } from 'app/extensions/capital/entities/Project/model';
import { useSystemStore } from 'src/entities/System/model';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { CreateDialog } from 'src/shared/ui/CreateDialog';

interface Props {
  project: IGetProjectOutput;
  fab?: boolean;
}
const props = defineProps<Props>();
const { info } = useSystemStore();
const contributorStore = useContributorStore();

const { respondToInvite } = useMakeClearance();

const dialogRef = ref();
const contributionText = ref('');
const isSubmitting = ref(false);

// Функция очистки формы
const clear = () => {
  contributionText.value = '';
};

// Обработчик подтверждения отклика
const handleConfirmRespond = async () => {
  if (!props.project || !contributionText.value.trim()) return;

  isSubmitting.value = true;
  try {
    const contribution = contributionText.value.trim();
    const projectHashes: string[] = [props.project.project_hash];

    // Проверяем, есть ли родительский проект и допуск к нему
    if (props.project.parent_hash && !contributorStore.hasClearance(props.project.parent_hash)) {
      projectHashes.unshift(props.project.parent_hash); // Добавляем родителя первым
    }

    // Отправляем запросы для всех необходимых проектов
    for (const projectHash of projectHashes) {
      await respondToInvite(
        projectHash,
        info.coopname,
        contribution
      );

    }

    SuccessAlert('Отклик отправлен успешно!');
    dialogRef.value?.clear();

  } catch (error) {
    console.error('Ошибка при отправке отклика:', error);
    FailAlert(error, 'Не удалось отправить отклик');
  } finally {
    isSubmitting.value = false;
  }
};
</script>
