<template lang="pug">

q-btn(
  color='primary',
  @click='handleSignAct',
  :loading='isLoading',
  label='Подписать Акт (Председатель)'
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

/**
 * Обработчик подписания акта председателем (вторая подпись).
 * Председатель накладывает свою подпись на уже подписанный участником акт.
 */
const handleSignAct = async () => {
  try {
    await signActAsChairman(props.segment, props.coopname);
    SuccessAlert('Акт успешно подписан председателем и отправлен');
  } catch (error) {
    FailAlert(error);
  }
};
</script>
