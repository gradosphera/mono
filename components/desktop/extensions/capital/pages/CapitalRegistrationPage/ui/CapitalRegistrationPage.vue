<template lang="pug">
.q-pa-md
  q-card(flat).q-pa-lg
    // Шапка страницы
    .text-h5.q-mb-md Регистрация в системе капитализации

    // Степер для всего процесса регистрации
    q-stepper(
      v-model="currentStep"
      vertical
      animated
      flat
      done-color="primary"
    )
      // Шаг 1: Выбор ролей
      q-step(
        :name="steps.roles"
        title="Выбор ролей участия"
        :active="currentStep === steps.roles"
        :done="isStepDone(steps.roles)"
      )
        .q-mb-md
          .text-body2.q-mb-md
            | В кооперативе вы можете принимать участие в разных ролях. Выберите те, которые вам интересны:
          q-option-group(
            v-model="selectedRoles"
            :options="roleOptions"
            type="checkbox"
            color="primary"
          )
        q-stepper-navigation
          q-btn(
            color="primary"
            label="Далее"
            :disable="selectedRoles.length === 0"
            @click="nextStep"
          )

      // Шаг 2: Дополнительные поля для Создателя
      q-step(
        v-if="isCreatorRoleSelected"
        :name="steps.creatorDetails"
        title="Условия для роли Создателя"
        :active="currentStep === steps.creatorDetails"
        :done="isStepDone(steps.creatorDetails)"
      )
        .q-mb-md
          .text-body2.q-mb-md
            | Сколько времени в день вы готовы тратить на действия по созданию результатов?
          .row.q-gutter-sm
            q-btn(
              v-for="hour in [1, 2, 3, 4, 5, 6, 7, 8]"
              :key="hour"
              :value="hour"
              :color="hoursPerDay === hour ? 'primary' : undefined"
              :label="`${hour} час${getHourSuffix(hour)}`"
              no-caps
              @click="hoursPerDay = hour"
              col-3
            )
          .q-mb-lg

          .text-body2.q-mb-md
            | Во сколько вы оцениваете своё время за час?
          q-input(
            v-model="ratePerHour"
            type="number"
            label="Во сколько вы оцениваете своё время за час?"
            outlined
            step="100"
            min="0"
            :rules="[val => val >= 0 || 'Ставка должна быть не отрицательной', val => val <= 3000 || 'Слишком много для нас. 3000 - максимум']"
            required
            style="max-width: 450px;"

          )
            template(#append)
              .text-body2 {{ governSymbol }}
        q-stepper-navigation
          q-btn(
            flat
            label="Назад"
            @click="prevStep"
          )
          q-btn(
            color="primary"
            label="Далее"
            :disable="!hoursPerDay || !ratePerHour"
            @click="nextStep"
          )

      // Шаг 3: О себе
      q-step(
        :name="steps.about"
        title="Информация о себе"
        :active="currentStep === steps.about"
        :done="isStepDone(steps.about)"
      )
        .q-mb-md
          .text-body2.q-mb-md
            | Расскажите немного о себе, вашем опыте и том, как вы планируете участвовать в проектах:
          q-input(
            v-model="about"
            type="textarea"
            label="О себе"
            outlined
            rows="4"
          )
        q-stepper-navigation
          q-btn(
            flat
            label="Назад"
            @click="prevStep"
          )
          q-btn(
            color="primary"
            label="Далее"
            @click="nextStep"
          )

      // Шаг 4: Подписание договора участия
      q-step(
        :name="steps.document"
        title="Подписание договора участия"
        :active="currentStep === steps.document"
        :done="isStepDone(steps.document)"
      )
        .text-body2.q-mb-lg
          | Для участия в системе роста благосостояния необходимо подписать договор участия.
        // Загрузка документа
        template(v-if='isGenerating')
          .q-mb-md
            .text-center
              q-spinner(color='primary' size='3em')
              .q-mt-md.text-body2 Генерация договора...
        // Показ документа для подписания
        template(v-else-if='generatedDocument')
          .q-mb-md
            .text-subtitle1.q-mb-sm Ознакомьтесь с договором участия и подпишите его:
            .q-pa-md.border.rounded-borders
              DocumentHtmlReader(:html='generatedDocument.html')
        // Ошибка генерации
        template(v-else-if='generationError')
          .q-mb-md
            .text-center.text-negative.q-mb-md
              | Ошибка при генерации договора.
            .text-center
              q-btn(
                color='primary'
                label='Повторить генерацию'
                :loading='isGenerating'
                @click='regenerateDocument'
              )
        q-stepper-navigation
          q-btn(
            flat
            label="Назад"
            @click="prevStep"
          )
          q-btn(
            v-if='generatedDocument'
            color='primary'
            label='Подписать'
            :loading='isGenerating'
            @click='signAndRegister'
          )

      // Шаг 5: Соглашение с программой капитализации
      q-step(
        :name="steps.capitalAgreement"
        title="Соглашение с программой капитализации"
        :active="currentStep === steps.capitalAgreement"
        :done="isStepDone(steps.capitalAgreement)"
      )
        .text-body2.q-mb-lg
          | Для участия в программе капитализации необходимо согласиться с условиями целевой потребительской программы.
          br
          | Программа определяет правила накопления и использования капитала.
        // Загрузка соглашения
        template(v-if='isGeneratingAgreement')
          .q-mb-md
            .text-center
              q-spinner(color='primary' size='3em')
              .q-mt-md.text-body2 Генерация соглашения...
        // Показ соглашения для подписания
        template(v-else-if='generatedAgreement')
          .q-mb-md
            .text-subtitle1.q-mb-sm Ознакомьтесь с условиями программы капитализации и подпишите соглашение:
            .q-pa-md.border.rounded-borders
              DocumentHtmlReader(:html='generatedAgreement.html')
          .q-mb-md
            q-btn(
              color='primary'
              label='Подписать соглашение'
              :loading='isSigning'
              @click='signAgreement'
            )
        // Ошибка генерации соглашения
        template(v-else-if='agreementGenerationError')
          .q-mb-md
            .text-center.text-negative.q-mb-md
              | Ошибка при генерации соглашения.
            .text-center
              q-btn(
                color='primary'
                label='Повторить генерацию'
                :loading='isGeneratingAgreement'
                @click='regenerateCapitalAgreement'
              )

      // Шаг 6: Завершение
      q-step(
        :name="steps.completed"
        title="Регистрация завершена"
        :active="currentStep === steps.completed"
        :done="isStepDone(steps.completed)"
      )
        .q-mt-md
          .text-h6.q-mb-md Поздравляем!
          .text-body1.q-mb-md
            | Вы успешно зарегистрировались в системе капитализации.
            br
            | Теперь вы можете пользоваться всеми возможностями платформы.
          q-btn(
            color="primary"
            label="Перейти в кошелек"
            @click="goToWallet"
          )
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch, unref } from 'vue';
import { useRouter } from 'vue-router';
import { useRegisterContributor } from 'app/extensions/capital/features/Contributor/RegisterContributor/model';
import { useSignCapitalProgramAgreement } from 'app/extensions/capital/features/Agreement/SignCapitalProgramAgreement/model';
import { useContributorStore } from 'app/extensions/capital/entities/Contributor/model';
import { DocumentHtmlReader } from 'src/shared/ui/DocumentHtmlReader';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import { useSystemStore } from 'src/entities/System/model';

const router = useRouter();
const contributorStore = useContributorStore();
const system = useSystemStore();

// Шаги регистрации
const steps = {
  roles: 'roles',
  creatorDetails: 'creator-details',
  about: 'about',
  document: 'document',
  capitalAgreement: 'capital-agreement',
  completed: 'completed'
};

const currentStep = ref(steps.roles);

// Роли
const roleOptions = [
  { label: 'Мастер - управляет процессом создания результатов интеллектуальной деятельности', value: 'master' },
  { label: 'Автор - предлагает идеи результатов интеллектуальной деятельности', value: 'noble' },
  { label: 'Создатель - создает результаты интеллектуальной деятельности своими руками и головой', value: 'benefactor' },
  { label: 'Инвестор - вкладывает деньги в результаты', value: 'philanthropist' },
  { label: 'Координатор - распространяет информацию и привлекает финансирование в результаты', value: 'herald' }
];

// Вычисляемые свойства
const governSymbol = computed(() => system.info.symbols.root_govern_symbol);
const governPrecision = computed(() => system.info.symbols.root_govern_precision);
const isCreatorRoleSelected = computed(() => selectedRoles.value.includes('benefactor'));

// Бизнес-логика
const {
  registerContributorWithGeneratedDocument,
  generateDocument,
  regenerateDocument,
  isGenerating,
  generatedDocument,
  generationError
} = useRegisterContributor();

const {
  generateAgreement,
  regenerateAgreement,
  signAndSendAgreementWithGeneratedDocument,
  isGenerating: isGeneratingAgreement,
  generatedDocument: generatedAgreement,
  generationError: agreementGenerationError,
  isSigning
} = useSignCapitalProgramAgreement();

// Переименовываем для ясности
const regenerateCapitalAgreement = regenerateAgreement;

// Поля формы для регистрации участия
const selectedRoles = ref<string[]>([]);
const hoursPerDay = ref<number | ''>('');
const ratePerHour = ref<number | ''>('');
const about = ref('');

// Функция для правильного склонения слова "час"
const getHourSuffix = (hour: number): string => {
  if (hour === 1) return '';
  if (hour >= 5) return 'ов';
  return 'а';
};

// Форматированная ставка с символом для отправки на бэкенд
const formattedRatePerHour = computed(() => {
  const rateValue = unref(ratePerHour);
  const symbolValue = unref(governSymbol);

  if (rateValue === '' || !symbolValue) return '';

  const numericValue = typeof rateValue === 'number' ? rateValue : parseFloat(String(rateValue));
  if (isNaN(numericValue)) return '';

  return `${numericValue.toFixed(governPrecision.value)} ${symbolValue}`;
});

// Вычисляемые свойства для проверки завершения шагов (теперь из contributorStore)

// Получение последовательности всех шагов
const getStepSequence = () => {
  const baseSteps = [steps.roles, steps.about, steps.document, steps.capitalAgreement, steps.completed];
  if (isCreatorRoleSelected.value) {
    return [steps.roles, steps.creatorDetails, steps.about, steps.document, steps.capitalAgreement, steps.completed];
  }
  return baseSteps;
};

// Проверка завершенности шага
const isStepDone = (stepName: string) => {
  const sequence = getStepSequence();
  const currentIndex = sequence.indexOf(currentStep.value);
  const targetIndex = sequence.indexOf(stepName);
  return targetIndex < currentIndex;
};

// Навигация по шагам
const nextStep = () => {
  const sequence = getStepSequence();
  const currentIndex = sequence.indexOf(currentStep.value);
  if (currentIndex < sequence.length - 1) {
    currentStep.value = sequence[currentIndex + 1];
  }
};

const prevStep = () => {
  const sequence = getStepSequence();
  const currentIndex = sequence.indexOf(currentStep.value);
  if (currentIndex > 0) {
    currentStep.value = sequence[currentIndex - 1];
  }
};

// Обновление текущего шага на основе состояния регистрации
const updateCurrentStep = () => {
  if (!contributorStore.isGenerationAgreementCompleted) {
    // Если регистрация участия не завершена, начинаем с выбора ролей
    currentStep.value = steps.roles;
  } else if (!contributorStore.isCapitalAgreementCompleted) {
    // Если регистрация завершена, но нет соглашения с программой
    currentStep.value = steps.capitalAgreement;
  } else {
    // Все завершено
    currentStep.value = steps.completed;
  }
};

// Следим только за изменениями статуса регистрации
watch(() => contributorStore.isGenerationAgreementCompleted, updateCurrentStep);
watch(() => contributorStore.isCapitalAgreementCompleted, updateCurrentStep);

// Инициализация при монтировании
onMounted(() => {
  console.log('🎯 CapitalRegistrationPage mounted');
  updateCurrentStep();
  // Генерация документа участия при монтировании
  generateDocument()
    .then(() => {
      // Генерация успешна
    })
    .catch((error) => {
      console.error('Ошибка при генерации договора:', error);
      generationError.value = true;
      FailAlert('Не удалось сгенерировать договор участия');
    });

  // Генерация соглашения о программе капитализации при монтировании
  generateAgreement()
    .then((document) => {
      console.log('✅ Соглашение сгенерировано, hash:', document?.hash);
      // Генерация успешна
    })
    .catch((error) => {
      console.error('❌ Ошибка при генерации соглашения:', error);
      agreementGenerationError.value = true;
      FailAlert('Не удалось сгенерировать соглашение о программе');
    });
});

// Отслеживание размонтирования
onUnmounted(() => {
  console.log('💥 CapitalRegistrationPage unmounted');
});

// Подпись и регистрация с сгенерированным документом
const signAndRegister = async () => {
  try {
    if (!generatedDocument.value) {
      throw new Error('Документ не сгенерирован');
    }

    // Определяем параметры для регистрации
    const finalHoursPerDay = isCreatorRoleSelected.value ? (hoursPerDay.value as number) : undefined;
    const finalRatePerHour = isCreatorRoleSelected.value ? formattedRatePerHour.value : undefined;

    await registerContributorWithGeneratedDocument(generatedDocument.value, about.value, finalHoursPerDay, finalRatePerHour);
    SuccessAlert('Договор участия успешно подписан и отправлен');

    // После успешной регистрации обновление статуса произойдет автоматически через реактивность
  } catch (error) {
    console.error('Ошибка при подписании документа:', error);
    FailAlert(error);
  }
};

// Подписание соглашения о целевой потребительской программе
const signAgreement = async () => {
  try {
    if (!generatedAgreement.value) {
      throw new Error('Соглашение не сгенерировано');
    }

    console.log('📝 Подписываем соглашение, hash:', generatedAgreement.value.hash);
    await signAndSendAgreementWithGeneratedDocument(generatedAgreement.value);
    SuccessAlert('Соглашение о целевой потребительской программе успешно подписано');

    // После успешного подписания обновление статуса и переход произойдут автоматически через реактивность
  } catch (error) {
    console.error('❌ Ошибка при подписании соглашения:', error);
    FailAlert(error);
  }
};

// Переход в кошелек
const goToWallet = () => {
  router.push({ name: 'capital-wallet' });
};
</script>
