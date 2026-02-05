<template lang="pug">
q-btn(
  color='primary',
  @click='showDialog = true',
  :loading='loading',
  icon='add',
  label='Добавить'
)
  q-dialog(v-model='showDialog', @hide='clear')
    ModalBase(:title='"Импорт участника"')
      Form.q-pa-md(
        :handler-submit='handleImportContributor',
        :is-submitting='isSubmitting',
        :button-submit-txt='"Импортировать"',
        :button-cancel-txt='"Отмена"',
        @cancel='clear'
        style="width: 600px; max-width: 100% !important;"
      )
        q-input(
          v-model='formData.username'
          label='Имя пользователя'
          :rules='[(val) => !!val || "Имя пользователя обязательно"]'
          outlined
        )

        q-input(
          v-model='formData.contribution_amount'
          label='Сумма вклада'
          :rules='[(val) => !!val || "Сумма вклада обязательна"]'
          outlined
        )
          template(#append)
            span.text-grey-7 RUB

        q-input(
          v-model='formData.contributor_contract_number'
          label='Номер договора'
          :rules='[(val) => !!val || "Номер договора обязателен"]'
          outlined
        )

        q-input(
          v-model='formData.contributor_contract_created_at'
          label='Дата договора (ДД.ММ.ГГГГ)'
          :rules='[(val) => !!val || "Дата договора обязательна"]'
          outlined
        )

        q-input(
          v-model='formData.memo'
          label='Примечание'
          outlined
        )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useImportContributor } from '../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { Form } from 'src/shared/ui/Form';
import { useSystemStore } from 'src/entities/System/model';

const { importContributor } = useImportContributor();
const { info } = useSystemStore();

const showDialog = ref(false);
const isSubmitting = ref(false);
const loading = ref(false);

const formData = ref({
  username: '',
  contribution_amount: '',
  contributor_contract_number: '',
  contributor_contract_created_at: '',
  memo: '',
});

const clear = () => {
  showDialog.value = false;
  formData.value = {
    username: '',
    contribution_amount: '',
    contributor_contract_number: '',
    contributor_contract_created_at: '',
    memo: '',
  };
};

const handleImportContributor = async () => {
  isSubmitting.value = true;
  try {
    const data = {
      coopname: info.coopname,
      username: formData.value.username,
      contribution_amount: formData.value.contribution_amount,
      contributor_contract_number: formData.value.contributor_contract_number,
      contributor_contract_created_at: formData.value.contributor_contract_created_at,
      memo: formData.value.memo || undefined,
    };

    await importContributor(data);
    SuccessAlert('Участник успешно импортирован');
    clear();
  } catch (error) {
    FailAlert(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
