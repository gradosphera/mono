<template lang="pug">
q-form(ref="form")

  q-input(
    :readonly="readonly"
    dense
    v-model="participantData.email"
    standout="bg-teal text-white"
    label="Email"
    placeholder="example@domain.com"
    :rules="[val => validEmail(val)]"
    autocomplete="off"
  )

  q-input(
    dense
    v-model="participantData.private_data.first_name"
    standout="bg-teal text-white"
    label="Имя"
    placeholder="Иван"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )

  q-input(
    dense
    v-model="participantData.private_data.middle_name"
    standout="bg-teal text-white"
    label="Отчество"
    placeholder="Иванович"
    :rules="[val => validatePersonalName(val)]"
    autocomplete="off"
  )

  q-input(
    dense
    v-model="participantData.private_data.last_name"
    standout="bg-teal text-white"
    label="Фамилия"
    placeholder="Иванов"
    :rules="[val => notEmpty(val), val => validatePersonalName(val)]"
    autocomplete="off"
  )

  q-input(
    dense
    v-model="participantData.private_data.birthdate"
    standout="bg-teal text-white"
    mask="date"
    label="Дата рождения"
    placeholder="Формат: год/месяц/день"
    :rules="['date', val => notEmpty(val)]"
    autocomplete="off"
  )
    template(v-slot:append)
      q-icon(name="event" class="cursor-pointer")
        q-popup-proxy(cover transition-show="scale" transition-hide="scale")
          q-date(v-model="participantData.private_data.birthdate")
            .row.items-center.justify-end
              q-btn(v-close-popup label="Закрыть" color="primary" flat)

  q-input(
    dense
    v-model="data.private_data.phone"
    standout="bg-teal text-white"
    label="Телефон"
    placeholder="+7 (XXX) XXX-XX-XX"
    :rules="[val => validatePhone(val)]"
    autocomplete="off"
  )

  q-input(
    dense
    v-model="passportProxy.code"
    standout="bg-teal text-white"
    label="Код паспорта"
    placeholder="XX"
    :rules="[val => notEmpty(val), val => val.length === 2 || 'Код должен состоять из 2 цифр']"
    autocomplete="off"
  )

  q-input(
    dense
    v-model="passportProxy.series"
    standout="bg-teal text-white"
    label="Серия паспорта"
    placeholder="XXXX"
    :rules="[val => notEmpty(val), val => val.length === 4 || 'Серия должна состоять из 4 цифр']"
    autocomplete="off"
  )

  q-input(
    dense
    v-model="passportProxy.number"
    standout="bg-teal text-white"
    label="Номер паспорта"
    placeholder="XXXXXXXX"
    :rules="[val => notEmpty(val), val => val.length === 8 || 'Номер паспорта должен состоять из 8 цифр']"
    autocomplete="off"
  )

  q-input(
    dense
    v-model="passportProxy.issued_at"
    standout="bg-teal text-white"
    mask="date"
    label="Дата выдачи"
    placeholder="Формат: год/месяц/день"
    :rules="['date', val => notEmpty(val)]"
    autocomplete="off"
  )
    template(v-slot:append)
      q-icon(name="event" class="cursor-pointer")
        q-popup-proxy(cover transition-show="scale" transition-hide="scale")
          q-date(v-model="passportProxy.issued_at")
            .row.items-center.justify-end
              q-btn(v-close-popup label="Закрыть" color="primary" flat)

  q-input(
    dense
    v-model="passportProxy.issued_by"
    standout="bg-teal text-white"
    label="Кем выдан"
    placeholder="МВД России"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )

  q-input(
    dense
    v-model="data.private_data.full_address"
    standout="bg-teal text-white"
    label="Адрес регистрации"
    placeholder="г. Москва, ул. Арбат, д.12"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )

  UpdateAccountButton(
    :isDisabled="isDisabled"
    :accountData="participantData"
  )
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useEditableData } from 'src/shared/lib/composables/useEditableData';
import { validEmail } from 'src/shared/lib/utils/validEmailRule';
import type { Zeus } from '@coopenomics/sdk';
import { EditableActions } from 'src/shared/ui/EditableActions';
import { validatePersonalName, notEmpty, notEmptyPhone } from 'src/shared/lib/utils';
import { useUpdateBranchBankAccount } from 'src/features/PaymentMethod/UpdateBankAccount/model';
import { failAlert } from 'src/shared/api';
import { UpdateAccountButton } from 'src/features/Account/UpdateAccount';

const props = defineProps({
  participantData: {
    // type: Object as () => Zeus.ModelTypes['Participant'],
    type: Object as () => Record<string, any>,
    required: true
  }
});

const passportProxy = computed({
      get: () => {
        if (!props.participantData.passport) {
          props.participantData.passport = {};
        }
        if (!props.participantData.series) {
          props.participantData.series = {};
        }
        if (!props.participantData.number) {
          props.participantData.number = {};
        }
        if (!props.participantData.issued_at) {
          props.participantData.issued_at = {};
        }
        if (!props.participantData.issued_by) {
          props.participantData.issued_by = {};
        }
        return props.participantData.passport;
      },
      set: (value) => {
        props.participantData.passport = value;
      },
    });

// Ссылка на форму
const form = ref();

// Обработка сохранения
const handleSave = async (data: Record<string, any>) => {
  try {
    // const { updateBankAccount } = useUpdateBranchBankAccount();
    // await updateBankAccount(data);
  } catch (e) {
    failAlert(e)
  }
};

// Используем composable функцию
const { editableData: data, isEditing, isDisabled, saveChanges, cancelChanges } = useEditableData(
  props.participantData,
  handleSave,
  form
);
</script>