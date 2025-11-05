<template lang="pug">
div
  q-step(
    :name='store.steps.SetUserData',
    title='Заполните форму заявления на вступление',
    :done='store.isStepDone("SetUserData")'
  )
    UserDataForm(
      v-model:userData='store.state.userData',
      @type-selected='onTypeSelected',
      @type-cleared='onTypeCleared'
    )
      template(#bottom='{ userDataForm }')
        q-checkbox.q-mt-lg(
          v-if='isAccountTypeSelected',
          v-model='store.state.agreements.condidential',
          full-width,
          standout='bg-teal text-white'
        )
          | Я даю своё согласие на обработку своих персональных данных в соответствии с
          StaticPrivacyDialog(
            v-model:agree='store.state.agreements.condidential',
            text='политикой конфиденциальности'
          )

        q-btn(flat, @click='store.prev()')
          i.fa.fa-arrow-left
          span.q-ml-md назад

        q-btn.q-mt-lg.q-mb-lg(
          :disabled='!store.state.agreements.condidential',
          color='primary',
          label='Продолжить',
          @click='setData(userDataForm)'
        )
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { UserDataForm } from 'src/shared/ui/UserDataForm/UserDataForm';
import { useRegistratorStore } from 'src/entities/Registrator';
import { StaticPrivacyDialog } from 'src/features/Agreementer/StaticPrivacyDialog';

const store = useRegistratorStore();

// Отслеживание выбран ли тип аккаунта
const isAccountTypeSelected = ref<boolean>(
  !!store.state.userData.type &&
    store.state.userData.type !== null &&
    store.state.userData.type !== undefined,
);

// Обработчики событий от UserDataForm
const onTypeSelected = () =>
  // type: 'individual' | 'entrepreneur' | 'organization',
  {
    isAccountTypeSelected.value = true;
    // Можно использовать type для дополнительной логики в будущем
    // const selectedType = type;
  };

const onTypeCleared = () => {
  isAccountTypeSelected.value = false;
  // Сбрасываем чекбокс согласия при сбросе типа
  store.state.agreements.condidential = false;
};

const setData = (userDataForm: any) => {
  userDataForm.validate().then(async (success: boolean) => {
    if (success) {
      store.next();
    } else {
      const firstInvalid = document.querySelector(
        '.q-field--error .q-field__native',
      );
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
  });
};
</script>
<style>
.dataInput .q-btn-selected {
  color: teal;
}
</style>
