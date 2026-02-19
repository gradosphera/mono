<template lang="pug">
q-btn(
  color='primary',
  @click='handleRefreshSegment',
  :loading='loading',
  label='Пересчитать результат'
)
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRefreshSegment } from '../model';
import { FailAlert } from 'src/shared/api/alerts';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';
import { useSystemStore } from 'src/entities/System/model';
import type { IRefreshSegmentProps } from '../model';

interface Props {
  segment: ISegment;
}

const props = defineProps<Props>();
const { info } = useSystemStore();

const refreshProps = computed<IRefreshSegmentProps>(() => ({
  segment: props.segment,
  coopname: info.coopname
}));

const { refreshSegmentAndUpdateStore, refreshSegmentInput } = useRefreshSegment(refreshProps);
const loading = ref(false);

const handleRefreshSegment = async () => {

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
