<template lang="pug">
  q-layout(view="lHh LpR fff")
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
  import { Header } from 'src/widgets/Header/CommonHeader'
  import { LeftDrawerMenu } from 'src/widgets/Desktop/LeftDrawerMenu'
  import { ContactsFooter } from 'src/shared/ui/Footer'
  import { useDefaultLayoutLogic} from './useDefaultLayoutLogic'

  const {
    leftDrawerOpen,
    showDrawer,
    headerClass,
    footerText,
    loggedIn,
    toggleLeftDrawer,
  } = useDefaultLayoutLogic()
  </script>

  <style lang="scss">
  .drawer-right {
    border-left: 1px solid #00800038 !important;
  }

  .drawer-left {
    border-right: 1px solid #00800038 !important;
  }
  </style>
