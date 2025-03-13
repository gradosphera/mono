<template lang="pug">
div
  q-btn(@click="updateAccountHandler" color="primary" size="sm" :loading="isSubmitting" :disabled="isDisabled") Сохранить
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useUpdateAccount } from '../model';
import { extractGraphQLErrorMessages, FailAlert, SuccessAlert } from 'src/shared/api';
import type { Zeus } from '@coopenomics/sdk';

const isSubmitting = ref(false)
const { updateAccount } = useUpdateAccount()

const props = defineProps({
    isDisabled: {
        type: Boolean,
        default: false
    },
    accountData: {
        type: Object as () => Zeus.ModelTypes['Individual'],
        required: true
    }
})

const updateAccountHandler = async () => {
  try {
    isSubmitting.value = true
    const data = props.accountData
    // data.role = 'User'
    // data.type = data.type.charAt(0).toUpperCase() + data.type.slice(1)
    const individual_data = { 
        birthdate: data.private_data.birthdate,
        first_name: data.private_data.first_name,
        full_address: data.private_data.full_address,
        last_name: data.private_data.last_name,
        middle_name: data.private_data.middle_name,
        phone: data.private_data.phone
    }
    if (data.private_data?.passport) {
        individual_data.passport = data.private_data.passport
    }
    await updateAccount(individual_data)
    SuccessAlert('Данные аккаунта обновлены')
  } catch(e){
    FailAlert(`Ошибка при сохранении: ${extractGraphQLErrorMessages(e)}`)
  } finally {
    isSubmitting.value = false
  }

}
</script>