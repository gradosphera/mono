<script setup lang="ts">
import { computed } from 'vue'
import type { IStepProps } from '../model/types'

import { useConnectionAgreementStore } from 'src/entities/ConnectionAgreement'
import { useSystemStore } from 'src/entities/System/model';

const props = withDefaults(defineProps<IStepProps>(), {})

const system = useSystemStore()
const connectionAgreement = useConnectionAgreementStore()

const isActive = computed(() => props.isActive)
const isDone = computed(() => props.isDone)

const unionLink = computed(() => system.info.union_link)

const handleContinue = () => {
  if (connectionAgreement.currentStep === 0) {
    connectionAgreement.setCurrentStep(1)
  }
}

const openUnionLink = () => {
  if (unionLink.value) {
    window.open(unionLink.value, '_blank')
  }
}
</script>

<template lang="pug">
q-step(
  :name="0"
  title="Членство в союзе"
  icon="group"
  :done="isDone"
)
  .union-membership-container.q-pa-md

    //- Основная информационная карточка
    .membership-info-card.q-mb-xl
      .card-header
        .text-h6.membership-title Членство в Союзе Потребительских Обществ
        .subtitle.text-body2.text-grey-7.q-mt-sm
          | Необходимый шаг для полноценной работы на платформе Кооперативной Экономики

      //- Что будет сделано
      .membership-benefits.q-mb-lg
        .benefit-section
          .section-title
            q-icon(name="check_circle" size="20px" color="positive").q-mr-sm
            span.text-subtitle1.text-weight-medium Ваш кооператив будет подключен к платформе

          .benefit-description.text-body2.text-grey-8.q-mt-sm.q-ml-lg
            | Согласно выбранному тарифу членских взносов ваш Цифровой Кооператив получит доступ ко всем сервисам платформы Кооперативной Экономики

        .benefit-section.q-mt-md
          .section-title
            q-icon(name="security" size="20px" color="primary").q-mr-sm
            span.text-subtitle1.text-weight-medium Документооборот в порядке

          .benefit-description.text-body2.text-grey-8.q-mt-sm.q-ml-lg
            | Членство в союзе обеспечивает юридическую чистоту всех операций и соответствие требованиям кооперативного законодательства

      //- Требование членства
      .membership-requirement.q-mt-lg
        .requirement-card
          .requirement-header
            q-icon(name="info" size="24px" color="warning").q-mr-sm
            .text-subtitle1.text-weight-medium Необходимость вступления в союз

          .requirement-description.text-body2.q-mt-sm
            | Для работы на платформе и обеспечения базового документооборота ваш кооператив должен быть членом Союза Потребительских Обществ. Это обязательное условие для всех участников Кооперативной Экономики.

          .union-link-section.q-mt-md
            .text-body2.q-mb-sm Для вступления в союз перейдите по официальной ссылке:
            q-btn.union-link-btn(
              v-if="unionLink"
              flat
              color="primary"
              :label="unionLink"
              @click="openUnionLink"
              no-caps
              class="q-mt-sm"
            )
              q-icon(name="open_in_new" size="16px").q-ml-xs

            span(v-else).text-grey-6.q-mt-sm Ссылка временно недоступна

  //- Навигация

  q-stepper-navigation.q-gutter-sm.q-pa-md
    q-btn(
      v-if="isActive"
      color="primary"
      label="Продолжить"
      @click="handleContinue"
    )
</template>

<style scoped>
.union-membership-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

/* Основная информационная карточка */
.membership-info-card {
  border-radius: 20px;
  padding: 2.5rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.membership-info-card::before {
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

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.membership-title {
  font-weight: 700;
  letter-spacing: -0.5px;
}

/* Секции преимуществ */
.membership-benefits {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.benefit-section {
  padding: 1.5rem;
  border-radius: 16px;
  background: rgba(25, 118, 210, 0.02);
  border: 1px solid rgba(25, 118, 210, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.benefit-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.1);
  background: rgba(25, 118, 210, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.benefit-description {
  line-height: 1.6;
  padding-left: 24px;
  position: relative;
}

.benefit-description::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, var(--q-primary) 0%, rgba(25, 118, 210, 0.3) 100%);
  border-radius: 1px;
}

/* Требование членства */
.membership-requirement {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding-top: 2rem;
}

.requirement-card {
  padding: 2rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.02) 0%, rgba(255, 193, 7, 0.02) 100%);
  border: 1px solid rgba(255, 152, 0, 0.1);
  position: relative;
}

.requirement-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #FF9800 0%, #FFC107 50%, #FF9800 100%);
  border-radius: 16px 16px 0 0;
}

.requirement-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.requirement-description {
  line-height: 1.6;
}

/* Секция ссылки на союз */
.union-link-section {
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.union-link-btn {
  width: 100%;
  justify-content: center;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.union-link-btn:hover {
  transform: translateY(-1px);
}

/* Адаптивность */
@media (max-width: 768px) {
  .membership-info-card {
    padding: 2rem;
  }

  .benefit-section {
    padding: 1.25rem;
  }

  .requirement-card {
    padding: 1.5rem;
  }

  .benefit-description {
    padding-left: 20px;
  }

  .benefit-description::before {
    width: 1.5px;
  }
}

@media (max-width: 480px) {
  .union-membership-container {
    padding: 1rem;
  }

  .membership-info-card {
    padding: 1.5rem;
  }

  .benefit-section {
    padding: 1rem;
  }

  .requirement-card {
    padding: 1.25rem;
  }

  .section-title {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .benefit-description {
    padding-left: 0;
    text-align: center;
  }

  .benefit-description::before {
    display: none;
  }
}
</style>
