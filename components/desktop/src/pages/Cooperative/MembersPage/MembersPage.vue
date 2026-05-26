<template lang="pug">
.members-page
  .members-page__head
    h2.members-page__title Члены совета
    p.members-page__sub
      | Состав членов совета должен быть утверждён общим собранием пайщиков.

  CooperativeMembers
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { useHeaderActions } from 'src/shared/hooks';
import { AddMemberButton } from 'src/features/Cooperative/UpdateBoard';
import { CooperativeMembers } from 'src/widgets/Cooperative/Members';

const { registerAction } = useHeaderActions();

onMounted(() => {
  registerAction({
    id: 'add-board-member',
    component: AddMemberButton,
    order: 1,
  });
});
</script>

<style scoped lang="scss">
.members-page {
  display: flex;
  flex-direction: column;
  gap: var(--p-5, 20px);
  padding: var(--p-6, 24px);
  @media (max-width: 768px) {
    padding: var(--p-4, 16px);
  }
}
.members-page__head {
  display: flex;
  flex-direction: column;
  gap: var(--p-2, 8px);
}
.members-page__title {
  margin: 0;
  font-size: var(--p-fs-h2);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--p-ink);
}
.members-page__sub {
  margin: 0;
  font-size: var(--p-fs-body);
  line-height: 1.55;
  color: var(--p-ink-2);
}
</style>
