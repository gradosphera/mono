<template lang="pug">
q-form(ref="form")
  q-input(
    dense
    v-model="data.full_name"
    standout="bg-teal text-white"
    label="Полное наименование"
    placeholder="ООО 'Ромашка'"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )
  q-input(
    dense
    v-model="data.short_name"
    standout="bg-teal text-white"
    label="Краткое наименование"
    placeholder="Ромашка"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )
  q-input(
    dense
    v-model="data.city"
    standout="bg-teal text-white"
    label="Город"
    placeholder="Москва"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )
  q-input(
    dense
    v-model="data.country"
    standout="bg-teal text-white"
    label="Страна"
    placeholder="Россия"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )
  q-input(
    dense
    v-model="data.fact_address"
    standout="bg-teal text-white"
    label="Фактический адрес"
    placeholder="г. Москва, ул. Ленина, д.10"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )
  q-input(
    dense
    v-model="data.full_address"
    standout="bg-teal text-white"
    label="Адрес"
    placeholder="г. Москва, ул. Арбат, д.5"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )
  q-input(
    dense
    v-model="data.phone"
    standout="bg-teal text-white"
    label="Телефон"
    placeholder="+7 (XXX) XXX-XX-XX"
    :rules="[val => validatePhone(val)]"
    autocomplete="off"
  )
  //- q-input(
  //-   dense
  //-   v-model="data.details.inn"
  //-   standout="bg-teal text-white"
  //-   label="ИНН"
  //-   placeholder="1234567890"
  //-   :rules="[val => notEmpty(val), val => val.length === 10 || 'ИНН должен состоять из 10 цифр']"
  //-   autocomplete="off"
  //- )
  //- q-input(
  //-   dense
  //-   v-model="data.details.kpp"
  //-   standout="bg-teal text-white"
  //-   label="КПП"
  //-   placeholder="123456789"
  //-   :rules="[val => notEmpty(val), val => val.length === 9 || 'КПП должен состоять из 9 цифр']"
  //-   autocomplete="off"
  //- )
  //- q-input(
  //-   dense
  //-   v-model="data.details.ogrn"
  //-   standout="bg-teal text-white"
  //-   label="ОГРН"
  //-   placeholder="1027700132195"
  //-   :rules="[val => notEmpty(val), val => val.length === 13 || 'ОГРН должен состоять из 13 цифр']"
  //-   autocomplete="off"
  //- )
  //- q-input(
  //-   dense
  //-   v-model="data.represented_by.first_name"
  //-   standout="bg-teal text-white"
  //-   label="Имя представителя"
  //-   placeholder="Иван"
  //-   :rules="[val => notEmpty(val)]"
  //-   autocomplete="off"
  //- )
  //- q-input(
  //-   dense
  //-   v-model="data.represented_by.middle_name"
  //-   standout="bg-teal text-white"
  //-   label="Отчество представителя"
  //-   placeholder="Иванович"
  //-   :rules="[val => validatePersonalName(val)]"
  //-   autocomplete="off"
  //- )
  //- q-input(
  //-   dense
  //-   v-model="data.represented_by.last_name"
  //-   standout="bg-teal text-white"
  //-   label="Фамилия представителя"
  //-   placeholder="Иванов"
  //-   :rules="[val => notEmpty(val), val => validatePersonalName(val)]"
  //-   autocomplete="off"
  //- )
  //- q-input(
  //-   dense
  //-   v-model="data.represented_by.position"
  //-   standout="bg-teal text-white"
  //-   label="Должность"
  //-   placeholder="Директор"
  //-   :rules="[val => notEmpty(val)]"
  //-   autocomplete="off"
  //- )
  //- q-input(
  //-   dense
  //-   v-model="data.represented_by.based_on"
  //-   standout="bg-teal text-white"
  //-   label="Основание"
  //-   placeholder="Устав"
  //-   :rules="[val => notEmpty(val)]"
  //-   autocomplete="off"
  //- )
  q-select(
    dense
    v-model="data.type"
    standout="bg-teal text-white"
    label="Тип организации"
    :options="organizationTypes"
    :rules="[val => val != null || 'Тип организации обязателен']"
  )

  EditableActions(
    :isEditing="isEditing"
    :isDisabled="isDisabled"
    @save="saveChanges"
    @cancel="cancelChanges"
  )
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useEditableData } from 'src/shared/lib/composables/useEditableData';
import type { Zeus } from '@coopenomics/sdk';
import { EditableActions } from 'src/shared/ui/EditableActions';
import { notEmpty } from 'src/shared/lib/utils';
import { useUpdateBranchBankAccount } from 'src/features/PaymentMethod/UpdateBankAccount/model';
import { failAlert } from 'src/shared/api';

const props = defineProps({
  participantData: {
    // type: Object as () => Zeus.ModelTypes['Participant'],
    type: Object as () => Record<string, any>,
    required: true
  }
});

onMounted(() => {
  console.log(props.participantData);
})

// Ссылка на форму
const form = ref();

// Обработка сохранения
const handleSave = async (data: Record<string, any>) => {
  try {
    // const { updateBankAccount } = useUpdateBranchBankAccount();
    // await updateBankAccount(data);
  } catch (e) {
    // failAlert(e)
  }
};

// Используем composable функцию
const { editableData: data, isEditing, isDisabled, saveChanges, cancelChanges } = useEditableData(
  props.participantData,
  handleSave,
  form
);
</script>