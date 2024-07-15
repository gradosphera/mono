<template lang="pug">
div
  q-card(v-if="contacts && contacts.details" flat bordered).q-pa-sm
    q-input(type="textarea" autogrow readonly label="Наименование организации" v-model="contacts.full_name")
    q-input(type="textarea" autogrow readonly label="ИНН" v-model="contacts.details.inn")
    q-input(type="textarea" autogrow readonly label="ОГРН" v-model="contacts.details.ogrn")
    q-input(type="textarea" autogrow readonly label="Юридический адрес" v-model="contacts.full_address")
    q-input(type="textarea" autogrow readonly label="Телефон" v-model="contacts.phone")
    q-input(type="textarea" autogrow readonly label="Электронная почта" v-model="contacts.email")
    q-input(type="textarea" autogrow readonly label="Председатель" v-model="chairman")

</template>

<script lang="ts" setup>
  import { useCooperativeStore } from 'src/entities/Cooperative';
  import { computed } from 'vue';

  const cooperative = useCooperativeStore()
  cooperative.loadContacts()

  const contacts = computed(() => cooperative.contacts)
  const chairman = computed(() => `${contacts.value?.chairman?.last_name} ${contacts.value?.chairman?.first_name} ${contacts.value?.chairman?.middle_name}`)
</script>
