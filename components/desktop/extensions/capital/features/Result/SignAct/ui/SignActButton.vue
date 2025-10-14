<template lang="pug">
q-btn(
  color='primary',
  @click='handleSignAct',
  :loading='isLoading',
  label='Подписать Акт'
)
</template>

<script setup lang="ts">
import { useSignAct } from '../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import type { ISegment } from 'app/extensions/capital/entities/Segment/model';

interface Props {
  segment: ISegment;
  coopname: string;
}

const props = defineProps<Props>();

const { signActAsContributor, isLoading } = useSignAct();

const handleSignAct = async () => {
  try {
    await signActAsContributor(props.segment, props.coopname);
    SuccessAlert('Акт успешно подписан и отправлен');
  } catch (error) {
    FailAlert(error);
  }
};
</script>
