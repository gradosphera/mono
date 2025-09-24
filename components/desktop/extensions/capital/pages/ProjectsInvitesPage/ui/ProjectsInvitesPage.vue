<template lang="pug">
  div.q-pa-md

    // Сетка проектов с инвайтами
    .row.q-gutter-md
      q-card(
        flat bordered
        v-for="project in projects"
        :key="project.project_hash"
        class="col-xs-12 col-md-6"
      ).q-pa-sm
        q-card-section
          // Путь проекта
          ProjectPathWidget(
            :project="project"
          ).full-width.text-center

        // Виджет для отображения invite
        InviteWidget(
          v-if="project.invite"
          :invite="project.invite"
        )

        // Кнопка принятия приглашения
        q-btn(
          color="primary"
          label="Принять приглашение"
          @click="handleAcceptInvite(project)"
          class="q-mt-md"
        )

  // Диалог принятия приглашения
  q-dialog(
    v-model="showAcceptDialog"
    persistent
  )
    q-card
      q-card-section.row.items-center
        .text-h6 Принять приглашение
        q-space
        q-btn(icon="close", flat, round, dense, v-close-popup)

      q-card-section
        .text-body1.q-mb-md
          | Вы собираетесь принять приглашение:
        .q-mb-md
          ProjectPathWidget(:project="selectedProject")
        .text-body2.q-mb-md
          | Расскажите, какой вклад вы можете внести в проект:

        q-form(@submit="handleConfirmAccept")
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
              label="Подтвердить"
              type="submit"
              :loading="accepting"
              :disable="!contributionText.trim()"
            )
</template>
<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useSystemStore } from 'src/entities/System/model';
  import { FailAlert, SuccessAlert } from 'src/shared/api';
  import { api as ProjectApi } from 'app/extensions/capital/entities/Project/api';
  import type { IProject } from 'app/extensions/capital/entities/Project/model';
  import { InviteWidget } from 'app/extensions/capital/widgets';
  import { ProjectPathWidget } from 'app/extensions/capital/widgets/ProjectPathWidget';

  const { info } = useSystemStore();

  const projects = ref<IProject[]>([]);
  const loading = ref(false);
  const showAcceptDialog = ref(false);
  const selectedProject = ref<IProject | null>(null);
  const contributionText = ref('');
  const accepting = ref(false);

  // Загрузка проектов с инвайтами
  const loadProjectsWithInvites = async () => {
    loading.value = true;
    try {
      const result = await ProjectApi.loadProjects({
        filter: {
          coopname: info.coopname,
          has_invite: true,
          is_component: true,
        },
        pagination: {
          page: 1,
          limit: 100, // Загружаем все проекты с инвайтами
        },
      });

      projects.value = result.items || [];
    } catch (error) {
      console.error('Ошибка при загрузке проектов с инвайтами:', error);
      FailAlert('Не удалось загрузить проекты с инвайтами');
    } finally {
      loading.value = false;
    }
  };


  // Обработчик принятия приглашения
  const handleAcceptInvite = (project: IProject) => {
    selectedProject.value = project;
    contributionText.value = '';
    showAcceptDialog.value = true;
  };

  // Обработчик подтверждения принятия приглашения
  const handleConfirmAccept = async () => {
    if (!selectedProject.value || !contributionText.value.trim()) return;

    accepting.value = true;
    try {
      // TODO: Реализовать логику принятия приглашения с contributionText
      console.log('Принятие приглашения:', {
        project: selectedProject.value,
        contribution: contributionText.value
      });

      // Пока просто показываем сообщение
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация запроса

      SuccessAlert('Приглашение принято успешно!');
      showAcceptDialog.value = false;

      // Обновляем список проектов
      await loadProjectsWithInvites();
    } catch (error) {
      console.error('Ошибка при принятии приглашения:', error);
      FailAlert('Не удалось принять приглашение');
    } finally {
      accepting.value = false;
    }
  };


  // Инициализация
  onMounted(async () => {
    await loadProjectsWithInvites();
  });
  </script>
