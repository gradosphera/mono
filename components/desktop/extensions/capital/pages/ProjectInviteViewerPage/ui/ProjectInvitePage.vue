<template lang="pug">
div
  // Лоадер пока идет загрузка
  WindowLoader(v-if="loading", text="Загрузка приглашения...")

  // Основной контент после загрузки
  div.q-pa-md(v-else)
    // Заголовок страницы
    .text-h4.q-mb-md Приглашение в проект

    // Путь проекта
    ProjectPathWidget(
      :project="project"
      class="q-mb-md"
    )

    // Контент в зависимости от наличия инвайта
    template(v-if="project?.invite")
      // Полный виджет инвайта
      InviteWidget(
        :invite="project.invite"
      )

      // Кнопка отклика
      .q-mt-md.text-center
        MakeClearanceButton(
          :project="project"
        )

    template(v-else)
      // Заглушка если нет инвайта
      .text-center.q-pa-lg
        .text-h6.q-mb-md Нет активного приглашения
        .text-body2.text-grey-6
          | Для этого проекта нет активного приглашения или оно уже истекло

</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { FailAlert } from 'src/shared/api';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useBackButton } from 'src/shared/lib/navigation';
import { api as ProjectApi } from 'app/extensions/capital/entities/Project/api';
import type { IGetProjectOutput } from 'app/extensions/capital/entities/Project/model';
import { InviteWidget } from 'app/extensions/capital/widgets';
import { ProjectPathWidget } from 'app/extensions/capital/widgets/ProjectPathWidget';
import { MakeClearanceButton } from 'app/extensions/capital/features/Contributor/MakeClearance';

const route = useRoute();

// Получаем hash проекта из параметров маршрута
const projectHash = computed(() => route.params.project_hash as string);

// Настраиваем кнопку "Назад"
useBackButton({
  text: 'Назад',
  componentId: 'project-invite-' + projectHash.value,
});

const project = ref<IGetProjectOutput | null>(null);
const loading = ref(false);

// Загрузка проекта по хешу
const loadProject = async (projectHash: string) => {
  loading.value = true;
  try {
    const result = await ProjectApi.loadProject({
      hash: projectHash,
    });

    project.value = result;
  } catch (error) {
    console.error('Ошибка при загрузке проекта:', error);
    FailAlert('Не удалось загрузить проект');
  } finally {
    loading.value = false;
  }
};


// Инициализация
onMounted(async () => {
  const projectHash = route.params.project_hash as string;
  if (projectHash) {
    await loadProject(projectHash);
  }
});
</script>
