<template lang='pug'>
div
  q-step(:name='store.steps.GenerateAccount', title='Получите приватный ключ и надежно сохраните его для цифровой подписи', :done='store.isStepDone("GenerateAccount")')
    div
      p.full-width Приватный ключ используется для входа в систему и подписи документов. Мы рекомендуем сохранить его в бесплатном менеджере паролей, таком как
        a(href="https://bitwarden.com/download" target="_bank").q-ml-xs Bitwarden
        | .


    q-input.q-mt-lg(
      v-if='account.private_key',
      :model-value='account.private_key',
      label='Приватный ключ'
    )

    q-checkbox(v-model="i_save", label="Я сохранил имя и ключ в надёжном месте")

    .q-mt-lg
      q-btn.col-md-6.col-xs-12(flat, @click="store.prev()")
        i.fa.fa-arrow-left
        span.q-ml-md назад

      q-btn.col-md-6.col-xs-12(flat, @click='copyMnemonic')
        i.fa.fa-copy
        span.q-ml-md скопировать

      q-btn.q-mt-lg.q-mb-lg(color='primary', :disabled="!i_save" @click='setAccount')
        | Продолжить
        q-tooltip подтвердите сохранение ключа для продолжения
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useCreateUser } from 'src/features/User/CreateUser'
import { Notify, copyToClipboard } from 'quasar'
import { useRegistratorStore } from 'src/entities/Registrator'
import { Classes } from '@coopenomics/sdk'

const store = useRegistratorStore()

import { FailAlert } from 'src/shared/api'

const api = useCreateUser()
const i_save = ref(false)
const account = ref(store.state.account)

if (!account.value.private_key || !account.value.public_key || !account.value.username)
  account.value = new Classes.Account()

const email = computed(() => store.state.email)
const userData = computed(() => store.state.userData)

const copyMnemonic = () => {
  const toCopy = `${account.value.private_key}`

  copyToClipboard(toCopy)
    .then(() => {
      Notify.create({
        message: 'Информация скопирована в буфер обмена',
        type: 'positive',
      })
    })
    .catch((e) => {
      console.log(e)
    })
}

const setAccount = async () => {
  try {

    await api.createUser(email.value, userData.value, account.value)
    store.state.account = account.value
    if (store.isBranched)
      store.goTo('SelectBranch')
    else
      store.goTo('ReadStatement')

  } catch (e: any) {
    store.goTo('SetUserData')
    console.error(e)
    FailAlert(e)
  }
}
</script>
