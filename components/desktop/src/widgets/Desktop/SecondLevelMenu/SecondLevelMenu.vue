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
).second-menu

  q-route-tab(
    v-for="route in routes"
    :key="route.name"
    :name="route.meta.title"
    :label="route.meta.title"
    :to="{ name: route.name }"
    :params="{coopname: info.coopname}"
  )


</template>
<script lang="ts" setup>
import { useCurrentUserStore } from 'src/entities/User';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { type IRoute } from 'src/entities/Desktop/model/types';
import { useSystemStore } from 'src/entities/System/model';
const { info } = useSystemStore()

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

<style>

.second-menu .q-tab__label {
  font-size: 12px !important;
}
</style>
