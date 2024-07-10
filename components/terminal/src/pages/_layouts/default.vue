<template lang="pug">
q-layout(view="hHh LpR fFf")
  q-header(v-if="!loggedIn && config.headerEnabled" bordered :class="headerClass" reveal :reveal-offset="500").header
    q-toolbar()
      q-toolbar-title()
        q-btn(stretch flat class="btn-title" :dense="isMobile" @click="goToIndex")
          img(:src="HeaderLogo" alt="" style="height: 50px;").q-pa-sm
          p(v-if="!isMobile").q-ml-xs {{ COOP_SHORT_NAME }}

      q-btn(stretch flat @click="toogleDark")
        q-icon(:name="isDark ? 'brightness_3' : 'brightness_7'")

      q-btn(v-if="showRegisterButton && !isRegistratorPage" color="primary" class="btn-menu" stretch size="lg" :dense="isMobile" @click="signup")
        p.q-pr-sm регистрация
        i.fa-solid.fa-right-to-bracket

      q-btn(v-if="showRegisterButton && isRegistratorPage" color="primary" class="btn-menu" stretch size="lg" :dense="isMobile" @click="login")
        p.q-pr-sm вход
        i.fa-solid.fa-right-to-bracket

  q-drawer(v-if="loggedIn" v-model="leftDrawerOpen" :mini="isMini" show-if-above side="left" persistent :mini-width="71" :width="71" class="drawer-left")
    Menu(:mini="isMini")

  //скрывающееся мобильное меню
  q-drawer(v-if="loggedIn && isMobile" v-model="rightDrawerOpen" behavior="mobile" side="right" persistent :mini-width="71" :width="71" class="drawer-right")
    Menu(:mini="false")

  //футер мобильного меню
  q-footer(v-if="loggedIn && isMobile" :class="footerClass" style="height: 55px; border-top: 1px solid #00800038 !important; " :style="{ 'background': $q.dark.isActive ? 'black' : 'white' }")
    mobileMenu(@toogle-more="toggleRightDrawer")

  //контейнер всех страниц
  q-page-container.full-height
    q-page(class="page" ).full-height
      router-view(v-slot="{ Component }").full-height
        component(:is="Component" ).full-height


</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar, Cookies, LocalStorage } from 'quasar'
import { useWindowSize } from 'vue-window-size'
import config from 'src/app/config'
import HeaderLogo from 'src/assets/logo-white.png?url'
import Menu from 'src/components/menu/drawerMenu.vue'
import mobileMenu from 'src/components/menu/footerMobileMenu.vue'
import { COOPNAME, COOP_SHORT_NAME } from 'src/shared/config'
import { useCurrentUserStore } from 'src/entities/User'
import { useSessionStore } from 'src/entities/Session'
const session = useSessionStore()

const $q = useQuasar()

const isDark = computed(() => $q.dark.isActive)

const headerClass = computed(() => (isDark.value ? 'text-white bg-dark' : 'text-black bg-light'))
const footerClass = computed(() => (isDark.value ? 'text-white' : 'text-black'))

defineExpose({
  $q,
})

const router = useRouter()

const route = useRoute()
const { width } = useWindowSize()

const leftDrawerOpen = ref<boolean>(false)

const rightDrawerOpen = ref<boolean>(false)

// const toggleLeftDrawer = () => {
//   leftDrawerOpen.value = !leftDrawerOpen.value
// }

const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

const showRegisterButton = computed(() => {
  if (!loggedIn.value) {
    if (config.registrator.showRegisterButton) return true
    else return false
    // if (isIndexRoute.value) return config.registrator.showInIndexHeader
    // else return config.registrator.showInOtherHeader
  } else return false
})

const isRegistratorPage = computed(() => {
  return route.name == 'signup'
})

const isMobile = computed(() => {
  return width.value < 1024
})

if (isMobile.value == true) {
  leftDrawerOpen.value = false
} else {
  leftDrawerOpen.value = true
}

const isMini = computed(() => {
  return !rightDrawerOpen.value && !rightDrawerOpen.value && !isMobile.value
})

const loggedIn = computed(() => {
  return useCurrentUserStore().isRegistrationComplete && session.isAuth
})

watch(isMobile, (newValue) => {
  if (newValue == true) leftDrawerOpen.value = false
  else leftDrawerOpen.value = true
})

watch(route, () => {
  checkAuth()
  if (isMobile.value)
    leftDrawerOpen.value = false
})

const checkAuth = () => {
  if (!loggedIn.value && route.name != 'signin' && route.name != 'signup') {
    router.push({ name: 'signup', params: { coopname: config.coreHost } })
  }
}

const toogleDark = () => {
  $q.dark.toggle()
}

const goToIndex = () => {
  router.push({ name: 'index' })
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

onMounted(async () => {
  const ref = Cookies.get('referer') || String(route.query.r || '')
  if (ref) {
    LocalStorage.setItem(`${COOPNAME}:referer`, ref)
  }

  await checkAuth()
})
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
