<template lang="pug">
div
  q-btn(
    color="negative"
    icon="delete"
    @click="showDialog = true"
    :loading="loading"
    :disable="loading"
  )

    span.q-ml-xs Удалить участок

  q-dialog(v-model="showDialog" @hide="clear")
    ModalBase(:title='"Удаление кооперативного участка"')
      Form(
        :handler-submit="handleDeleteBranch"
        :is-submitting="loading"
        :button-cancel-txt="'Отменить'"
        :button-submit-txt="'Удалить'"
        @cancel="clear"
      ).q-pa-md
        div(style="max-width: 500px;")
          p.text-weight-bold Вы уверены, что хотите удалить кооперативный участок {{ branch?.short_name }}?
          p Это действие необратимо. Все пайщики будут отключены от участка и увидят приглашение выбрать новый участок.
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { IBranch } from 'src/entities/Branch/model/types';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { useDeleteBranch } from '../model';

const props = defineProps<{
  branch: IBranch
}>();

const showDialog = ref(false);
const { deleteBranch, loading } = useDeleteBranch();

const clear = (): void => {
  showDialog.value = false;
};

const handleDeleteBranch = async (): Promise<void> => {
  const success = await deleteBranch({
    coopname: props.branch.coopname,
    braname: props.branch.braname,
    short_name: props.branch.short_name
  });

  if (success) {
    showDialog.value = false;
  }
};
</script>
