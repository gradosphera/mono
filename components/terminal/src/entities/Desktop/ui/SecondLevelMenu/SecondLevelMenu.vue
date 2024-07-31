<template lang="pug">

q-tabs(
  v-if="routes"
  dense
  switch-indicator
  inline-label
  outside-arrows
  mobile-arrows
  align="justify"
  active-class="bg-teal"
  active-bg-color="teal"
  active-color="white"
  indicator-color="secondary"
)

  q-route-tab(
    v-for="route in routes"
    :key="route.name"
    :name="route.meta.title"
    :label="route.meta.title"
    :to="{ name: route.name }"
    :params="{coopname: 'voskhod'}"
  )


</template>
<script lang="ts" setup>
import { type IRoute, useDesktopStore } from 'src/app/providers/desktops';
import { useCurrentUserStore } from 'src/entities/User';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const desktop = useDesktopStore()
const routes = ref<IRoute[]>([])
const route = useRoute()
const user = useCurrentUserStore()

const init = () => {
  const userRole = user.userAccount?.role || 'user';

  routes.value = (desktop.getSecondLevel(route) as unknown as IRoute[]).filter(
    (route) => route.meta?.roles?.includes(userRole) || route.meta?.roles?.length === 0
  );
}

init()

watch(route, () => init())
</script>
