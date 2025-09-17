<template lang="pug">
q-btn-dropdown(
  v-model='menuOpened',
  :dropdown-icon='"more_vert"',
  flat,
  dense,
  color='grey-7',
  size='sm',
  :menu-anchor='"bottom end"',
  :menu-self='"top end"',
  @click.stop
)
  CreateComponentButton(:project='project', @onClick='handleMenuItemClick')
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CreateComponentButton } from '../../features/Project/CreateComponent';
import type { IProject } from '../../entities/Project/model';

defineProps<{ project: IProject }>();

const menuOpened = ref(false);

const handleMenuItemClick = () => {
  menuOpened.value = false;
};
</script>
