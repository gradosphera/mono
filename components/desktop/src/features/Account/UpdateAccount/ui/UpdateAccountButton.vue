<template lang="pug">
div
  q-btn(@click="updateAccountHandler" color="primary" size="sm" :loading="isSubmitting" :disabled="isDisabled") Сохранить
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { type IUpdateAccountInput, useUpdateAccount } from '../model';
import { extractGraphQLErrorMessages, FailAlert, SuccessAlert } from 'src/shared/api';
import { Zeus } from '@coopenomics/sdk';
import type { IUserAccountData } from 'src/entities/User';
import type { IIndividualData, IOrganizationData, IEntrepreneurData } from 'src/shared/lib/types/user/IUserData';

const isSubmitting = ref(false)
const { updateAccount } = useUpdateAccount()

const props = defineProps({
    isDisabled: {
        type: Boolean,
        default: false
    },
    accountData: {
        type: Object as () => IUserAccountData,
        required: true
    },
    accountType: {
        type: String as () => Zeus.AccountType,
        required: true
    }
})

const updateAccountHandler = async () => {
  try {
    isSubmitting.value = true

    const account_data: IUpdateAccountInput = {
      email: props.accountData.email,
      role: Zeus.RegisterRole.User,
      type: props.accountType,
      username: props.accountData.username,
      individual_data: props.accountData.private_data as IIndividualData
    }

    if(props.accountType === Zeus.AccountType.Organization) {
      account_data.organization_data = props.accountData.private_data as IOrganizationData
    } else if(props.accountType === Zeus.AccountType.Entrepreneur) {
      account_data.entrepreneur_data = props.accountData.private_data as IEntrepreneurData
    }

    await updateAccount(account_data)
    SuccessAlert('Данные аккаунта обновлены')
  } catch(e){
    FailAlert(`Ошибка при сохранении: ${extractGraphQLErrorMessages(e)}`)
  } finally {
    isSubmitting.value = false
  }

}
</script>
