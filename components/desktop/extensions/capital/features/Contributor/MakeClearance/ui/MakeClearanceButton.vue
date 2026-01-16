<template lang="pug">
q-btn(
  color="accent"
  label="Принять участие"
  @click="dialogRef?.openDialog()"
  :fab="fab"
  :disable="isSubmitting"
  v-if="!project?.permissions?.pending_clearance"
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
        .q-mb-sm(v-if="parentProject && !parentProject.permissions?.has_clearance && !parentProject.permissions?.pending_clearance")
          .text-caption.text-grey-7
            | Также будет отправлен запрос на допуск к родительскому проекту:
          .q-ml-sm
            ProjectPathWidget(:project="parentProject")
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
import { ref, onMounted, watch } from 'vue';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useMakeClearance } from '../model';
import { ProjectPathWidget } from 'app/extensions/capital/widgets/ProjectPathWidget';
import type { IGetProjectOutput } from 'app/extensions/capital/entities/Project/model';
import { useSystemStore } from 'src/entities/System/model';
import { useProjectStore } from 'app/extensions/capital/entities/Project/model';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { CreateDialog } from 'src/shared/ui/CreateDialog';

interface Props {
  project: IGetProjectOutput;
  fab?: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  'clearance-submitted': [];
}>();
const { info } = useSystemStore();
const projectStore = useProjectStore();
const contributorStore = useContributorStore();

const { respondToInvite } = useMakeClearance();

const dialogRef = ref();
const contributionText = ref('');
const isSubmitting = ref(false);
const parentProject = ref<IGetProjectOutput | null>(null);

// Функция загрузки родительского проекта
const loadParentProject = async () => {
  if (!props.project?.parent_hash) {
    parentProject.value = null;
    return;
  }

  try {
    // Ищем родительский проект в store
    const existingParent = projectStore.projects.items.find(
      p => p.project_hash === props.project?.parent_hash
    );

    if (existingParent) {
      parentProject.value = existingParent;
    } else {
      // Загружаем родительский проект
      const loadedParent = await projectStore.loadProject({
        hash: props.project.parent_hash
      });
      parentProject.value = loadedParent || null;
    }
  } catch (error) {
    console.error('Ошибка при загрузке родительского проекта:', error);
    parentProject.value = null;
  }
};

// Функция инициализации формы с данными из профиля
const initializeForm = () => {
  // Предзаполняем поле значением из "О себе" как шаблоном
  contributionText.value = contributorStore.self?.about || '';
};

// Функция очистки формы
const clear = () => {
  initializeForm();
};

// Обработчик подтверждения отклика
const handleConfirmRespond = async () => {
  if (!props.project || !contributionText.value.trim()) return;

  isSubmitting.value = true;
  try {
    const contribution = contributionText.value.trim();
    const projectHashes: string[] = [props.project.project_hash];

    // Проверяем статус родительского проекта
    if (parentProject.value) {
      const parentPermissions = parentProject.value.permissions;

      // Если нет допуска к родительскому проекту и нет запроса в рассмотрении,
      // добавляем родительский проект в список для запроса
      if (!parentPermissions?.has_clearance && !parentPermissions?.pending_clearance) {
        projectHashes.unshift(parentProject.value.project_hash);
      }
      // Если допуск есть или запрос в рассмотрении, отправляем только запрос на текущий проект
    }

    // Отправляем запросы для всех необходимых проектов
    // Теперь просто передаем project_hash, все остальное извлекается на бэкенде
    for (const projectHash of projectHashes) {
      await respondToInvite(
        projectHash,
        info.coopname,
        contribution
      );
    }

    SuccessAlert('Отклик отправлен успешно!');
    dialogRef.value?.clear();

    // Уведомляем родительский компонент об успешной отправке запроса на допуск
    emit('clearance-submitted');

  } catch (error) {
    console.error('Ошибка при отправке отклика:', error);
    FailAlert(error, 'Не удалось отправить отклик');
  } finally {
    isSubmitting.value = false;
  }
};

// Загружаем родительский проект и инициализируем форму при монтировании компонента
onMounted(async () => {
  await loadParentProject();
  initializeForm();
});

// Следим за изменениями проекта и перезагружаем родительский проект при необходимости
watch(() => props.project, async (newProject, oldProject) => {
  if (newProject?.parent_hash !== oldProject?.parent_hash) {
    await loadParentProject();
  }
}, { deep: true });

// Следим за изменениями в профиле пользователя и обновляем предзаполненное значение
watch(() => contributorStore.self?.about, (newAbout) => {
  // Обновляем значение только если поле пустое или равно старому значению "О себе"
  if (!contributionText.value.trim() || contributionText.value === contributorStore.self?.about) {
    contributionText.value = newAbout || '';
  }
});
</script>
