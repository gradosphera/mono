<template lang="pug">
q-btn(
  color='primary',
  @click='handleSignAct',
  :loading='isLoading',
  label='Подписать Акт Председателем'
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

const { signActAsChairman, isLoading } = useSignAct();

const handleSignAct = async () => {
  try {
    await signActAsChairman(props.segment, props.coopname);
    SuccessAlert('Акт успешно подписан председателем и отправлен');
  } catch (error) {
    FailAlert(error);
  }
};
</script>
