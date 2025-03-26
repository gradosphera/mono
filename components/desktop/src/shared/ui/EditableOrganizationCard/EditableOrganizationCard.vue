<template lang="pug">
  q-form(ref="form")
    q-input(
      dense
      v-model="localOrganizationData.private_data.full_name"
      standout="bg-teal text-white"
      label="Полное наименование"
      placeholder="ООО 'Ромашка'"
      :rules="[val => notEmpty(val)]"
      autocomplete="off"
    )
    q-input(
      dense
      v-model="localOrganizationData.private_data.short_name"
      standout="bg-teal text-white"
      label="Краткое наименование"
      placeholder="Ромашка"
      :rules="[val => notEmpty(val)]"
      autocomplete="off"
    )
    q-input(
      dense
      v-model="localOrganizationData.private_data.city"
      standout="bg-teal text-white"
      label="Город"
      placeholder="Москва"
      :rules="[val => notEmpty(val)]"
      autocomplete="off"
    )
    q-input(
      dense
      v-model="localOrganizationData.private_data.country"
      standout="bg-teal text-white"
      label="Страна"
      placeholder="Россия"
      :rules="[val => notEmpty(val)]"
      autocomplete="off"
    )
    q-input(
      dense
      v-model="localOrganizationData.private_data.fact_address"
      standout="bg-teal text-white"
      label="Фактический адрес"
      placeholder="г. Москва, ул. Ленина, д.10"
      :rules="[val => notEmpty(val)]"
      autocomplete="off"
    )
    q-input(
      dense
      v-model="localOrganizationData.private_data.full_address"
      standout="bg-teal text-white"
      label="Адрес"
      placeholder="г. Москва, ул. Арбат, д.5"
      :rules="[val => notEmpty(val)]"
      autocomplete="off"
    )
    q-input(
      dense
      v-model="localOrganizationData.private_data.phone"
      standout="bg-teal text-white"
      label="Телефон"
      placeholder="+7 (XXX) XXX-XX-XX"
      :rules="[val => notEmpty(val)]"
      autocomplete="off"
    )
    q-select(
      dense
      v-model="localOrganizationData.private_data.type"
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
  import { ref } from 'vue';
  import { useEditableData } from 'src/shared/lib/composables/useEditableData';
  import { notEmpty } from 'src/shared/lib/utils';
  import { type IUserAccountData } from 'src/entities/User';
  import { Zeus } from '@coopenomics/sdk';
  import { EditableActions } from 'src/shared/ui/EditableActions';
  import { type IUpdateAccountInput, useUpdateAccount } from 'src/features/Account/UpdateAccount/model';
  import { failAlert, SuccessAlert } from 'src/shared/api';
  
  const { updateAccount } = useUpdateAccount()

  const props = defineProps({
    participantData: {
      type: Object as () => IUserAccountData,
      required: true
    }
  });
  
  // Локальная копия данных
  const localOrganizationData = ref(props.participantData);
  
  // Ссылка на форму
  const form = ref();
  
  // Обработка сохранения
  const handleSave = async () => {
    try {
        const account_data: IUpdateAccountInput = {
          email: props.participantData.email,
          role: Zeus.RegisterRole.User,
          type: props.participantData.type,
          username: props.participantData.username,
          organization_data: props.participantData.private_data,
        }
        SuccessAlert('Данные аккаунта обновлены')
        await updateAccount(account_data);
    } catch (e) {
      failAlert(e);
    }
  };
  
  // Используем composable функцию
  const { editableData: data, isEditing, isDisabled, saveChanges, cancelChanges } = useEditableData(
    localOrganizationData.value,
    handleSave,
    form
  );
  </script>
  