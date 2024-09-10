<template lang="pug">
div
  SignAgreementDialog(v-if="is_wallet_require" type="wallet")
    AgreementReader(type="wallet")


</template>

<script lang="ts" setup>
import { SignAgreementDialog } from 'src/features/Agreementer/SignAgreementDialog';
import { useAgreementStore } from 'src/entities/Agreement';
import { COOPNAME } from 'src/shared/config';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { AgreementReader } from 'src/features/Agreementer/GenerateAgreement';

const route = useRoute()
const agreementer = useAgreementStore()

const required = computed(() => (route.meta?.programs || []))//TODO change to agreements

const is_wallet_require = computed(() => required.value.find(el => el == 'wallet'))

const loadAgreementTemplates = async () => {
  agreementer.loadAgreementTemplates(COOPNAME)
}

loadAgreementTemplates()


</script>
