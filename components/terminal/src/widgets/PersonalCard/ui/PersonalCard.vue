<template lang="pug">
q-card(v-if="currentUser?.username" flat bordered).q-pa-md.digital-certificate
  div.row
    div.col-md-4.col-xs-12
      p.text-bold.full-width.text-sm.text-center УДОСТОВЕРЕНИЕ ПАЙЩИКА
      div(style="flex-grow: 1; display: flex; justify-content: center;")
        AutoAvatar(style="width: 125px;" :username="currentUser.username").q-pa-sm.q-pt-lg
    div.col-md-8.col-xs-12
      q-list( dense )
        q-item
          q-item-section
            q-item-label(caption) Тип
          q-item-section(side)
            q-badge(v-if="userType === 'individual'") физическое лицо
            q-badge(v-if="userType === 'entrepreneur'") индивидуальный предприниматель
            q-badge(v-if="userType === 'organization'") юридическое лицо

        q-item
          q-item-section
            q-item-label(caption) Идентификатор
          q-item-section(side)
            q-item-label(lines=2) {{ currentUser.username }}

        q-item
          q-item-section
            q-item-label(v-if="userType !== 'organization'" caption) ФИО
            q-item-label(v-else caption) Наименование
          q-item-section(side)
            template(v-if="userType === 'individual'")
              q-item-label(lines=2 caption) {{ individualProfile?.last_name }} {{ individualProfile?.first_name }} {{ individualProfile?.middle_name }}
            template(v-else-if="userType === 'entrepreneur'")
              q-item-label(lines=2 caption) {{ entrepreneurProfile?.last_name }} {{ entrepreneurProfile?.first_name }} {{ entrepreneurProfile?.middle_name }}
            template(v-else)
              q-item-label(caption) {{ organizationProfile?.short_name }}

        q-item(v-if="userType === 'individual'")
          q-item-section
            q-item-label(caption) Дата рождения
          q-item-section(side) {{ individualProfile?.birthdate }}

        q-item(v-if="userType === 'organization'")
          q-item-section
            q-item-label(caption) ИНН / ОГРН
          q-item-section(side) {{ organizationProfile?.details.inn }} / {{ organizationProfile?.details.ogrn }}

        q-item
          q-item-section
            q-item-label(caption) Адрес регистрации
          q-item-section(side)
            q-item-label(lines=2) {{ userProfile?.full_address }}

        q-item
          q-item-section
            q-item-label(caption) Телефон
          q-item-section(side) {{ userProfile?.phone }}

        q-item
          q-item-section
            q-item-label(caption) Почта
          q-item-section(side) {{ userProfile?.email }}
  </template>

<script lang="ts" setup>
    import type { IEntrepreneurData, IIndividualData, IOrganizationData } from 'src/entities/User'
    import { AutoAvatar } from './';
    import { useCurrentUserStore } from 'src/entities/User'
    import { computed } from 'vue';
    const currentUser = useCurrentUserStore()

    const userType = computed(() => currentUser.userAccount?.type)

    const individualProfile = computed(() => {
      if (userType.value === 'individual') {
        return currentUser.userAccount?.private_data as IIndividualData
      }
      return null
    })

    const entrepreneurProfile = computed(() => {
      if (userType.value === 'entrepreneur') {
        return currentUser.userAccount?.private_data as IEntrepreneurData
      }
      return null
    })

    const organizationProfile = computed(() => {
      if (userType.value === 'organization') {
        return currentUser.userAccount?.private_data as IOrganizationData
      }
      return null
    })

    const userProfile = computed(() => {
      if (userType.value === 'individual' || userType.value === 'entrepreneur') {
        return individualProfile?.value || entrepreneurProfile?.value
      }
      return organizationProfile?.value
    })
    </script>
