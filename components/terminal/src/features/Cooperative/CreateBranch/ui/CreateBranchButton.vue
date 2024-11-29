<template lang="pug">
div
  q-btn(@click="show = true") create
  q-dialog(v-model="show" persistent :maximized="false" )
    ModalBase(style="width: 500px; max-width: 100% !important;" :title="'Создать кооперативный участок'" :show_close="true")
      Form(:handler-submit="create" :is-submitting="isSubmitting" :showSubmit="!isLoading" :showCancel="true" :button-submit-txt="'Создать'" @cancel="clear" ).q-pa-md
        div().q-mb-lg.q-gutter-sm
          q-input(v-model="createBranchInput.braname" standout="bg-teal text-white" hint="" label="Имя аккаунта КУ" :rules="[val => notEmpty(val)]" autocomplete="off")

          q-input(v-model="createBranchInput.trustee" standout="bg-teal text-white" hint="" label="Имя аккаунта председателя участка" :rules="[val => notEmpty(val)]" autocomplete="off")

          q-input(v-model="createBranchInput.short_name" standout="bg-teal text-white" hint="ПК Ромашка" label="Краткое наименование организации" :rules="[val => notEmpty(val)]" autocomplete="off")
          q-input(v-model="createBranchInput.full_name" standout="bg-teal text-white" hint="Потребительский Кооператив 'Ромашка'" label="Полное наименование организации" :rules="[val => notEmpty(val)]" autocomplete="off")
          q-input(v-model="createBranchInput.represented_by.last_name" standout="bg-teal text-white" label="Фамилия представителя" hint="" :rules="[val => notEmpty(val), val => validatePersonalName(val)]" autocomplete="off")
          q-input(v-model="createBranchInput.represented_by.first_name" standout="bg-teal text-white" label="Имя представителя" hint="" :rules="[val => notEmpty(val), val => validatePersonalName(val)]" autocomplete="off")
          q-input(v-model="createBranchInput.represented_by.middle_name" standout="bg-teal text-white" label="Отчество представителя" hint="" :rules="[val => validatePersonalName(val)]" autocomplete="off")
          q-input(v-model="createBranchInput.phone" standout="bg-teal text-white" label="Номер телефона представителя"  mask="+7 (###) ###-##-##" fill-mask  hint="" :rules="[val => notEmpty(val), val => notEmptyPhone(val)]" autocomplete="off")
          q-input(v-model="createBranchInput.fact_address" standout="bg-teal text-white" hint="" label="Фактический адрес" :rules="[val => notEmpty(val)]" autocomplete="off")
          q-input.q-mt-lg(
            v-model='createBranchInput.email',
            standout="bg-teal text-white",
            type='email',
            label='Введите email',
            color='primary',
            :rules='[validEmail, notEmpty]'
          )


          q-input(v-model="createBranchInput.represented_by.position" standout="bg-teal text-white" label="Должность" hint="председатель кооперативного участка" :rules="[val => notEmpty(val)]" autocomplete="off")

          q-input(v-model="createBranchInput.represented_by.based_on" standout="bg-teal text-white" label="Председатель действует на основании" hint="решения собрания совета №СС-10-04-2025 от 10 апреля 2025 г" :rules="[val => notEmpty(val)]" autocomplete="off")



</template>

<script lang="ts" setup>
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { ref } from 'vue';
import { useCreateBranch } from '../model';
import { extractGraphQLErrorMessages, FailAlert, SuccessAlert } from 'src/shared/api';
import { notEmpty } from 'src/shared/lib/utils';
import { validEmail } from 'src/shared/lib/utils/validEmailRule';
import { validatePersonalName } from 'src/shared/lib/utils';
import { notEmptyPhone } from 'src/shared/lib/utils';

const show = ref(false)
const isSubmitting = ref(false)
const isLoading = ref(false)
const {createBranchInput, createBranch} = useCreateBranch()

const create = async () => {
  try {
    await createBranch(createBranchInput.value)
    SuccessAlert('Кооперативный участок добавлен')
  } catch(e){
    FailAlert(`Ошибка при создании: ${extractGraphQLErrorMessages(e)}`)
  }

}

const clear = () => {
  show.value = false
}

</script>
