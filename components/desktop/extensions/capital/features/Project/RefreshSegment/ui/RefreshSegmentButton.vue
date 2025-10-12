<template lang="pug">
q-btn(
  color='primary',
  @click='handleRefreshSegment',
  :loading='loading',
  label='Пересчитать результат'
)
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRefreshSegment } from '../model';
import { FailAlert } from 'src/shared/api/alerts';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';
import type { IProject } from 'app/extensions/capital/entities/Project/model';

interface Props {
  segment: ISegment;
  project?: IProject;
  coopname: string;
}

const props = defineProps<Props>();

const { refreshSegmentAndUpdateStore, refreshSegmentInput } = useRefreshSegment(props);
const loading = ref(false);

const handleRefreshSegment = async () => {
  if (!props.project) return;

  loading.value = true;
  try {
    await refreshSegmentAndUpdateStore(refreshSegmentInput.value);
  } catch (error) {
    FailAlert(error);
  } finally {
    loading.value = false;
  }
};
</script>
