<template lang="pug">
div.q-pa-md
  div.row
    div.col-md-12.col-xs-12
      q-card(flat class="card-container q-pa-md" v-if="contacts && contacts.details")
        div.row.items-center.q-mb-md
          div.col-12
            div.text-h4.q-mb-xs Контактная информация
            div.text-subtitle1 {{ contacts.full_name }}

        div.row.q-mb-md
          div.col-12
            div.info-card
              div.card-title Регистрационные данные
              div.row.q-col-gutter-md
                div.col-12.col-md-6
                  div.q-my-sm
                    div.card-label ИНН
                    div.card-value {{ contacts.details.inn }}
                div.col-12.col-md-6
                  div.q-my-sm
                    div.card-label ОГРН
                    div.card-value {{ contacts.details.ogrn }}

        div.row.q-mb-md
          div.col-12
            div.info-card
              div.card-title Контактные данные
              div.row.q-col-gutter-md
                div.col-12
                  div.q-my-sm
                    div.card-label Юридический адрес
                    div.card-value {{ contacts.full_address }}

                div.col-12.col-md-6
                  div.q-my-sm
                    div.card-label Телефон
                    div.card-value {{ contacts.phone }}

                div.col-12.col-md-6
                  div.q-my-sm
                    div.card-label Электронная почта
                    div.card-value {{ contacts.email }}

        div.row.q-mb-md(v-if="contacts.chairman")
          div.col-12
            div.info-card
              div.card-title Совет
              div.q-my-sm
                div.card-label Председатель
                div.card-value {{ chairman }}
</template>

<script lang="ts" setup>
import { useCooperativeStore } from 'src/entities/Cooperative';
import { computed } from 'vue';
import 'src/shared/ui/CardStyles/index.scss';

const cooperative = useCooperativeStore()
cooperative.loadContacts()

const contacts = computed(() => cooperative.contacts)
const chairman = computed(() => `${contacts.value?.chairman?.last_name} ${contacts.value?.chairman?.first_name} ${contacts.value?.chairman?.middle_name}`)
</script>
