<template lang="pug">
q-dialog(
  v-model='showDialog'
  @hide="emit('close')"
  maximized
  transition-show="slide-up"
  transition-hide="slide-down"
)
  q-card.column.no-wrap
    q-bar.bg-primary.text-white(style="min-height: 40px;")

      q-input(
        v-if="canEdit"
        v-model="localTitle"
        :readonly="!canEdit"
        dense
        color="white"
        input-class="text-white"
        input-style="color: white;"
        placeholder="Заголовок требования"
        :rules="[(val) => !!val?.trim() || 'Заголовок обязателен']"
        style="font-size: 1.25rem; font-weight: 500;"
      ).q-mt-md.full-width
      .text-h6(v-else) {{ requirement?.title || 'Требование' }}
      q-space
      q-btn(
        dense
        flat
        icon='close'
        @click='handleClose'
      )
        q-tooltip Закрыть

    q-card-section.col.scroll
      // Отображаем markdown редактор
      Editor(
        v-if="requirement"
        v-model='localDescription'
        :readonly="!canEdit"
        :placeholder="canEdit ? 'Опишите требование подробно...' : 'Описание отсутствует'"
        :minHeight="400"
      )

    q-card-actions.q-pa-md(align='right')
      q-btn(
        v-if="!hasChanges"
        flat
        label='Закрыть'
        @click='handleClose'
      )
      template(v-if="canEdit && hasChanges")
        q-btn(
          flat
          label='Отменить'
          @click='resetChanges'
          :disable="isSaving"
        )
        q-btn(
          label='Сохранить'
          color='primary'
          @click='handleSave'
          :loading="isSaving"
        )
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Editor } from 'src/shared/ui';
import { useUpdateStory } from '../../UpdateStory/model';
import { FailAlert, SuccessAlert } from 'src/shared/api';
import type { IStory } from 'app/extensions/capital/entities/Story/model';

interface Props {
  requirement?: IStory | null;
  canEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  requirement: null,
  canEdit: true,
});

const emit = defineEmits<{
  close: [];
  updated: [requirement: IStory];
}>();

const showDialog = ref(false);
const localTitle = ref('');
const localDescription = ref('');
const originalTitle = ref('');
const originalDescription = ref('');
const isSaving = ref(false);
const { updateStory } = useUpdateStory();

// Проверяем, есть ли изменения
const hasChanges = computed(() => {
  return localTitle.value !== originalTitle.value ||
         localDescription.value !== originalDescription.value;
});

// Инициализация локального заголовка и описания при изменении requirement
watch(() => props.requirement, (newRequirement) => {
  if (newRequirement) {
    localTitle.value = newRequirement.title || '';
    localDescription.value = newRequirement.description || '';
    originalTitle.value = newRequirement.title || '';
    originalDescription.value = newRequirement.description || '';
  }
}, { immediate: true });

// Функция для открытия диалога
const openDialog = () => {
  if (props.requirement) {
    localTitle.value = props.requirement.title || '';
    localDescription.value = props.requirement.description || '';
    originalTitle.value = props.requirement.title || '';
    originalDescription.value = props.requirement.description || '';
  }
  showDialog.value = true;
};

// Функция для закрытия диалога
const handleClose = () => {
  if (hasChanges.value) {
    // Спрашиваем пользователя о несохранённых изменениях
    if (confirm('У вас есть несохранённые изменения. Вы уверены, что хотите закрыть?')) {
      showDialog.value = false;
      emit('close');
    }
  } else {
    showDialog.value = false;
    emit('close');
  }
};

// Сброс изменений
const resetChanges = () => {
  localTitle.value = originalTitle.value;
  localDescription.value = originalDescription.value;
};

// Сохранение изменений
const handleSave = async () => {
  if (!props.requirement || !hasChanges.value) return;

  isSaving.value = true;
  try {
    const updateData = {
      story_hash: props.requirement.story_hash,
      title: localTitle.value,
      description: localDescription.value,
    };

    const updatedRequirement = await updateStory(updateData);

    // Обновляем оригинальные значения
    originalTitle.value = localTitle.value;
    originalDescription.value = localDescription.value;

    SuccessAlert('Требование успешно обновлено');
    emit('updated', updatedRequirement);
  } catch (error) {
    console.error('Ошибка при обновлении требования:', error);
    FailAlert('Не удалось обновить требование');
  } finally {
    isSaving.value = false;
  }
};

// Экспортируем функции для внешнего использования
defineExpose({
  openDialog,
  close: handleClose,
});
</script>

<style lang="scss" scoped>
.q-card {
  height: 100vh;
}
</style>
