<template lang="pug">
div.row.justify-center.q-pa-md
  div.col-md-8.col-sm-10.col-xs-12
    .installation-container
      q-card(flat).installation-card
        div(v-if="!installStore.is_finish")
          .installation-header
            .text-h5.installation-title Установка Цифрового Кооператива
            .subtitle.text-body2.text-grey-7.q-mt-sm
              | шаг за шагом

          //- Индикатор шагов
          q-stepper.q-mt-lg(v-model="installStore.current_step" vertical flat)
            q-step(:name="'key'" title="Введите ключ установки" icon="key" :done="isStepDone('key')")
              .step-content.q-pa-md
                .step-description.text-body2.q-mb-md
                  | Для начала введите ключ, который был выдан Вам при регистрации в качестве пайщика:
                RequestKeyForm

            q-step(:name="'init'" title="Инициализация системы" icon="business" :done="isStepDone('init')")
              .step-content.q-pa-md
                SetInitForm

            q-step(:name="'soviet'" title="Члены совета" icon="people" :done="isStepDone('soviet')")
              .step-content.q-pa-md
                .step-description.text-body2.q-mb-md
                  | Введите данные председателя и членов совета. Всем им будут созданы аккаунты пайщиков и отправлены приглашения на электронную почту:
                SetSovietForm

            q-step(:name="'vars'" title="Переменные документов" icon="settings" :done="isStepDone('vars')")
              .step-content.q-pa-md
                .step-description.text-body2.q-mb-md
                  | Установите переменные для документов кооператива, которые будут использоваться при генерации документов:
                SetVariablesForm

        div(v-else)
          .completion-section.q-pa-xl
            .completion-header
              q-icon(name="check_circle" color="positive" size="64px")
              .completion-title.text-h5.text-positive.q-mt-md Установка завершена
              .completion-subtitle.text-body2.text-grey-7.q-mt-sm
                | Ваш Цифровой Кооператив готов к работе

            .completion-details.q-mt-xl
              .detail-text.text-body2.q-mb-lg
                | Всем членам совета отправлены приглашения на электронные почты со ссылками для получения цифровых подписей. Перейдите по своей ссылке из письма, получите ключ председателя, после чего, используйте его для входа в свою систему.

              //- q-btn(
              //-   @click="goToSignin"
              //-   color="primary"
              //-   label="Войти в систему"
              //-   size="lg"
              //-   unelevated
              //-   no-caps
              //- ).q-mt-md
          //- p.text-grey Ключ установки, который ранее вводился здесь, теперь используется только для входа в кабинет оператора, пайщиком которого вы стали при подключении к системе. В вашей же системе у вас новый ключ, который вы выпускаете себе сами.
</template>

<script setup lang="ts">
import { useInstallCooperativeStore } from 'src/entities/Installer/model';
import { RequestKeyForm, SetInitForm, SetSovietForm, SetVariablesForm } from 'src/features/Installer';
import { computed } from 'vue';
// import { useRouter } from 'vue-router';
// import { useSystemStore } from 'src/entities/System/model';

// const router = useRouter();
// const systemStore = useSystemStore();
const installStore = useInstallCooperativeStore()

const stepOrder = ['key', 'init', 'soviet', 'vars'] as const;

const isStepDone = computed(() => (step: typeof stepOrder[number]) => {
  const currentIndex = stepOrder.indexOf(installStore.current_step);
  const stepIndex = stepOrder.indexOf(step);
  return stepIndex < currentIndex;
});

// const goToSignin = () => {
//   router.push({
//     name: 'signin',
//     params: { coopname: systemStore.info.coopname }
//   });
// };
</script>

<style scoped>
.installation-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.installation-card {
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.installation-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--q-primary) 0%, var(--q-secondary) 50%, var(--q-accent) 100%);
  background-size: 200% 100%;
  animation: shimmer 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

/* Заголовок с градиентом */
.installation-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 2rem;
}

.installation-title {
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--q-primary) 0%, rgba(25, 118, 210, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

/* Содержимое шагов */
.step-content {
  background: rgba(25, 118, 210, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(25, 118, 210, 0.05);
  margin-top: 1rem;
}

.step-description {
  color: #666;
  line-height: 1.5;
}

/* Секция завершения */
.completion-section {
  text-align: center;
  position: relative;
}

.completion-header {
  position: relative;
  margin-bottom: 1rem;
}

.completion-title {
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--q-positive) 0%, #4CAF50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.completion-details {
  margin-top: 2rem;
}

.detail-text {
  color: #666;
  line-height: 1.6;
}

/* Адаптивность */
@media (max-width: 768px) {
  .installation-container {
    padding: 1rem;
  }

  .installation-card {
    border-radius: 16px;
  }

  .installation-header {
    padding-top: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .step-content {
    padding: 1rem;
  }

  .completion-section {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .installation-container {
    padding: 0.5rem;
  }

  .installation-card {
    border-radius: 12px;
  }

  .step-content {
    padding: 0.75rem;
  }

  .completion-section {
    padding: 1.5rem 0.75rem;
  }
}
</style>
