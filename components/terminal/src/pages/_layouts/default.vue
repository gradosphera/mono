<!-- Layout.vue -->
<template lang="pug">
  q-layout(view="hHh LpR fff")
    Header(:showDrawer="showDrawer" @toggle-left-drawer="toggleLeftDrawer")

    q-drawer(v-if="showDrawer" v-model="leftDrawerOpen" side="left" bordered :width="200")
      LeftDrawerMenu

    q-footer(v-if="!loggedIn" :class="headerClass" bordered)
      ContactsFooter(:text="footerText")

    q-page-container
      q-page
        router-view
  </template>

  <script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useQuasar } from 'quasar'
  import { useWindowSize } from 'vue-window-size'
  import { useCurrentUserStore } from 'src/entities/User'
  import { useSessionStore } from 'src/entities/Session'
  import { useCooperativeStore } from 'src/entities/Cooperative'
  import { Header } from 'src/widgets/Header'
  import { LeftDrawerMenu } from 'src/widgets/Desktop/LeftDrawerMenu'
  import { ContactsFooter } from 'src/shared/ui/Footer'
  import { useRoute } from 'vue-router'
  import { COOPNAME } from 'src/shared/config'

  const session = useSessionStore()
  const cooperativeStore = useCooperativeStore()
  cooperativeStore.loadContacts()
  const route = useRoute()
  const showDrawer = computed(() => route.params.coopname === COOPNAME)

  const $q = useQuasar()
  const { width } = useWindowSize()
  const leftDrawerOpen = ref(true)

  const isDark = computed(() => $q.dark.isActive)
  const headerClass = computed(() =>
    isDark.value ? 'text-white bg-dark' : 'text-black bg-light'
  )
  const isMobile = computed(() => width.value < 768)
  const loggedIn = computed(
    () => useCurrentUserStore().isRegistrationComplete && session.isAuth
  )
  const footerText = computed(() => {
    if (cooperativeStore.contacts && cooperativeStore.contacts.details) {
      return `${cooperativeStore.contacts.full_name}, ИНН: ${cooperativeStore.contacts.details.inn}, ОГРН: ${cooperativeStore.contacts.details.ogrn}, телефон: ${cooperativeStore.contacts.phone}, почта: ${cooperativeStore.contacts.email}`
    }
    return ''
  })

  onMounted(() => {
    if (isMobile.value || !loggedIn.value) {
      leftDrawerOpen.value = false
    }
  })

  watch(loggedIn, (newValue) => {
    leftDrawerOpen.value = newValue
  })

  const toggleLeftDrawer = () => {
    leftDrawerOpen.value = !leftDrawerOpen.value
  }
  </script>

  <style lang="scss">
  .drawer-right {
    border-left: 1px solid #00800038 !important;
  }

  .drawer-left {
    border-right: 1px solid #00800038 !important;
  }
  </style>
