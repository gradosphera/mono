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
import { ref, onMounted, watch } from 'vue';
import { WindowLoader } from 'src/shared/ui/Loader';
import { useBackButton } from 'src/shared/lib/navigation';
import { useProjectLoader } from 'app/extensions/capital/entities/Project/model';
import { InviteWidget } from 'app/extensions/capital/widgets';
import { ProjectPathWidget } from 'app/extensions/capital/widgets/ProjectPathWidget';
import { MakeClearanceButton } from 'app/extensions/capital/features/Contributor/MakeClearance';

// Используем composable для загрузки проекта
const { project, projectHash, loadProject } = useProjectLoader();

// Настраиваем кнопку "Назад"
useBackButton({
  text: 'Назад',
  componentId: 'project-invite-' + projectHash.value,
});

const loading = ref(false);

// Обновляем loading состояние на основе наличия проекта
watch(project, (newProject) => {
  loading.value = !newProject;
});

// Инициализация
onMounted(async () => {
  await loadProject();
});
</script>
