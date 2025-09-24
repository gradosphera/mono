<template lang="pug">
.q-pa-md
  .row
    .col-md-5.col-xs-12.q-pa-sm
      WalletWidget
    .col-md-7.col-xs-12.q-pa-sm
      WalletProgramWidget

  // Минимальный неснижаемый остаток (в конце)
  .row.q-mt-md(v-if='currentUser.participantAccount.value?.minimum_amount')
    .col-12
      q-card.minimum-balance-card.q-pa-md(flat)
        .minimum-balance-info
          .info-icon
            q-icon(name='lock', size='16px', color='orange')
          .info-content
            .info-label Минимальный неснижаемый остаток
            .info-value {{ currentUser.participantAccount.value?.minimum_amount }}
</template>

<script lang="ts" setup>
import { WalletWidget, WalletProgramWidget } from 'src/widgets/Wallet';
import { useCurrentUser } from 'src/entities/Session';
import 'src/shared/ui/CardStyles';

const currentUser = useCurrentUser();
</script>

<style lang="scss" scoped>
// Минимальный остаток
.minimum-balance-card {
  background: rgba(255, 152, 0, 0.05);
  border: 1px solid rgba(255, 152, 0, 0.2);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;

  .q-dark & {
    background: rgba(255, 152, 0, 0.08);
    border: 1px solid rgba(255, 152, 0, 0.3);
  }

  &:hover {
    background: rgba(255, 152, 0, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 152, 0, 0.15);

    .q-dark & {
      background: rgba(255, 152, 0, 0.12);
    }
  }

  .minimum-balance-info {
    display: flex;
    align-items: center;

    .info-icon {
      margin-right: 12px;
    }

    .info-content {
      .info-label {
        font-size: 14px;
        margin-bottom: 2px;
        opacity: 0.7;
      }

      .info-value {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
}
</style>
