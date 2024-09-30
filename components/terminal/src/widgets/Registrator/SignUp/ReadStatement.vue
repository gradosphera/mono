<template lang='pug'>
div
  q-step(
    :name='currentStep',
    title='Ознакомьтесь с заполненным заявлением на вступление в кооператив',
    :done='step > currentStep'
  )
    //- p Прочитайте заявление и примите положения
    div(v-if='isLoading').full-width.text-center.q-mt-lg.q-mb-lg
      Loader(:text='`Заполняем заявление...`')
    // eslint-disable-next-line vue/no-v-html
    div(v-if='!isLoading' v-html='html').statement

    div(v-if='!isLoading').q-gutter-sm
      q-checkbox(v-model='store.agreements.digital_signature' full-width)
        | Я прочитал и принимаю
        ReadAgreementDialog(v-if="signatureAgreement" :agreement="signatureAgreement" v-model:agree="store.agreements.digital_signature" text="положение о порядке и правилах использования простой электронной подписи")
          AgreementReader(:agreement="signatureAgreement").q-mb-lg

      q-checkbox(v-model='store.agreements.wallet' full-width)
        | Я прочитал и принимаю
        ReadAgreementDialog(v-if="walletAgreement" :agreement="walletAgreement" v-model:agree="store.agreements.wallet" text="положение о целевой потребительской программе 'Цифровой Кошелёк'")
          AgreementReader(:agreement="walletAgreement").q-mb-lg

      q-checkbox(v-model='store.agreements.user' full-width)
        | Я прочитал и принимаю
        ReadAgreementDialog(v-if="userAgreement" :agreement="userAgreement" v-model:agree="store.agreements.user" text="пользовательское соглашение")
          AgreementReader(:agreement="userAgreement").q-mb-lg

      q-checkbox(v-model='store.agreements.ustav' full-width)
        | Я прочитал и принимаю

        a(@click.stop='(event) => event.stopPropagation()' href='/documents/ustav.pdf' target='_blank').q-ml-xs Устав кооператива

    div(v-if="!isLoading").q-mt-lg
      q-btn.col-md-6.col-xs-12(flat, @click='store.step = currentStep - 1')
        i.fa.fa-arrow-left
        span.q-ml-md назад

      q-btn.q-mt-lg.q-mb-lg(color='primary', label='Продолжить', :disabled='!agreeWithAll' @click='next')
</template>
<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCreateUser } from 'src/features/Registrator/CreateUser'
import { FailAlert } from 'src/shared/api';
import { Loader } from 'src/shared/ui/Loader';
import { ReadAgreementDialog } from 'src/features/Agreementer/ReadAgreementDialog';
import { useAgreementStore } from 'src/entities/Agreement'
import { AgreementReader } from 'src/features/Agreementer/GenerateAgreement';

const agreementer = useAgreementStore()

import { useRegistratorStore } from 'src/entities/Registrator'
import { COOPNAME } from 'src/shared/config';
const store = useRegistratorStore().state


const { generateStatementWithoutSignature } = useCreateUser()

const currentStep = ref(4)

const agreeWithAll = computed(() => {
  return store.agreements.digital_signature && store.agreements.wallet && store.agreements.user && store.agreements.ustav
})

const username = computed(() => store.account.username)

const step = computed(() => store.step)
const html = ref()
const isLoading = ref(false)

const loadStatement = async (): Promise<void> => {
  try {
    isLoading.value = true
    const document = await generateStatementWithoutSignature(username.value)
    html.value = document.html
    isLoading.value = false
  } catch (e: any) {
    isLoading.value = false
    FailAlert(e.message)
  }
}

onMounted(() => {
  if (step.value === currentStep.value) {


    loadStatement()
  }
})

watch(step, (value: number) => {
  if (value === currentStep.value) {
    loadStatement()
  }
})

const next = () => {
  store.step = currentStep.value + 1
}

const signatureAgreement = computed(() => {
  return agreementer.cooperativeAgreements.find(el => el.type == 'signature')
})

const walletAgreement = computed(() => {
  return agreementer.cooperativeAgreements.find(el => el.type == 'wallet')
})


const userAgreement = computed(() => {
  return agreementer.cooperativeAgreements.find(el => el.type == 'user')
})


</script>
