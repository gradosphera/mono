<template lang="pug">
div.page-shell
  q-card.hero-card(flat)
    .hero-title Члены совета
    .hero-subtitle
      | Состав членов совета должен быть утвержден общим собранием пайщиков.


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
.page-shell {
  width: 100%;
  padding: 24px 12px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card {
  border-radius: 18px;
  padding: 18px 20px;
}

.hero-title {
  font-size: 22px;
  font-weight: 600;
}

.hero-subtitle {
  line-height: 1.55;
  max-width: 820px;
}

.table-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.banner-title {
  font-size: 18px;
  font-weight: 600;
}

.banner-meta {
  line-height: 1.4;
}
</style>
