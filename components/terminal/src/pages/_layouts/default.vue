<template lang="pug">
q-layout(view="hHh LpR fFf")
  q-header(v-if="!loggedIn" bordered :class="headerClass").header
    q-toolbar()
      q-toolbar-title()
        q-btn(stretch flat class="btn-title" :dense="isMobile" @click="goTo('index')").q-ml-sm
          //- img(:src="HeaderLogo" alt="" style="height: 50px;").q-pa-sm
          p {{ COOP_SHORT_NAME }}

      q-btn(stretch flat @click="toogleDark")
        q-icon(:name="isDark ? 'brightness_3' : 'brightness_7'")


      q-btn(v-if="showRegisterButton && !is('signup') && !is('install')" color="primary" class="btn-menu" stretch size="lg" :dense="isMobile" @click="signup")
        p.q-pr-sm регистрация
        i.fa-solid.fa-right-to-bracket

      q-btn(v-if="showRegisterButton && is('signup')" color="primary" class="btn-menu" stretch size="lg" :dense="isMobile" @click="login")
        p.q-pr-sm вход
        i.fa-solid.fa-right-to-bracket


  q-header(v-if="!isMobile && loggedIn" style="border-bottom: 1px solid #00800038 !important; " :style="{ 'background': $q.dark.isActive ? 'black' : 'white' }" :class="headerClass").header
    Menu(style="border-bottom: 1px solid #00800038 !important; ")
    SecondLevelMenu

  //футер контактов
  q-footer(v-if="!loggedIn" :class="headerClass")
    ContactsFooter(:text="footerText")

  q-footer(v-if="loggedIn && isMobile" style="border-top: 1px solid #00800038 !important; "  :class="headerClass")
    SecondLevelMenu
    Menu(style="border-top: 1px solid #00800038 !important; " )

  //контейнер
  q-page-container
    q-page
      router-view


</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useWindowSize } from 'vue-window-size'
import config from 'src/app/config'

const router = useRouter()
const route = useRoute()

// import HeaderLogo from '~/assets/logo-white.png?url'
import Menu from 'src/components/menu/drawerMenu.vue'

import { COOP_SHORT_NAME } from 'src/shared/config'
import { useCurrentUserStore } from 'src/entities/User'
import { useSessionStore } from 'src/entities/Session'
const session = useSessionStore()
import { ContactsFooter } from 'src/shared/ui/Footer'
import { SecondLevelMenu } from 'src/entities/Desktop'

const $q = useQuasar()

const isDark = computed(() => $q.dark.isActive)

const headerClass = computed(() => (isDark.value ? 'text-white bg-dark' : 'text-black bg-light'))

import { useCooperativeStore } from 'src/entities/Cooperative';

const cooperativeStore = useCooperativeStore()

cooperativeStore.loadContacts()

const footerText = computed(() => {
  if (cooperativeStore.contacts && cooperativeStore.contacts.details)
    return `${cooperativeStore.contacts.full_name}, ИНН: ${cooperativeStore.contacts.details.inn}, ОГРН: ${cooperativeStore.contacts.details.ogrn}, телефон: ${cooperativeStore.contacts.phone}, почта: ${cooperativeStore.contacts.email}`
  else return ''
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
  return width.value < 1024
})


const is = (what: string) => {
  return route.name === what
}

const loggedIn = computed(() => {
  return useCurrentUserStore().isRegistrationComplete && session.isAuth
})

const toogleDark = () => {
  $q.dark.toggle()
}

const goTo = (name: string) => {
  router.push({ name })
}

const signup = () => {
  if (session.isAuth) {
    router.push({ name: 'index' })
  } else {
    router.push({ name: 'signup' })
  }
}

const login = () => {
  router.push({ name: 'signin' })
}


</script>

<style lang="scss">
.btn-title {
  font-size: 20px;
  height: 60px;
  padding-top: 2px;
  padding-bottom: 6px;
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
  border-bottom: 1px solid #00800038;
  padding-left: 0px !important;
  padding-right: 0px !important;
}

.drawer-right {
  border-left: 1px solid #00800038 !important;
}

.drawer-left {
  border-right: 1px solid #00800038 !important;
}
</style>
