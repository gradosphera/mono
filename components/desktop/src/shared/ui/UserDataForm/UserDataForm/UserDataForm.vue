<template lang="pug">
div
  q-form(ref='localUserDataForm')
    slot(name='top')
    p.full-width.text-center.text-bold(v-if='showTypeButtons') Кто Вы?
    .row(v-if='showTypeButtons')
      .col-xs-12.col-sm-12.col-md-4.q-pa-sm
        q-btn.full-width(
          glossy,
          label='Физлицо',
          color='primary',
          @click='selectType("individual")',
          style='height: 75px'
        )
      .col-xs-12.col-sm-12.col-md-4.q-pa-sm
        q-btn.full-width(
          glossy,
          label='ИП',
          color='primary',
          @click='selectType("entrepreneur")',
          style='height: 75px'
        )
      .col-xs-12.col-sm-12.col-md-4.q-pa-sm
        q-btn.full-width(
          glossy,
          label='Организация',
          color='primary',
          @click='selectType("organization")',
          style='height: 75px'
        )

    .full-width.text-center(v-else)
      q-btn(
        flat,
        color='grey-7',
        full-width,
        :label='getSelectedTypeLabel()',
        @click='changeAccountType',
        size='sm',
        icon='arrow_back'
      )

    div(v-if='userData.type === "individual"')
      IndividualDataForm(v-model:userData='userData')

    div(v-if='userData.type === "organization"')
      OrganizationDataForm(v-model:userData='userData')

    div(v-if='userData.type === "entrepreneur"')
      EntrepreneurDataForm(v-model:userData='userData')

    slot(name='bottom', :userDataForm='localUserDataForm')
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import type { IUserData } from 'src/shared/lib/types/user/IUserData';
import { IndividualDataForm } from '../IndividualDataForm';
import { OrganizationDataForm } from '../OrganizationDataForm';
import { EntrepreneurDataForm } from '../EntrepreneurDataForm';

const props = defineProps<{ userData: IUserData }>();
const emit = defineEmits<{
  typeSelected: [type: 'individual' | 'entrepreneur' | 'organization'];
  typeCleared: [];
}>();

const userData = ref<IUserData>(props.userData);
const showTypeButtons = ref<boolean>(
  !userData.value.type || userData.value.type === null,
); // Показывать кнопки если тип не выбран

const selectType = (type: 'individual' | 'entrepreneur' | 'organization') => {
  userData.value.type = type;
  showTypeButtons.value = false; // Скрыть кнопки после выбора
  emit('typeSelected', type); // Сообщить родителю о выборе типа
};

const changeAccountType = () => {
  (userData.value.type as any) = undefined; // Скрыть формы путем удаления типа
  showTypeButtons.value = true; // Показать кнопки выбора типа
  emit('typeCleared'); // Сообщить родителю о сбросе типа
};

const getSelectedTypeLabel = () => {
  switch (userData.value.type) {
    case 'individual':
      return 'Физлицо';
    case 'entrepreneur':
      return 'Предприниматель';
    case 'organization':
      return 'Организация';
    default:
      return 'Выбрать тип';
  }
};

const localUserDataForm = ref(null);
</script>
<style>
.dataInput .q-btn-selected {
  color: teal;
}
</style>
