<template lang="pug">
div
  .q-pa-md(v-if='loading')
    .q-mb-lg(v-for='i in 3', :key='i')
      q-skeleton.rounded(type='rect', height='160px')

  .empty-state.q-pa-xl(v-else-if='!loading && !meets.length')
    .empty-icon
      q-icon(name='event_busy', size='64px', color='grey-5')
    .empty-text У кооператива нет предстоящих общих собраний
    .empty-subtitle Общие собрания пока не проводились

  .q-pa-md(v-else)
    .row.q-col-gutter-md
      .col-12(v-for='meet in meets', :key='meet.hash')
        MeetCompactCard(:meet='meet', @navigate='navigateToMeetDetails(meet)')
</template>

<script setup lang="ts">
import { MeetCompactCard } from 'src/shared/ui/MeetCompactCard';
import type { IMeet } from 'src/entities/Meet';
import { useRouter } from 'vue-router';
import { useDesktopStore } from 'src/entities/Desktop/model';

defineProps<{
  meets: IMeet[];
  loading: boolean;
}>();

const router = useRouter();
const desktop = useDesktopStore();

// Навигация к деталям собрания
const navigateToMeetDetails = (meet: IMeet) => {
  const currentWorkspace = desktop.activeWorkspaceName;
  const isSoviet = currentWorkspace === 'soviet';

  const routeName = isSoviet ? 'meet-details' : 'user-meet-details';

  router.push({
    name: routeName,
    params: {
      hash: meet.hash,
      coopname: router.currentRoute.value.params.coopname,
    },
  });
};
</script>

<style lang="scss" scoped>
@import 'src/shared/ui/CardStyles/index.scss';
</style>
