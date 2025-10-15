<template lang="pug">
q-btn(
  size="md"
  :flat="!isActive",
  color="secondary",
  :class="{'route-menu-button-active': isActive}",
  :label="label"
  @click="handleClick"

)
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{
  routeName: string;
  label: string;
  routeParams?: Record<string, any>;
}>();

const route = useRoute();
const router = useRouter();

// Определяем, активен ли маршрут
const isActive = computed(() => {
  return route.name === props.routeName;
});

// Обработчик клика
const handleClick = () => {
  router.push({
    name: props.routeName,
    params: props.routeParams || {},
  });
};
</script>

<style lang="sass" scoped>
@import 'src/app/styles/variables'

.route-menu-button-active
  background: $secondary-light-gradient !important


</style>
