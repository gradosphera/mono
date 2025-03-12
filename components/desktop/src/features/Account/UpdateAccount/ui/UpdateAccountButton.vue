<template lang="pug">
div
  q-btn(@click="updateAccountHandler" color="primary" size="sm" :loading="isSubmitting" :disabled="isDisabled") Сохранить
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useUpdateAccount } from '../model';
import { extractGraphQLErrorMessages, FailAlert, SuccessAlert } from 'src/shared/api';

const isSubmitting = ref(false)
const { updateAccount } = useUpdateAccount()

const props = defineProps({
    isDisabled: {
        type: Boolean,
        default: false
    },
    accountData: {
        type: Object as () => Record<string, any>,
        required: true
    }
})

const updateAccountHandler = async () => {
  try {
    isSubmitting.value = true
    const data = props.accountData
    console.log('data: ', data)
    data.role = 'User'
    data.type = data.type.charAt(0).toUpperCase() + data.type.slice(1)
    delete data.is_registered
    delete data.issued_at
    delete data.issued_by
    delete data.series
    delete data.number
    delete data.status
    delete data.is_email_verified
    delete data.has_account
    delete data.created_at
    delete data.updated_at
    delete data.initial_order
    delete data.id
    delete data.createdAt
    delete data.updatedAt
    data.individual_data = data.private_data
    if (data.private_data?.passport) {
        data.individual_data.passport = data.passport
    }
    delete data.passport
    delete data.private_data
    delete data.individual_data._created_at
    delete data.individual_data._id
    delete data.individual_data.username
    delete data.individual_data.email
    delete data.individual_data.deleted
    delete data.individual_data.block_num
    delete data.individual_data.createdAt
    delete data.individual_data.updatedAt
    await updateAccount(data)
    SuccessAlert('Данные аккаунта обновлены')
  } catch(e){
    FailAlert(`Ошибка при сохранении: ${extractGraphQLErrorMessages(e)}`)
  } finally {
    isSubmitting.value = false
  }

}
</script>