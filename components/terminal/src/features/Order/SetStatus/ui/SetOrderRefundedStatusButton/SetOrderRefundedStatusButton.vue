<template lang="pug">
q-item(clickable flat size="sm" @click="showDialog=true").full-width
  div.q-pa-sm
    q-icon(name="cancel").q-mr-xs
    span отменен

  q-dialog(v-model="showDialog" @hide="close")
    ModalBase(title='отметить отменённым')
      Form(:handler-submit="setRefund" :is-submitting="isSubmitting" :button-cancel-txt="'Отменить'" :button-submit-txt="'Продолжить'" @cancel="close").q-pa-sm
        div(style="max-width: 300px;")
          p Вы уверены, что хотите отметить платеж отмененным? Система обработает возврат платежа по лицевому счёту пайщика сразу после получения отметки.
          p При отмене уже зачисленного паевого взноса, баланс аккаунта будет уменьшен. В случае отмены вступительного взноса - действие аккаунта будет приостановлено.

</template>
<script lang="ts" setup>
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSetStatus } from '../../model';
import { ref } from 'vue';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
const {setRefundedStatus} = useSetStatus()
const isSubmitting = ref(false)
const showDialog = ref(false)

const emit = defineEmits(['close'])

const props = defineProps({
  id: {
    type: String,
    required: true
  },
})

const close = () => {
  showDialog.value = false
  emit('close')
}

const setRefund = async() => {
  try {
    await setRefundedStatus(props.id)
    SuccessAlert('Статус ордера обновлён')
    close()
  } catch(e: any) {
    FailAlert(`Возникла ошибка: ${e.message}`)
    close()
  }
}
</script>
