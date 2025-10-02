<template lang="pug">
div
  .q-pa-md
    // Управление жизненным циклом проекта
    q-card(flat).q-mb-md
      q-card-section
        .q-gutter-md
          q-card.q-pa-sm(v-if='project' flat bordered)
            q-card-section.q-pa-sm
              .text-subtitle2.q-mb-xs Добавить соавтора
              .text-caption.text-grey-7 Добавляет нового соавтора к проекту для совместной работы
              AddAuthorButton.q-mt-sm(:project='project')

          q-card.q-pa-sm(v-if='project' flat bordered)
            q-card-section.q-pa-sm
              .text-subtitle2.q-mb-xs Управление запуском проекта
              .text-caption.text-grey-7 Переключает проект между активным состоянием и состоянием ожидания
              ProjectStartStopToggle.q-mt-sm(:project='project')

          q-card.q-pa-sm(v-if='project' flat bordered)
            q-card-section.q-pa-sm
              .text-subtitle2.q-mb-xs Управление инвестициями
              .text-caption.text-grey-7 Переключает доступность проекта для инвестирования участниками кооператива
              ProjectOpenCloseToggle.q-mt-sm(:project='project')

    // Опасные действия
    q-card(flat).q-mb-md
      q-card-section
        .text-h6.q-mb-sm.text-negative Опасные действия
        .q-gutter-md
          q-card.q-pa-sm(flat bordered)
            q-card-section.q-pa-sm
              .text-subtitle2.q-mb-xs.text-negative Удалить проект
              .text-caption.text-grey-7 Полное удаление проекта и всех связанных данных. Действие необратимо!
              DeleteProjectButton.q-mt-sm(:project='project')
</template>

<script setup lang="ts">
import ProjectStartStopToggle from './ProjectStartStopToggle.vue';
import ProjectOpenCloseToggle from './ProjectOpenCloseToggle.vue';
import DeleteProjectButton from '../../features/Project/DeleteProject/ui/DeleteProjectButton.vue';
import AddAuthorButton from '../../features/Project/AddAuthor/ui/AddAuthorButton.vue';
import type { IProject } from '../../entities/Project/model';

defineProps<{ project: IProject | null | undefined }>();
</script>
