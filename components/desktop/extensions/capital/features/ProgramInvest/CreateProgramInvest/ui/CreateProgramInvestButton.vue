<template lang="pug">
q-btn(
  color='primary'
  outline
  class='q-mt-sm full-width'
  :loading='isGenerating'
  @click='showDialog = true'
  label='Инвестировать'
)
  q-dialog(v-model='showDialog', @hide='clear')
    ModalBase(:title='"Инвестирование в программу"')
      Form.q-pa-sm(
        :handler-submit='handleInvest',
        :is-submitting='isGenerating',
        :button-cancel-txt='"Отменить"',
        :button-submit-txt='"Инвестировать"',
        @cancel='clear'
      )
        q-input(
          v-model='quantity',
          standout='bg-teal text-white',
          placeholder='Введите сумму',
          type='number',
          :min='0',
          :rules='[(val) => val > 0 || "Сумма должна быть положительной"]'
        )
          template(#append)
            span.text-overline {{ currency }}
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Form } from 'src/shared/ui/Form';
import { ModalBase } from 'src/shared/ui/ModalBase';
import { useCreateProgramInvest } from '../model';
import { FailAlert, SuccessAlert } from 'src/shared/api/alerts';
import { useSystemStore } from 'src/entities/System/model';

const { createProgramInvestWithGeneratedStatement, isGenerating } =
  useCreateProgramInvest();
const system = useSystemStore();

const quantity = ref<number | string>();
const showDialog = ref(false);

const currency = computed(
  () => system.info?.symbols?.root_govern_symbol ?? 'GOV',
);

const clear = (): void => {
  showDialog.value = false;
  quantity.value = '';
};

const handleInvest = async (): Promise<void> => {
  try {
    await createProgramInvestWithGeneratedStatement(quantity.value!.toString());
    SuccessAlert('Заявление на инвестицию отправлено председателю на утверждение');
    clear();
  } catch (e: unknown) {
    FailAlert(e);
  }
};
</script>
