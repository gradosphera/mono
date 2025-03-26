<template lang="pug">
div
  q-input(
    :readonly="readonly"
    dense
    v-model="data.phone"
    standout="bg-teal text-white"
    mask="+7 (###) ###-##-##"
    fill-mask
    label="Номер телефона"
    placeholder="+7 (###) ###-##-##"
    :rules="[val => notEmpty(val), val => notEmptyPhone(val)]"
    autocomplete="off"
  )
  q-input(
    :readonly="readonly"
    dense
    v-model="data.email"
    standout="bg-teal text-white"
    label="Email"
    placeholder="example@domain.com"
    :rules="[val => validEmail(val)]"
    autocomplete="off"
  )
  q-input(
    :readonly="readonly"
    dense
    v-model="data.first_name"
    standout="bg-teal text-white"
    label="Имя"
    placeholder="Иван"
    :rules="[val => notEmpty(val), val => validatePersonalName(val)]"
    autocomplete="off"
  )
  q-input(
    :readonly="readonly"
    dense
    v-model="data.last_name"
    standout="bg-teal text-white"
    label="Фамилия"
    placeholder="Иванов"
    :rules="[val => notEmpty(val), val => validatePersonalName(val)]"
    autocomplete="off"
  )
  q-input(
    :readonly="readonly"
    dense
    v-model="data.middle_name"
    standout="bg-teal text-white"
    label="Отчество"
    placeholder="Иванович"
    :rules="[val => validatePersonalName(val)]"
    autocomplete="off"
  )
  q-input(
    :readonly="readonly"
    dense
    v-model="data.birthdate"
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
          q-date(v-model="data.birthdate")
            .row.items-center.justify-end
              q-btn(v-close-popup label="Закрыть" color="primary" flat)

  q-input(
    :readonly="readonly"
    dense
    v-model="data.full_address"
    standout="bg-teal text-white"
    label="Адрес регистрации (как в паспорте)"
    placeholder="г. Москва, ул. Арбат, д.12"
    :rules="[val => notEmpty(val)]"
    autocomplete="off"
  )
  div(v-if="data.passport")
    q-input(
      :readonly="readonly"
      dense
      v-model="data.passport.series"
      standout="bg-teal text-white"
      label="Серия паспорта"
      placeholder="Четыре цифры"
      :rules="[val => notEmpty(val), val => val.length === 4 || 'Серия должна состоять из 4 цифр']"
      autocomplete="off"
    )
    q-input(
      :readonly="readonly"
      dense
      v-model="data.passport.number"
      standout="bg-teal text-white"
      label="Номер паспорта"
      placeholder="Шесть цифр"
      :rules="[val => notEmpty(val), val => val.length === 6 || 'Номер должен состоять из 6 цифр']"
      autocomplete="off"
    )
    q-input(
      :readonly="readonly"
      dense
      v-model="data.passport.issued_by"
      standout="bg-teal text-white"
      label="Паспорт выдан"
      placeholder="Например, УФМС России"
      :rules="[val => notEmpty(val)]"
      autocomplete="off"
    )
    q-input(
      :readonly="readonly"
      dense
      v-model="data.passport.issued_at"
      standout="bg-teal text-white"
      label="Дата выдачи"
      placeholder="Формат: год/месяц/день"
      mask="date"
      :rules="['date', val => notEmpty(val)]"
      autocomplete="off"
    )
    q-input(
      :readonly="readonly"
      dense
      v-model="data.passport.code"
      standout="bg-teal text-white"
      label="Код подразделения"
      placeholder="Три цифры - три цифры"
      mask="###-###"
      :rules="[val => notEmpty(val), val => val.match(/^\d{3}-\d{3}$/) || 'Формат должен быть 000-000']"
      autocomplete="off"
    )

  EditableActions(
    v-if="!readonly"
    :isEditing="isEditing"
    @save="saveChanges"
    @cancel="cancelChanges"
  )
</template>

<script lang="ts" setup>
import { useEditableData } from 'src/shared/lib/composables/useEditableData';
import { notEmpty, notEmptyPhone } from 'src/shared/lib/utils';
import { validEmail } from 'src/shared/lib/utils/validEmailRule';
import { validatePersonalName } from 'src/shared/lib/utils';
import { EditableActions } from 'src/shared/ui/EditableActions';
import { Cooperative } from 'cooptypes';

const props = defineProps({
  individual: {
    type: Object as () => Cooperative.Users.IIndividualData,
    required: true
  },
  readonly: {
    type: Boolean,
    required: false,
    default: true
  }
});

const handleSave = (updatedIndividual: Cooperative.Users.IIndividualData) => {
  console.log('Сохранено:', updatedIndividual);
};

const { editableData: data, isEditing, saveChanges, cancelChanges } = useEditableData(props.individual, handleSave);
</script>
