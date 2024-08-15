<template lang="pug">
div(v-if="step")
  q-step(
    :name="2"
    title="Заполните форму заявления на вступление"
    :done="step > 2"
  )

    UserDataForm
      template(#bottom="{userDataForm}")
        q-checkbox(v-model='store.agreements.condidential' full-width filled).q-mt-lg
          | Я даю своё согласие на обработку своих персональных данных в соответствии с
          a(@click.stop='(event) => event.stopPropagation()' href='/documents/regulation_on_the_procedure_and_rules_for_using_a_simple_electronic_signature.pdf' target='_blank').q-ml-xs Политикой Конфиденциальности

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
import { ref, computed } from 'vue'
import type { IUserData } from 'src/entities/User';
import { UserDataForm } from 'src/entities/Registrator/ui/UserDataForm';

import { useRegistratorStore } from 'src/entities/Registrator'
const store = useRegistratorStore().state


const userData = ref<IUserData>(store.userData)

const step = computed(() => store.step)

const setData = (userDataForm: any) => {
  userDataForm.validate().then(async (success: boolean) => {
    if (success) {
      store.userData = userData.value
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
