<template lang="pug">
div
  q-btn(@click='show = true', color='primary', size='sm', icon='add') добавить участок
  q-dialog(v-model='show', persistent, :maximized='false')
    ModalBase(
      style='width: 500px; max-width: 100% !important',
      :title='"Создать кооперативный участок"',
      :show_close='true'
    )
      Form.q-pa-md(
        :handler-submit='create',
        :is-submitting='isSubmitting',
        :showSubmit='!isLoading',
        :showCancel='true',
        :button-submit-txt='"Создать"',
        @cancel='clear'
      )
        .q-mb-lg
          UserSearchSelector(
            v-model='createBranchInput.trustee',
            label='Председатель участка',
            :rules='[(val) => notEmpty(val)]',
            dense,
            standout='bg-teal text-white'
          )

          q-input(
            dense,
            v-model='createBranchInput.short_name',
            standout='bg-teal text-white',
            placeholder='РОМАШКА',
            label='Наименование участка',
            :rules='[(val) => notEmpty(val)]',
            autocomplete='off'
          )
          q-input(
            dense,
            v-model='createBranchInput.phone',
            standout='bg-teal text-white',
            label='Номер телефона участка',
            mask='+7 (###) ###-##-##',
            fill-mask,
            placeholder='',
            :rules='[(val) => notEmpty(val), (val) => notEmptyPhone(val)]',
            autocomplete='off'
          )
          q-input(
            dense,
            v-model='createBranchInput.fact_address',
            standout='bg-teal text-white',
            placeholder='',
            label='Фактический адрес участка',
            :rules='[(val) => notEmpty(val)]',
            autocomplete='off'
          )
          q-input(
            dense,
            v-model='createBranchInput.email',
            standout='bg-teal text-white',
            type='email',
            label='Email-адрес участка',
            color='primary',
            :rules='[validEmail, notEmpty]'
          )

          q-input(
            dense,
            v-model='createBranchInput.based_on',
            standout='bg-teal text-white',
            label='Председатель действует на основании',
            placeholder='решение собрания совета №СС-10-04-2025 от 10 апреля 2025 г',
            :rules='[(val) => notEmpty(val)]',
            autocomplete='off'
          )
</template>

<script lang="ts" setup>
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { UserSearchSelector } from 'src/shared/ui';
import { ref } from 'vue';
import { useCreateBranch } from '../model';
import {
  extractGraphQLErrorMessages,
  FailAlert,
  SuccessAlert,
} from 'src/shared/api';
import { notEmpty } from 'src/shared/lib/utils';
import { validEmail } from 'src/shared/lib/utils/validEmailRule';
import { notEmptyPhone } from 'src/shared/lib/utils';

const show = ref(false);
const isSubmitting = ref(false);
const isLoading = ref(false);
const { createBranchInput, createBranch } = useCreateBranch();

const create = async () => {
  try {
    isSubmitting.value = true;
    await createBranch(createBranchInput.value);
    isSubmitting.value = false;
    show.value = false;
    SuccessAlert('Кооперативный участок добавлен');
  } catch (e) {
    isSubmitting.value = false;
    FailAlert(`Ошибка при создании: ${extractGraphQLErrorMessages(e)}`);
  }
};

const clear = () => {
  show.value = false;
};
</script>
