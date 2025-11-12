<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { IStepProps } from '../model/types'
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader'
import { Loader } from 'src/shared/ui/Loader'
import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement'
import { useAddCooperative } from 'src/features/Union/AddCooperative/model'
import { useSessionStore } from 'src/entities/Session'

const props = withDefaults(defineProps<IStepProps & {
  html?: string
}>(), {})

const connectionAgreement = useConnectionAgreementStore()

const isActive = computed(() => props.isActive)
const isDone = computed(() => props.isDone)

const handleSign = async () => {
  try {
    console.log('📝 AgreementStep: Подписываем документ')
    await connectionAgreement.signDocument()

    console.log('🔗 AgreementStep: Отправляем транзакцию registerCooperative в блокчейн')
    const { addCooperative } = useAddCooperative()
    const session = useSessionStore()

    // Формируем данные для registerCooperative действия
    const registerData = {
      coopname: session.username,
      params: {
        is_cooperative: true,
        coop_type: 'conscoop',
        announce: connectionAgreement.formData.announce,
        description: '',
        initial: connectionAgreement.formData.initial,
        minimum: connectionAgreement.formData.minimum,
        org_initial: connectionAgreement.formData.org_initial,
        org_minimum: connectionAgreement.formData.org_minimum
      },
      username: session.username,
      document: connectionAgreement.signedDocument
    }

    // Отправляем данные формы в блокчейн
    await addCooperative(registerData)

    console.log('✅ AgreementStep: Транзакция успешно отправлена')

    // Обновляем информацию о кооперативе из блокчейна
    console.log('🔄 AgreementStep: Обновляем информацию о кооперативе')
    await connectionAgreement.reloadCooperative()

    // Обновляем информацию об инстансе
    console.log('🔄 AgreementStep: Обновляем информацию об инстансе')
    await connectionAgreement.loadCurrentInstance()

    console.log('✅ AgreementStep: Информация обновлена')

    // Переходим к следующему шагу после подписания и отправки в блокчейн
    if (connectionAgreement.currentStep < 5) {
      connectionAgreement.setCurrentStep(connectionAgreement.currentStep + 1)
    }
  } catch (error) {
    console.error('❌ Ошибка при подписании или отправке в блокчейн:', error)
    throw error
  }
}

const handleBack = () => {
  // Специальная логика для возврата - очищаем подписанный документ
  console.log(`⬅️ AgreementStep: Возврат с шага ${connectionAgreement.currentStep}`)

  // Очищаем подписанный документ без генерации нового
  connectionAgreement.setSignedDocument(null)

  if (connectionAgreement.currentStep > 1) {
    connectionAgreement.setCurrentStep(connectionAgreement.currentStep - 1)
  }
}
</script>

<template lang="pug">
q-step(
  :name="3"
  title="Соглашение о подключении"
  icon="description"
  :done="isDone"
)
  .q-pa-md
    template(v-if="html")
      DocumentHtmlReader(:html="html")
    template(v-else)
      Loader(:text='`Готовим соглашение...`')

  q-stepper-navigation.q-gutter-sm(v-if="html")
    q-btn(
      v-if="isActive"
      color="grey-6"
      flat
      label="Назад"
      @click="handleBack"
    )
    q-btn(
      v-if="isActive"
      color="primary"
      label="Подписать"
      @click="handleSign"
    )
</template>
