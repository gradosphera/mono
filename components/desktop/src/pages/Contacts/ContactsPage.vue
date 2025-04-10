<template lang="pug">
div.q-pa-md
  q-card(v-if="contacts && contacts.details" flat).q-pa-sm
    q-item
      q-item-section
        q-item-label(caption) Наименование организации
        q-item-label {{ contacts.full_name }}

    q-item
      q-item-section
        q-item-label(caption) ИНН
        q-item-label {{ contacts.details.inn }}

    q-item
      q-item-section
        q-item-label(caption) ОГРН
        q-item-label {{ contacts.details.ogrn }}

    q-item
      q-item-section
        q-item-label(caption) Юридический адрес
        q-item-label {{ contacts.full_address }}

    q-item
      q-item-section
        q-item-label(caption) Телефон
        q-item-label {{ contacts.phone }}

    q-item
      q-item-section
        q-item-label(caption) Электронная почта
        q-item-label {{ contacts.email }}

    q-item
      q-item-section
        q-item-label(caption) Председатель
        q-item-label {{ chairman }}

  </template>

  <script lang="ts" setup>
  import { useCooperativeStore } from 'src/entities/Cooperative';
  import { computed } from 'vue';

  const cooperative = useCooperativeStore()
  cooperative.loadContacts()

  const contacts = computed(() => cooperative.contacts)
  const chairman = computed(() => `${contacts.value?.chairman?.last_name} ${contacts.value?.chairman?.first_name} ${contacts.value?.chairman?.middle_name}`)
  </script>
