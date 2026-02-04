<template lang="pug">
.role-card(
  :class="{ 'selected': isSelected, 'mini': mini }"
  @click="handleClick"
)
  q-tooltip(v-if="mini && description" anchor="top middle" self="bottom middle")
    | {{ description }}
  .role-icon(:class="{ 'q-mb-sm': !mini, 'q-mb-xs': mini }")
    q-icon(
      :name="icon"
      :size="mini ? '24px' : '32px'"
      :color="isSelected ? 'primary' : 'grey-5'"
    )
  .role-title(:class="mini ? 'text-caption' : 'text-body1'").q-mb-xs {{ title }}
  .role-description(v-if="!mini").text-caption.text-grey-6 {{ description }}
</template>

<script setup lang="ts">
interface Props {
  value: string;
  title: string;
  description?: string;
  icon: string;
  isSelected: boolean;
  mini?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  'toggle': [];
}>();

const handleClick = () => {
  emit('toggle');
};
</script>

<style lang="scss" scoped>
.role-card {
  border: 2px solid var(--q-separator, #e0e0e0);
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 220px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-secondary) 100%);
    opacity: 0;
    transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: var(--q-primary);
  }

  &.selected {
    border-color: var(--q-primary);
    box-shadow: 0 4px 16px rgba(var(--q-primary-rgb), 0.2);

    &::before {
      opacity: 0.05;
    }

    .role-title {
      color: var(--q-primary);
      font-weight: 600;
    }
  }

  &.mini {
    padding: 10px 6px;
    border-radius: 12px;
    max-width: 140px;
    min-width: 120px;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .role-icon,
  .role-title,
  .role-description {
    position: relative;
    z-index: 1;
  }

  .role-title {
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .role-description {
    line-height: 1.4;
  }
}
</style>
