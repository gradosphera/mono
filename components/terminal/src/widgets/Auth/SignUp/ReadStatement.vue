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
        a(@click.stop='(event) => event.stopPropagation()' href='/documents/regulation_on_the_procedure_and_rules_for_using_a_simple_electronic_signature.pdf' target='_blank').q-ml-xs положение о порядке и правилах использования простой электронной подписи
      q-checkbox(v-model='store.agreements.wallet' full-width)
        | Я прочитал и принимаю
        a(@click.stop='(event) => event.stopPropagation()' href='/documents/regulation_on_the_cpp_wallet.pdf' target='_blank').q-ml-xs положение о целевой потребительской программе "Цифровой Кошелёк"
      q-checkbox(v-model='store.agreements.user' full-width)
        | Я прочитал и принимаю
        a(@click.stop='(event) => event.stopPropagation()' href='/documents/user_agreement.pdf' target='_blank').q-ml-xs пользовательское соглашение
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
import { useCreateUser } from 'src/features/User/CreateUser'
import { FailAlert } from 'src/shared/api';
import { Loader } from 'src/shared/ui/Loader';

import { useRegistratorStore } from 'src/entities/Registrator'
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
</script>
<style>
.statement {
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
