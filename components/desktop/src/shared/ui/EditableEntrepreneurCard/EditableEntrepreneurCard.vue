<template lang="pug">
q-form(ref="form")
  q-input(
    dense
    v-model="data.first_name"
    standout="bg-teal text-white"
    label="Имя"
    placeholder="Иван"
    :rules="[val => notEmpty(val), val => validatePersonalName(val)]"
    autocomplete="off"
  )
  q-input(
    dense
    v-model="data.middle_name"
    standout="bg-teal text-white"
    label="Отчество"
    placeholder="Иванович"
    :rules="[val => validatePersonalName(val)]"
    autocomplete="off"
  )
  q-input(
    dense
    v-model="data.last_name"
    standout="bg-teal text-white"
    label="Фамилия"
    placeholder="Иванов"
    :rules="[val => notEmpty(val), val => validatePersonalName(val)]"
    autocomplete="off"
  )
  q-input(
    dense
    v-model="data.birthdate"
    standout="bg-teal text-white"
    mask="date"
    label="Дата рождения"
    placeholder="ГГГГ-ММ-ДД"
    :rules="['date', val => notEmpty(val)]"
    autocomplete="off"
  )
    template(v-slot:append)
      q-icon(name="event" class="cursor-pointer")
        q-popup-proxy(cover transition-show="scale" transition-hide="scale")
          q-date(v-model="data.birthdate")
            .row.items-center.justify-end
              q-btn(v-close-popup label="Закрыть" color="primary" flat)

  q-input(
    dense
    v-model="data.phone"
    standout="bg-teal text-white"
    label="Телефон"
    placeholder="+7 (XXX) XXX-XX-XX"
    :rules="[val => validatePhone(val)]"
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
    :readonly="true"
    autocomplete="off"
  )
  q-input(
    dense
    v-model="data.full_address"
    standout="bg-teal text-white"
    label="Адрес регистрации"
    placeholder="г. Москва, ул. Ленина, д.10"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )
//-   q-input(
//-     dense
//-     v-model="data.details.inn"
//-     standout="bg-teal text-white"
//-     label="ИНН"
//-     placeholder="12345678900"
//-     :rules="[val => notEmpty(val), val => val.length === 12 || 'ИНН должен состоять из 12 цифр']"
//-     autocomplete="off"
//-   )
//-   q-input(
//-     dense
//-     v-model="data.details.ogrn"
//-     standout="bg-teal text-white"
//-     label="ОГРН"
//-     placeholder="1027700132195"
//-     :rules="[val => notEmpty(val), val => val.length === 13 || 'ОГРН должен состоять из 13 цифр']"
//-     autocomplete="off"
//-   )


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