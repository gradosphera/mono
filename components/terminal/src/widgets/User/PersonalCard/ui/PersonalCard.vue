<template lang="pug">
q-card(v-if="currentUser?.username" flat bordered).q-pa-md.digital-certificate
  div.row
    div.col-md-4.col-xs-12
      //- p.text-bold.full-width.text-sm.text-center УДОСТОВЕРЕНИЕ ПАЙЩИКА

      div(style="flex-grow: 1; display: flex; justify-content: center;")
        AutoAvatar(style="width: 125px;" :username="currentUser.username").q-pa-sm.q-pt-lg
    div.col-md-8.col-xs-12
      q-list( dense )
        div().text-center
          q-badge(v-if="userType === 'individual'").text-center физическое лицо
          q-badge(v-if="userType === 'entrepreneur'").text-center индивидуальный предприниматель
          q-badge(v-if="userType === 'organization'").text-center юридическое лицо

        q-input(standout dense label="Идентификатор" v-model="currentUser.username" readonly)

        q-input(standout dense label="Пайщик" readonly v-model="displayName")

        q-input(v-if="userType === 'individual' && individualProfile" standout dense label="Дата рождения" readonly v-model="individualProfile.birthdate")

        q-input(v-if="userType === 'organization' && organizationProfile" standout dense label="ИНН / ОГРН" readonly v-model="inn_ogrn")

        q-input(v-if="userProfile" standout dense label="Телефон" readonly v-model="userProfile.phone")

        q-input(v-if="userProfile" standout dense label="Почта" readonly v-model="userProfile.email")

  </template>

<script lang="ts" setup>
import { AutoAvatar } from '.';
import { useCurrentUserStore } from 'src/entities/User'
import type { IEntrepreneurData, IIndividualData, IOrganizationData } from 'src/shared/lib/types/user/IUserData';
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

const displayName = computed(() => {
  if (userType.value === 'individual') {
    return `${individualProfile.value?.last_name} ${individualProfile.value?.first_name} ${individualProfile.value?.middle_name}`
  } else if (userType.value === 'entrepreneur') {
    return `${entrepreneurProfile.value?.last_name} ${entrepreneurProfile.value?.first_name} ${entrepreneurProfile.value?.middle_name}`
  } else {
    return organizationProfile.value?.short_name
  }
})

const inn_ogrn = computed(() => {
  if (organizationProfile.value)
    return `${organizationProfile.value.details.inn} / ${organizationProfile.value.details.ogrn}`
  else return ''
})

</script>
<style>
.digital-certificate {
  padding: 50px !important;
}
</style>
