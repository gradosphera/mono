<template lang="pug">
  q-page.padding
    ParticipantsTable(
      :accounts="accountStore.accounts.items"
      :loading="onLoading"
      @toggle-expand="toggleExpand"
      @update="update"
    )
      template(#top)
        AddUserDialog
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Notify } from 'quasar'
import { useAccountStore } from 'src/entities/Account/model'
import { AddUserDialog } from 'src/features/User/AddUser/ui/AddUserDialog'
import { ParticipantsTable } from 'src/widgets/Participants'
import {
  AccountTypes,
  type IAccount,
  type IIndividualData,
  type IOrganizationData,
  type IEntrepreneurData
} from 'src/entities/Account/types'

const accountStore = useAccountStore()
const onLoading = ref(false)
const expanded = reactive(new Map<string, boolean>())
const currentTab = reactive<Record<string, string>>({})

const toggleExpand = (id: string) => {
  expanded.set(id, !expanded.get(id))
  if (!currentTab[id]) currentTab[id] = 'info'
}

const loadParticipants = async () => {
  try {
    onLoading.value = true
    await accountStore.getAccounts({ options: { page: 1, limit: 1000, sortOrder: 'DESC' } })
  } catch (e: any) {
    Notify.create({ message: e.message, type: 'negative' })
  } finally {
    onLoading.value = false
  }
}
loadParticipants()

const update = (account: IAccount, newData: IIndividualData | IOrganizationData | IEntrepreneurData) => {
  switch (account.private_account?.type) {
    case AccountTypes.Individual:
      account.private_account.individual_data = {
        ...newData as IIndividualData,
        passport: (newData as IIndividualData).passport ?? undefined
      }
      break
    case AccountTypes.Entrepreneur:
      account.private_account.entrepreneur_data = newData as IEntrepreneurData
      break
    case AccountTypes.Organization:
      account.private_account.organization_data = newData as IOrganizationData
      break
  }
}
</script>
