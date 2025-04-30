<!-- MainHeader.vue -->
<template lang="pug">
q-header(bordered :class="headerClass").header
  q-toolbar()
    q-btn(v-if="loggedIn" stretch icon="menu" flat @click="emitToggleLeftDrawer")
    BackButton(v-if="loggedIn")
    q-toolbar-title()

    SettingsDropdown(:isMobile="isMobile" :isChairman="isChairman" :isMember="isMember")

    template(v-if="!loggedIn")
      q-btn(
        v-if="showRegisterButton && !is('signup') && !is('install')"
        color="primary"
        stretch
        :size="isMobile ? 'sm' : 'lg'"
        @click="signup"
      )
        span.q-pr-sm регистрация
        i.fa-solid.fa-right-to-bracket

      q-btn(
        v-if="showRegisterButton && is('signup')"
        color="primary"
        stretch
        :size="isMobile ? 'sm' : 'lg'"
        @click="login"
      )
        span.q-pr-sm вход
        i.fa-solid.fa-right-to-bracket
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useCurrentUserStore } from 'src/entities/User'
import { useSessionStore } from 'src/entities/Session'
import config from 'src/app/config'
import { useWindowSize } from 'src/shared/hooks'
import { SettingsDropdown } from 'src/widgets/Header/SettingsDropdown'
import { BackButton } from 'src/widgets/Header/BackButton'
import './HeaderStyles.scss'
// import { env } from 'src/shared/config'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const session = useSessionStore()
const { isMobile } = useWindowSize()
const emit = defineEmits(['toggle-left-drawer'])

// Получаем информацию для навигации назад
// const coopTitle = computed(() => env.COOP_SHORT_NAME)

const isDark = computed(() => $q.dark.isActive)
const headerClass = computed(() =>
  isDark.value ? 'text-white bg-dark' : 'text-black bg-light'
)
const currentUser = useCurrentUserStore()
const loggedIn = computed(
  () => currentUser.isRegistrationComplete && session.isAuth
)

const isChairman = computed(() => currentUser.userAccount?.role === 'chairman')
const isMember = computed(() => currentUser.userAccount?.role === 'member')

const showRegisterButton = computed(() => {
  if (!loggedIn.value) {
    return config.registrator.showRegisterButton
  }
  return false
})

const is = (what: string) => route.name === what

const signup = () => {
  router.push({ name: 'signup' })
}

const login = () => {
  router.push({ name: 'signin' })
}

const emitToggleLeftDrawer = () => {
  emit('toggle-left-drawer')
}
</script>
