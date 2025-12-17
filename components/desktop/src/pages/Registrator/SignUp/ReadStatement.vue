<template lang='pug'>
div
  q-step(
    :name='registratorStore.steps.ReadStatement',
    title='Ознакомьтесь с заполненным заявлением на вступление в кооператив',
    :done='registratorStore.isStepDone("ReadStatement")'
  )

    //- p Прочитайте заявление и примите положения
    div(v-if='isLoading').full-width.text-center.q-mt-lg.q-mb-lg
      Loader(:text='loadingText')
    // eslint-disable-next-line vue/no-v-html
    div(ref='statementDiv' v-if='!isLoading' v-html='html').statement

    div(v-if='!isLoading').q-gutter-sm
      //- Динамические галочки из конфигурации
      template(v-for='doc in registrationStore.registrationDocuments' :key='doc.id')
        q-checkbox(
          :model-value='doc.accepted'
          @update:model-value='(val) => registrationStore.setAgreementAccepted(doc.id, val)'
        ).full-width
          | {{ doc.checkbox_text }}
          ReadAgreementDialog(
            v-if='doc.link_text'
            v-model:agree='doc.accepted'
            @update:agree='(val) => registrationStore.setAgreementAccepted(doc.id, val)'
            :text='doc.link_text'
          )
            // eslint-disable-next-line vue/no-v-html
            div(v-html='doc.document.html').q-mb-lg

      //- Устав кооператива (всегда показывается)
      q-checkbox(v-model='registratorStore.state.agreements.ustav').full-width
        | Я прочитал и принимаю

        a(v-if='hasStatuteLink' @click.stop='(event) => event.stopPropagation()' :href='statuteLink' target='_blank').q-ml-xs Устав кооператива
        span(v-else).q-ml-xs Устав кооператива

    div(v-if="!isLoading").q-mt-lg
      q-btn.col-md-6.col-xs-12(flat @click='back')
        i.fa.fa-arrow-left
        span.q-ml-md назад

      q-btn.q-mt-lg.q-mb-lg(color='primary', label='Продолжить', :disabled='!agreeWithAll' @click='registratorStore.next()')
</template>
<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useCreateUser } from 'src/features/User/CreateUser'
import { FailAlert } from 'src/shared/api';
import { Loader } from 'src/shared/ui/Loader';
import { ReadAgreementDialog } from 'src/features/Agreementer/ReadAgreementDialog';

import { useRegistratorStore } from 'src/entities/Registrator'
import { useRegistrationStore } from 'src/entities/Registration'
import { useSystemStore } from 'src/entities/System/model'

const registratorStore = useRegistratorStore()
const registrationStore = useRegistrationStore()
const systemStore = useSystemStore()

const { generateStatementWithoutSignature, generateAllRegistrationDocuments } = useCreateUser()

// Проверка всех галочек (включая динамические соглашения + устав)
const agreeWithAll = computed(() => {
  return (
    registrationStore.allAgreementsAccepted &&
    registratorStore.state.agreements.ustav
  )
})

const html = ref()
const isLoading = ref(false)
const loadingText = ref('Загружаем документы...')
const statementDiv = ref<any>()

const loadDocuments = async (): Promise<void> => {
  try {
    isLoading.value = true
    loadingText.value = 'Генерируем документы для подписи...'

    // Генерируем все документы регистрации с бэкенда (они уже содержат HTML для отображения)
    await generateAllRegistrationDocuments()

    loadingText.value = 'Заполняем заявление...'

    // Генерируем заявление для просмотра
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
  if (registratorStore.isBranched)
      registratorStore.goTo('SelectBranch')
    else
      registratorStore.goTo('GenerateAccount')
}

onMounted(() => {
  if (registratorStore.state.step === registratorStore.steps.ReadStatement) {
    loadDocuments()
  }
})

watch(() => registratorStore.state.step, (value: number) => {
  if (value === registratorStore.steps.ReadStatement) {
    loadDocuments()
  }
})

const statuteLink = computed(() => {
  return systemStore.info.vars?.statute_link || ''
})

const hasStatuteLink = computed(() => {
  return statuteLink.value && statuteLink.value.trim() !== ''
})
</script>
