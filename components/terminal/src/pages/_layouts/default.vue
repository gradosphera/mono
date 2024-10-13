<template lang="pug">
q-layout(view="hHh LpR fff")
  q-header(bordered :class="headerClass").header
    q-toolbar()
      q-btn(v-if="loggedIn" stretch icon="menu" flat @click="leftDrawerOpen = !leftDrawerOpen")
      q-toolbar-title()
        q-btn(:size="isMobile ? 'md' : 'lg'" flat @click="goTo('index')")
          span {{ COOP_SHORT_NAME }}


      ToogleDarkLight(:showText="true" :isMobile="isMobile")

      template(v-if="!loggedIn")
        q-btn(v-if="showRegisterButton && !is('signup') && !is('install')" color="primary" class="btn-menu" stretch :size="isMobile ? 'sm' : 'lg'" :dense="isMobile" @click="signup")
          span.q-pr-sm регистрация
          i.fa-solid.fa-right-to-bracket

        q-btn(v-if="showRegisterButton && is('signup')" color="primary" class="btn-menu" stretch :size="isMobile ? 'sm' : 'lg'"  @click="login" :dense="isMobile" )
          span.q-pr-sm вход
          i.fa-solid.fa-right-to-bracket

  q-drawer(v-model="leftDrawerOpen" side="left" bordered :width="200")
    LeftDrawerMenu

  //- q-header(v-if="!isMobile && loggedIn" style="border-bottom: 1px solid #00800038 !important; " :style="{ 'background': $q.dark.isActive ? 'black' : 'white' }" :class="headerClass").header


  //футер контактов
  q-footer(v-if="!loggedIn" :class="headerClass" bordered)
    ContactsFooter(:text="footerText")

  //- q-footer(v-if="loggedIn && isMobile" style="border-top: 1px solid #00800038 !important; "  :class="headerClass")
    //- SecondLevelMenu
    //- Menu(style="border-top: 1px solid #00800038 !important; " )

  //контейнер
  q-page-container
    q-page.q-pb-lg
      router-view

</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useWindowSize } from 'vue-window-size'
import config from 'src/app/config'
import { ToogleDarkLight } from 'src/shared/ui/ToogleDarkLight'
const router = useRouter()
const route = useRoute()

import { LeftDrawerMenu } from 'src/widgets/Desktop/LeftDrawerMenu'
import { COOP_SHORT_NAME } from 'src/shared/config'
import { useCurrentUserStore } from 'src/entities/User'
import { useSessionStore } from 'src/entities/Session'
const session = useSessionStore()
import { ContactsFooter } from 'src/shared/ui/Footer'

const $q = useQuasar()

const isDark = computed(() => $q.dark.isActive)

const headerClass = computed(() => (isDark.value ? 'text-white bg-dark' : 'text-black bg-light'))

import { useCooperativeStore } from 'src/entities/Cooperative';

const cooperativeStore = useCooperativeStore()

cooperativeStore.loadContacts()

const leftDrawerOpen = ref(true)

const footerText = computed(() => {
  if (cooperativeStore.contacts && cooperativeStore.contacts.details)
    return `${cooperativeStore.contacts.full_name}, ИНН: ${cooperativeStore.contacts.details.inn}, ОГРН: ${cooperativeStore.contacts.details.ogrn}, телефон: ${cooperativeStore.contacts.phone}, почта: ${cooperativeStore.contacts.email}`
  else return ''
})

onMounted(() => {
  if (isMobile.value)
    leftDrawerOpen.value = false

  if (!loggedIn.value)
    leftDrawerOpen.value = false
})

defineExpose({
  $q,
})

const { width } = useWindowSize()

const showRegisterButton = computed(() => {
  if (!loggedIn.value) {
    if (config.registrator.showRegisterButton) return true
    else return false
  } else return false
})

const isMobile = computed(() => {
  return width.value < 768
})


const is = (what: string) => {
  return route.name === what
}

const loggedIn = computed(() => {
  return useCurrentUserStore().isRegistrationComplete && session.isAuth
})

watch(loggedIn, (newValue) => {
  if (newValue == false)
    leftDrawerOpen.value = false
})

const toogleDark = () => {
  $q.dark.toggle()
}

const goTo = (name: string) => {
  router.push({ name })
}

const signup = () => {
  router.push({ name: 'signup' })
}

const login = () => {
  router.push({ name: 'signin' })
}


</script>

<style lang="scss">
.btn-title {
  font-size: 20px;
}

.btn-menu {
  font-size: 20px;
  height: 60px;
}

.menu {
  right: 0px;
  z-index: 1000;
}

.q-toolbar {
  padding-left: 0px !important;
  padding-right: 0px !important;
}
.q-toolbar__title{
  padding: 0px !important;
}

.drawer-right {
  border-left: 1px solid #00800038 !important;
}

.drawer-left {
  border-right: 1px solid #00800038 !important;
}

.no-wrap {
  white-space: nowrap;        /* Запрещает перенос текста */
  overflow: hidden;           /* Обрезает текст, если он не помещается */
  text-overflow: ellipsis;    /* Добавляет троеточие, если текст обрезан */
}
</style>
