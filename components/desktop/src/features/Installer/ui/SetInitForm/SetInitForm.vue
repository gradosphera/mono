<template lang="pug">
div
  div(v-if="!loading && installationStatus")
    //- Если данные установлены сервером - показываем readonly
    div(v-if="installationStatus.init_by_server")
      q-card(flat).q-mb-md
        q-card-section
          div Вам предустановлены данные кооператива. Пожалуйста, проверьте их, и в случае обнаружения ошибок, обратитесь к вашему оператору для внесения изменений.

      CreateOrganizationDataForm(
        :data="installationStatus.organization_data || installStore.organization_data"
        readonly
        hideMatchButton
      )

      div.flex.justify-between.q-mt-md
        q-btn(@click="back" color="grey" label="Назад" icon="arrow_back")
        q-btn(@click="next" color="primary" label="Далее" icon="arrow_forward" :loading="saving")

    //- Если данных нет или они введены пользователем (не сервером) - показываем форму для ввода/редактирования
    div(v-else)
      q-card(flat).q-mb-md
        q-card-section
          div Заполните данные кооператива. Эти данные будут использоваться для организации документооборота с пайщиками.

      CreateOrganizationDataForm(
        :data="installStore.organization_data"
        @update:data="onOrganizationDataUpdate"
      )
        template(#top)
          q-input(
            ref="emailInput"
            autofocus
            v-model="organizationEmail"
            label="Email организации"
            type="email"
            standout="bg-teal text-white"
            :rules="[val => notEmpty(val)]"
            autocomplete="off"
          )

      div.flex.justify-between.q-mt-md
        q-btn(@click="back" color="grey" label="Назад" icon="arrow_back")
        q-btn(
          @click="saveAndNext"
          color="primary"
          label="Продолжить"
          icon="arrow_forward"
          :loading="saving"
          :disable="!isValidData"
        )

  div(v-else-if="loading")
    Loader(text="Загрузка данных...")

  div(v-else)
    div.text-center.q-pa-lg
      q-icon(name="error" size="50px" color="negative")
      div.text-h6.q-mt-md Ошибка загрузки данных
      q-btn(@click="loadData" color="primary" label="Повторить" icon="refresh")
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { useInstallCooperative } from '../../model';
import { CreateOrganizationDataForm, type ICreateOrganizationData } from 'src/shared/ui/UserDataForm/CreateOrganizationDataForm';
import Loader from 'src/shared/ui/Loader/Loader.vue';
import { FailAlert } from 'src/shared/api';
import { extractGraphQLErrorMessages } from 'src/shared/api/errors';
import { useSystemStore } from 'src/entities/System/model';
import { notEmpty } from 'src/shared/lib/utils';
import { Zeus } from '@coopenomics/sdk';

defineEmits<{
  next: []
}>();

const installStore = useInstallCooperativeStore();
const { getInstallationStatus, initSystem } = useInstallCooperative();
const systemStore = useSystemStore();

const loading = ref(false);
const saving = ref(false);
const installationStatus = ref<any>(null);
const emailInput = ref<any>();

// Функция для создания дефолтных данных организации
const createDefaultOrganizationData = (): ICreateOrganizationData => ({
    short_name: '',
    full_name: '',
    type: Zeus.OrganizationType.COOP,
    represented_by: {
      last_name: '',
      first_name: '',
      middle_name: '',
      based_on: '',
      position: '',
    },
    phone: '',
    email: '',
    country: 'Russia',
    city: '',
    full_address: '',
    fact_address: '',
    details: {
      inn: '',
      ogrn: '',
      kpp: '',
    },
    bank_account: {
      bank_name: '',
      details: {
        corr: '',
        bik: '',
        kpp: '',
      },
      account_number: '',
      currency: 'RUB',
    },
});


// Computed для безопасного доступа к email
const organizationEmail = computed({
  get: () => installStore.organization_data?.email || '',
  set: (value: string) => {
    if (installStore.organization_data) {
      installStore.organization_data.email = value;
    }
  }
});

const isValidData = computed(() => {
  const data = installStore.organization_data;
  return !!(
    data?.email &&
    data?.short_name &&
    data?.full_name &&
    data?.represented_by?.last_name &&
    data?.represented_by?.first_name &&
    data?.phone &&
    data?.city &&
    data?.full_address &&
    data?.fact_address &&
    data?.details?.inn &&
    data?.details?.ogrn &&
    data?.details?.kpp &&
    data?.bank_account?.bank_name &&
    data?.bank_account?.details?.corr &&
    data?.bank_account?.details?.bik &&
    data?.bank_account?.details?.kpp &&
    data?.bank_account?.account_number
  );
});

const loadData = async () => {
  if (!installStore.install_code) {
    FailAlert('Код установки не найден');
    installStore.current_step = 'key';
    return;
  }

  loading.value = true;
  try {
    installationStatus.value = await getInstallationStatus(installStore.install_code);
    // Всегда начинаем с шага init
    installStore.current_step = 'init';

    // Если данные организации уже установлены, загружаем их для просмотра в readonly
    if (installationStatus.value.organization_data) {
      // Исключаем поле username, которое не нужно для повторной инициализации
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { username, ...organizationData } = installationStatus.value.organization_data;

      // Преобразуем значение type в uppercase для соответствия GraphQL enum
      if (organizationData.type && typeof organizationData.type === 'string') {
        organizationData.type = organizationData.type.toUpperCase();
      }

      installStore.organization_data = organizationData;
    }
  } catch (error: any) {
    const errorMessage = extractGraphQLErrorMessages(error);
    // Если код истек или невалиден - возвращаемся на шаг ввода ключа
    if (errorMessage.includes('истекший') || errorMessage.includes('Неверный')) {
      FailAlert('Код установки истек или невалиден. Пожалуйста, введите ключ заново.');
      installStore.current_step = 'key';
      installStore.install_code = undefined;
    } else {
      FailAlert(error);
    }
  } finally {
    loading.value = false;
  }
};

const onOrganizationDataUpdate = (data: ICreateOrganizationData) => {
  installStore.organization_data = data;
};

const back = () => {
  installStore.current_step = 'key';
};

const next = () => {
  installStore.current_step = 'soviet';
};

const saveAndNext = async () => {
  saving.value = true;
  try {
    // Вызываем initSystem с данными организации
    await initSystem({
      organization_data: installStore.organization_data as any
    });

    // Обновляем информацию о системе
    await systemStore.loadSystemInfo();

    // После успешной инициализации данные остаются в store для возможности возврата назад
    // Не очищаем organization_data, чтобы пользователь мог видеть данные при возвращении

    next();
  } catch (error: any) {
    FailAlert(error.message || 'Ошибка инициализации');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  // Инициализируем данные организации в store, если их нет
  if (!installStore.organization_data) {
    installStore.organization_data = createDefaultOrganizationData();
  }

  loadData();
  await nextTick();
  if (emailInput.value) {
    emailInput.value.$el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});

watch(() => installStore.install_code, () => {
  if (installStore.install_code) {
    loadData();
  }
});

watch(() => installStore.current_step, (newStep) => {
  if (newStep === 'init' && installStore.install_code) {
    loadData();
  }
});
</script>
