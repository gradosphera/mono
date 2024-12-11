<template lang="pug">
div
  q-step(
    :name="store.steps.SetUserData"
    title="Заполните форму заявления на вступление"
    :done="store.isStepDone('SetUserData')"
  )
    UserDataForm(v-model:userData="store.state.userData")
      template(#bottom="{userDataForm}")
        q-checkbox(v-model='store.state.agreements.condidential' full-width standout="bg-teal text-white").q-mt-lg
          | Я даю своё согласие на обработку своих персональных данных в соответствии с
          ReadAgreementDialog(v-if="privacyAgreement" :agreement="privacyAgreement" v-model:agree="store.state.agreements.condidential" text="политикой конфиденциальности")
            AgreementReader(:agreement="privacyAgreement").q-mb-lg

        q-btn(flat, @click="store.prev()")
          i.fa.fa-arrow-left
          span.q-ml-md назад

        q-btn(
          :disabled="!store.state.agreements.condidential"
          color="primary"
          label="Продолжить"
          @click="setData(userDataForm)"
        ).q-mt-lg.q-mb-lg

</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { UserDataForm } from 'src/shared/ui/UserDataForm/UserDataForm';
import { useRegistratorStore } from 'src/entities/Registrator'
import { useAgreementStore } from 'src/entities/Agreement';
import { ReadAgreementDialog } from 'src/features/Agreementer/ReadAgreementDialog';
import { AgreementReader } from 'src/features/Agreementer/GenerateAgreement';

const store = useRegistratorStore()

const agreementer = useAgreementStore()

const privacyAgreement = computed(() => {
  return agreementer.cooperativeAgreements.find(el => el.type == 'privacy')
})

const setData = (userDataForm: any) => {
  userDataForm.validate().then(async (success: boolean) => {
    if (success) {
      store.next()
    } else {
      const firstInvalid = document.querySelector('.q-field--error .q-field__native');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return
    }
  })
}


</script>
<style>
.dataInput .q-btn-selected {
  color: teal;
}
</style>
