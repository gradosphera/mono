<template lang="pug">
// Рендерим как обычную кнопку, если передан флаг fab
q-btn(
  v-if="fab"
  color="accent"
  label="Инвестировать"
  icon="attach_money"
  @click="showDialog = true"
  fab
).bg-fab-accent-radial
  q-dialog(v-model="showDialog", @hide="showDialog = false")
    ModalBase(title="Инвестирование в проект" style="width: 400px; max-width: 100%;")
      q-card-section.row.items-center
        span Инвестиции в проект деньгами или результатами доступны только через их компоненты. Пожалуйста, выберите компонент из списка и инвестируйте во все или в некоторые из них по отдельности.
        div.q-mt-md
          q-btn(flat label="Понятно" @click="showDialog = false")
          q-btn(
            color="primary"
            label="Перейти к компонентам"
            @click="goToComponents"
          )

// Иначе рендерим как экшен для FAB
q-fab-action(
  v-else
  icon="attach_money"
  @click="showDialog = true"
  text-color="white"
).bg-fab-accent-radial Инвестиция
  q-dialog(v-model="showDialog", @hide="showDialog = false")
    ModalBase(title="Инвестирование в проект" style="width: 400px; max-width: 100%;")
      q-card-section.row.items-center
        span Инвестиции в проект деньгами или результатами доступны только через их компоненты. Пожалуйста, выберите компонент из списка и инвестируйте во все или в некоторые из них по отдельности.
        div.q-mt-md
          q-btn(flat label="Понятно" @click="showDialog = false")
          q-btn(
            color="primary"
            label="Перейти к компонентам"
            @click="goToComponents"
          )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ModalBase } from 'src/shared/ui/ModalBase';
import type { IProject } from '../../../../../entities/Project/model';

const props = defineProps<{
  project: IProject | null | undefined;
  fab?: boolean;
}>();
const router = useRouter();
const showDialog = ref(false);

const goToComponents = () => {
  if (props.project?.project_hash) {
    router.push({
      name: 'project-components',
      params: { project_hash: props.project.project_hash }
    });
  }
  showDialog.value = false;
};
</script>
