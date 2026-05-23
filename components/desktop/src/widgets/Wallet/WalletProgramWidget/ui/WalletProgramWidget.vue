<template lang="pug">
.wallet-programs(v-if='canonPrograms.length > 0')
  WalletCard(
    v-for='entry in canonPrograms',
    :key='entry.zeusType',
    :program='entry.program',
    :title='entry.title',
    :balance='entry.balance',
    :symbol='entry.symbol',
    :locked-balance='entry.locked'
  )

EmptyState(
  v-else,
  title='Нет кошельков программ',
  body='У вас пока нет кошельков целевых потребительских программ.'
)
  template(#icon)
    q-icon(name='inbox', size='48px')

.wallet-minimum(v-if='minimumBalance')
  DataRow(
    label='Минимальный неснижаемый остаток',
    :value='minimumBalance',
    hint='Возвращается пайщику при выходе из кооператива.'
  )
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { Zeus } from '@coopenomics/sdk';
import { useWalletStore } from 'src/entities/Wallet';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { WalletCard } from 'src/shared/ui/domain/WalletCard';
import type { WalletProgram } from 'src/shared/ui/domain/WalletCard';
import { EmptyState } from 'src/shared/ui/base/EmptyState';
import { DataRow } from 'src/shared/ui/domain/DataRow';
import { formatAsset2Digits } from 'src/shared/lib/utils/formatAsset2Digits';

interface CanonProgramEntry {
  zeusType: Zeus.ProgramType;
  program: WalletProgram;
  title?: string;
  balance: string;
  symbol: string;
  locked?: string;
}

const walletStore = useWalletStore();
const session = useSessionStore();
const { info } = useSystemStore();

// Канон-набор программ платформы: Кошелёк / Благорост / Генератор.
// MARKETPLACE и прочие — отдельные виджеты, в столе пайщика не отображаются.
const ZEUS_TO_CANON: Partial<Record<Zeus.ProgramType, WalletProgram>> = {
  [Zeus.ProgramType.MAIN]: 'wallet',
  [Zeus.ProgramType.BLAGOROST]: 'blagorost',
  [Zeus.ProgramType.GENERATOR]: 'generator',
};

// Локальные перекрытия дефолтных заголовков WalletCard.
// Канон-default 'wallet' = «Кошелёк»; в столе пайщика этот кошелёк
// семантически является главным (свободный остаток ЦК).
const TITLE_OVERRIDE: Partial<Record<WalletProgram, string>> = {
  wallet: 'Главный кошелёк',
};

function splitAsset(asset?: string | null): { amount: string; symbol: string } {
  if (!asset) return { amount: '0,00', symbol: '' };
  const formatted = formatAsset2Digits(asset);
  const parts = formatted.split(' ');
  return { amount: parts[0] || '0,00', symbol: parts[1] || '' };
}

const canonPrograms = computed<CanonProgramEntry[]>(() =>
  walletStore.program_wallets.flatMap<CanonProgramEntry>((w) => {
    const program = ZEUS_TO_CANON[w.program_type as Zeus.ProgramType];
    if (!program) return [];
    const available = splitAsset(w.available);
    const blocked = splitAsset(w.blocked);
    const hasBlocked = parseFloat(w.blocked || '0') > 0;
    return [
      {
        zeusType: w.program_type as Zeus.ProgramType,
        program,
        title: TITLE_OVERRIDE[program],
        balance: available.amount,
        symbol:
          available.symbol || info.symbols?.root_govern_symbol || 'RUB',
        locked: hasBlocked ? blocked.amount : undefined,
      },
    ];
  }),
);

// Минимальный неснижаемый остаток — паевой взнос пайщика, возвращается
// при выходе из кооператива. Отдельная строка под кошельками, т.к.
// логически это не баланс кошелька, а самостоятельная сущность пайщика.
const minimumBalance = computed<string | undefined>(() => {
  const raw = session.participantAccount?.minimum_amount;
  if (!raw) return undefined;
  if (parseFloat(raw) <= 0) return undefined;
  return formatAsset2Digits(`${raw} ${info.symbols.root_govern_symbol}`);
});
</script>

<style lang="scss" scoped>
.wallet-programs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--p-4, 16px);
}

.wallet-minimum {
  margin-top: var(--p-5, 20px);
}

@media (max-width: 768px) {
  .wallet-programs {
    grid-template-columns: 1fr;
    gap: var(--p-3, 12px);
  }
  .wallet-minimum {
    margin-top: var(--p-4, 16px);
  }
}
</style>
