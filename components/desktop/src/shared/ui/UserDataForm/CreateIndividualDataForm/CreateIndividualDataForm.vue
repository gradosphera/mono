<template lang="pug">
.q-gutter-sm.q-mt-md
  slot(name="top")
  q-input(ref="firstInput" :autofocus="!slots.top" v-model="data.last_name" standout="bg-teal text-white" label="Фамилия" :rules="[val => notEmpty(val), val => validatePersonalName(val)]" autocomplete="off")
  q-input(v-model="data.first_name" standout="bg-teal text-white" label="Имя" :rules="[val => notEmpty(val), val => validatePersonalName(val)]" autocomplete="off")
  q-input(v-model="data.middle_name" standout="bg-teal text-white" label="Отчество" :rules="[val => validatePersonalName(val)]" autocomplete="off")

  q-input(v-model="data.full_address" standout="bg-teal text-white" label="Адрес регистрации (как в паспорте)" :rules="[val => notEmpty(val)]" autocomplete="off")

  q-input(
    standout="bg-teal text-white"
    v-model="data.birthdate"
    mask="date"
    label="Дата рождения (год/месяц/день)"
    :rules="['date', val => notEmpty(val)]"
    autocomplete="off"
  )
    template(v-slot:append)
      q-icon(name="event" class="cursor-pointer")
        q-popup-proxy(cover transition-show="scale" transition-hide="scale")
          q-date(v-model="data.birthdate")
            .row.items-center.justify-end
              q-btn(v-close-popup label="Close" color="primary" flat)

  q-input(v-model="data.phone" standout="bg-teal text-white" mask="+7 (###) ###-##-##" fill-mask label="Номер телефона" :rules="[val => notEmpty(val), val => notEmptyPhone(val)]" autocomplete="off")
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, useSlots } from 'vue'
import { validatePersonalName, notEmpty, notEmptyPhone } from 'src/shared/lib/utils';
import { Zeus } from '@coopenomics/sdk';

// Типы на основе CreateIndividualDataInput из бэкенда
export type ICreateIndividualData = Omit<Zeus.ModelTypes['CreateIndividualDataInput'], 'email'> & {
  email?: string;
};

const props = defineProps<{
  data: ICreateIndividualData;
  readonly?: boolean;
}>();

const slots = useSlots();

defineEmits<{
  'update:data': [data: ICreateIndividualData];
}>();

const data = ref<ICreateIndividualData>(props.data);
const firstInput = ref<any>();

onMounted(async () => {
  await nextTick();
  console.log(firstInput.value)
  firstInput.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
</script>
