<template lang="pug">
div
  q-step(
    :name='registratorStore.steps.SelectProgram',
    title='Выберите программу участия',
    :done='registratorStore.isStepDone("SelectProgram")'
  )
    div(v-if='isLoading').full-width.text-center.q-mt-lg.q-mb-lg
      Loader(text='Загружаем доступные программы...')

    div(v-else-if='programs.length > 0')
      p.text-body1.q-mb-md Выберите программу, в которой вы хотите участвовать:

      q-list.q-mt-md(separator)
        q-item(
          v-for='program in programs',
          :key='program.key',
          clickable,
          v-ripple,
          :active='registratorStore.state.selectedProgramKey === program.key',

          @click='selectProgram(program.key)'
        )
          q-item-section
            q-item-label.text-h6 {{ program.title }}
            q-item-label(caption).q-mt-sm.text-body2 {{ program.description }}
            q-item-label(v-if='program.requirements', caption).q-mt-xs.text-weight-medium.text-primary
              | {{ program.requirements }}
          q-item-section(side, top)
            q-radio(
              :model-value='registratorStore.state.selectedProgramKey',
              :val='program.key',
              @update:model-value='selectProgram(program.key)',
              color='primary'
            )

    div(v-else).text-center.q-mt-lg
      p.text-body1 Доступных программ не найдено

    div.q-mt-lg
      q-btn.col-md-6.col-xs-12(flat, @click='registratorStore.prev()')
        i.fa.fa-arrow-left
        span.q-ml-md назад

      q-btn.q-mt-lg.q-mb-lg(
        color='primary',
        label='Продолжить',
        :disabled='!registratorStore.state.selectedProgramKey',
        @click='registratorStore.next()'
      )
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRegistratorStore } from 'src/entities/Registrator';
import { useSystemStore } from 'src/entities/System/model';
import { Loader } from 'src/shared/ui/Loader';
import { FailAlert } from 'src/shared/api';
import { client } from 'src/shared/api/client';
import { Queries } from '@coopenomics/sdk';

const registratorStore = useRegistratorStore();
const systemStore = useSystemStore();

const isLoading = ref(false);
const isLoadingPrograms = ref(false);
const programs = ref<any[]>([]);

const loadPrograms = async () => {
  // Защита от повторных вызовов
  if (isLoadingPrograms.value) {
    return;
  }

  try {
    isLoadingPrograms.value = true;
    isLoading.value = true;

    const accountType = registratorStore.state.userData.type;
    if (!accountType) {
      console.error('Account type not selected');
      return;
    }

    const { [Queries.System.GetRegistrationConfig.name]: config } = await client.Query(
      Queries.System.GetRegistrationConfig.query,
      {
        variables: {
          coopname: systemStore.info.coopname,
          account_type: accountType,
        },
      }
    );

    programs.value = config.programs || [];

    // Если программа только одна - автоматически выбираем её и переходим дальше
    if (programs.value.length === 1) {
      registratorStore.state.selectedProgramKey = programs.value[0].key;
      registratorStore.next();
    } else if (programs.value.length === 0) {
      // Если программ нет - просто переходим дальше
      registratorStore.next();
    }
  } catch (e: any) {
    console.error('Error loading programs:', e);
    FailAlert(e);
    // В случае ошибки все равно переходим дальше
    registratorStore.next();
  } finally {
    isLoading.value = false;
    isLoadingPrograms.value = false;
  }
};

const selectProgram = (key: string) => {
  registratorStore.state.selectedProgramKey = key;
};

// Используем только watch с immediate: true вместо onMounted + watch
watch(() => registratorStore.state.step, (value: number) => {
  if (value === registratorStore.steps.SelectProgram) {
    loadPrograms();
  }
}, { immediate: true });
</script>
