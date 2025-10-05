<template lang="pug">
q-btn(
  color="primary"
  label="Участвовать"
  @click="showDialog = true"
  icon="send"
  :disable="isLoading"
)
q-dialog(
  v-model="showDialog"
  persistent
)
  q-card
    q-card-section.row.items-center
      .text-h6 Откликнуться на приглашение
      q-space
      q-btn(icon="close", flat, round, dense, v-close-popup)

    q-card-section
      .text-body1.q-mb-md
        | Вы собираетесь откликнуться на приглашение в проект:
      .q-mb-md
        ProjectPathWidget(:project="project")
      .text-body2.q-mb-md
        | Расскажите, какой вклад вы можете внести:

      q-form(@submit="handleConfirmRespond")
        q-input(
          v-model="contributionText"
          type="textarea"
          label="Ваш вклад в проект"
          outlined
          rows="4"
          :rules="[val => !!val || 'Пожалуйста, опишите ваш вклад']"
          required
        )

        q-card-actions(align="right" class="q-mt-md")
          q-btn(
            flat
            label="Отмена"
            v-close-popup
          )
          q-btn(
            color="primary"
            label="Отправить отклик"
            type="submit"
            :loading="isLoading"
            :disable="!contributionText.trim()"
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

interface Props {
  project: IGetProjectOutput;
}
const props = defineProps<Props>();
const { info } = useSystemStore();
const contributorStore = useContributorStore();

const { respondToInvite, isLoading } = useMakeClearance();

const showDialog = ref(false);
const contributionText = ref('');

// Обработчик подтверждения отклика
const handleConfirmRespond = async () => {
  if (!props.project || !contributionText.value.trim()) return;

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
    showDialog.value = false;
    contributionText.value = '';

  } catch (error) {
    console.error('Ошибка при отправке отклика:', error);
    FailAlert(error, 'Не удалось отправить отклик');
  }
};
</script>
