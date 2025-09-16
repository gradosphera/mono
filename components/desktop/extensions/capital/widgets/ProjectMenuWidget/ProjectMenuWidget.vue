<template lang="pug">
q-btn-dropdown(
  :dropdown-icon='"more_vert"',
  flat,
  dense,
  color='grey-7',
  size='sm',
  :menu-anchor='"bottom end"',
  :menu-self='"top end"'
)
  q-list(dense)
    CreateComponentButton(:project='project')
</template>

<script lang="ts" setup>
import { CreateComponentButton } from '../../features/Project/CreateComponent';
import type { IProject } from '../../entities/Project/model';

defineProps<{ project: IProject }>();
</script>
