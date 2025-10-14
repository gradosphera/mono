<template lang="pug">
div(v-if="userData.individual_data").q-gutter-sm.q-mt-md
  slot(name="top")
  q-input(ref="firstInput" autofocus v-model="userData.individual_data.last_name" standout="bg-teal text-white" label="Фамилия" :rules="[val => notEmpty(val), val => validatePersonalName(val)]" autocomplete="off")
  q-input(v-model="userData.individual_data.first_name" standout="bg-teal text-white" label="Имя" :rules="[val => notEmpty(val), val => validatePersonalName(val)]" autocomplete="off")
  q-input(v-model="userData.individual_data.middle_name" standout="bg-teal text-white" label="Отчество" :rules="[val => validatePersonalName(val)]" autocomplete="off")

  q-input(v-model="userData.individual_data.full_address" standout="bg-teal text-white" label="Адрес регистрации (как в паспорте)" :rules="[val => notEmpty(val)]" autocomplete="off")

  q-input(
    standout="bg-teal text-white"
    v-model="userData.individual_data.birthdate"
    mask="date"
    label="Дата рождения (год/месяц/день)"
    :rules="['date', val => notEmpty(val)]"
    autocomplete="off"
  )
    template(v-slot:append)
      q-icon(name="event" class="cursor-pointer")
        q-popup-proxy(cover transition-show="scale" transition-hide="scale")
          q-date(v-model="userData.individual_data.birthdate")
            .row.items-center.justify-end
              q-btn(v-close-popup label="Close" color="primary" flat)

  q-input(v-model="userData.individual_data.phone" standout="bg-teal text-white" mask="+7 (###) ###-##-##" fill-mask label="Номер телефона" :rules="[val => notEmpty(val), val => notEmptyPhone(val)]" autocomplete="off")

</template>
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { validatePersonalName, notEmpty, notEmptyPhone } from 'src/shared/lib/utils';

import type { IUserData } from 'src/shared/lib/types/user/IUserData';

const props = defineProps<{ userData: IUserData }>();

const userData = ref<IUserData>(props.userData);
const firstInput = ref<HTMLElement>();

onMounted(async () => {
  await nextTick();
  firstInput.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});


</script>
