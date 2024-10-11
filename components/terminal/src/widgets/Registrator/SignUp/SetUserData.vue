<template lang="pug">
div(v-if="step")
  q-step(
    :name="2"
    title="Заполните форму заявления на вступление"
    :done="step > 2"
  )

    UserDataForm(v-model:userData="store.userData")
      template(#bottom="{userDataForm}")
        q-checkbox(v-model='store.agreements.condidential' full-width standout="bg-teal text-white").q-mt-lg
          | Я даю своё согласие на обработку своих персональных данных в соответствии с
          ReadAgreementDialog(v-if="privacyAgreement" :agreement="privacyAgreement" v-model:agree="store.agreements.condidential" text="политикой конфиденциальности")
            AgreementReader(:agreement="privacyAgreement").q-mb-lg

        q-btn(flat, @click="store.step--")
          i.fa.fa-arrow-left
          span.q-ml-md назад

        q-btn(
          :disabled="!store.agreements.condidential"
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

const store = useRegistratorStore().state

const step = computed(() => store.step)
const agreementer = useAgreementStore()

const privacyAgreement = computed(() => {
  return agreementer.cooperativeAgreements.find(el => el.type == 'privacy')
})

const setData = (userDataForm: any) => {
  userDataForm.validate().then(async (success: boolean) => {
    if (success) {
      store.step = store.step + 1
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
