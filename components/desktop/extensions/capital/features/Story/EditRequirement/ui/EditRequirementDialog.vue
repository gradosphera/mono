<template lang="pug">
q-dialog(
  v-model='showDialog'
  @hide='emit("close")'
  maximized
  transition-show='slide-up'
  transition-hide='slide-down'
)
  EditRequirementPanel(
    ref='panelRef'
    variant='dialog'
    :requirement='requirement'
    :canEdit='canEdit'
    @close='onPanelClose'
    @updated='(r) => emit("updated", r)'
  )
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EditRequirementPanel from './EditRequirementPanel.vue';
import type { IStory } from 'app/extensions/capital/entities/Story/model';

defineProps<{
  requirement?: IStory | null;
  canEdit?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  updated: [requirement: IStory];
}>();

const showDialog = ref(false);
const panelRef = ref<InstanceType<typeof EditRequirementPanel> | null>(null);

function onPanelClose() {
  showDialog.value = false;
}

function openDialog() {
  showDialog.value = true;
  queueMicrotask(() => {
    panelRef.value?.resetFromProps();
  });
}

function close() {
  showDialog.value = false;
}

defineExpose({
  openDialog,
  close,
});
</script>
