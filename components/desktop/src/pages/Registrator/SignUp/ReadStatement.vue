<template lang='pug'>
div
  q-step(
    :name='store.steps.ReadStatement',
    title='Ознакомьтесь с заполненным заявлением на вступление в кооператив',
    :done='store.isStepDone("ReadStatement")'
  )

    //- p Прочитайте заявление и примите положения
    div(v-if='isLoading').full-width.text-center.q-mt-lg.q-mb-lg
      Loader(:text='`Заполняем заявление...`')
    // eslint-disable-next-line vue/no-v-html
    div(ref='statementDiv' v-if='!isLoading' v-html='html').store.statement

    div(v-if='!isLoading').q-gutter-sm
      q-checkbox(v-model='store.state.agreements.digital_signature').full-width
        | Я прочитал и принимаю
        ReadAgreementDialog(v-if="signatureAgreement" :agreement="signatureAgreement" v-model:agree="store.state.agreements.digital_signature" text="положение о порядке и правилах использования простой электронной подписи")
          AgreementReader(:agreement="signatureAgreement").q-mb-lg

      q-checkbox(v-model='store.state.agreements.wallet').full-width
        | Я прочитал и принимаю
        ReadAgreementDialog(v-if="walletAgreement" :agreement="walletAgreement" v-model:agree="store.state.agreements.wallet" text="положение о целевой потребительской программе 'Цифровой Кошелёк'")
          AgreementReader(:agreement="walletAgreement").q-mb-lg

      q-checkbox(v-model='store.state.agreements.user').full-width
        | Я прочитал и принимаю
        ReadAgreementDialog(v-if="userAgreement" :agreement="userAgreement" v-model:agree="store.state.agreements.user" text="пользовательское соглашение")
          AgreementReader(:agreement="userAgreement").q-mb-lg

      q-checkbox(v-model='store.state.agreements.ustav').full-width
        | Я прочитал и принимаю

        a(v-if='hasStatuteLink' @click.stop='(event) => event.stopPropagation()' :href='statuteLink' target='_blank').q-ml-xs Устав кооператива
        span(v-else).q-ml-xs Устав кооператива

    div(v-if="!isLoading").q-mt-lg
      q-btn.col-md-6.col-xs-12(flat @click='back')
        i.fa.fa-arrow-left
        span.q-ml-md назад

      q-btn.q-mt-lg.q-mb-lg(color='primary', label='Продолжить', :disabled='!agreeWithAll' @click='store.next()')
</template>
<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useCreateUser } from 'src/features/User/CreateUser'
import { FailAlert } from 'src/shared/api';
import { Loader } from 'src/shared/ui/Loader';
import { ReadAgreementDialog } from 'src/features/Agreementer/ReadAgreementDialog';
import { useAgreementStore } from 'src/entities/Agreement'
import { AgreementReader } from 'src/features/Agreementer/GenerateAgreement';
const agreementer = useAgreementStore()

import { useRegistratorStore } from 'src/entities/Registrator'
const store = useRegistratorStore()

import { useSystemStore } from 'src/entities/System/model'
const systemStore = useSystemStore()

const { generateStatementWithoutSignature } = useCreateUser()

const agreeWithAll = computed(() => {
  return store.state.agreements.digital_signature && store.state.agreements.wallet && store.state.agreements.user && store.state.agreements.ustav
})

const html = ref()
const isLoading = ref(false)
const statementDiv = ref<any>()

const loadStatement = async (): Promise<void> => {
  try {
    isLoading.value = true
    const document = await generateStatementWithoutSignature()
    html.value = document.html
    isLoading.value = false
    await nextTick()
    statementDiv.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (e: any) {
    isLoading.value = false
    FailAlert(e)
  }
}
const back = () => {
  if (store.isBranched)
      store.goTo('SelectBranch')
    else
      store.goTo('GenerateAccount')

}
onMounted(() => {
  if (store.state.step === store.steps.ReadStatement) {
    loadStatement()
  }
})

watch(() => store.state.step, (value: number) => {
  if (value === store.steps.ReadStatement) {
    loadStatement()
  }
})

const signatureAgreement = computed(() => {
  return agreementer.cooperativeAgreements.find(el => el.type == 'signature')
})

const walletAgreement = computed(() => {
  return agreementer.cooperativeAgreements.find(el => el.type == 'wallet')
})


const userAgreement = computed(() => {
  return agreementer.cooperativeAgreements.find(el => el.type == 'user')
})

const statuteLink = computed(() => {
  return systemStore.info.vars?.statute_link || ''
})

const hasStatuteLink = computed(() => {
  return statuteLink.value && statuteLink.value.trim() !== ''
})


</script>
