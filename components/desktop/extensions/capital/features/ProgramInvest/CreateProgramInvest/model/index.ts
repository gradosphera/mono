import { ref } from 'vue';
import type { Mutations } from '@coopenomics/sdk';
import { api } from '../api';

import { useSystemStore } from 'src/entities/System/model';
import { useSessionStore } from 'src/entities/Session';
import { DigitalDocument } from 'src/shared/lib/document';
import type { IGeneratedDocumentOutput } from 'src/shared/lib/types/document';
import { useWalletStore } from 'src/entities/Wallet';

export type ICreateProgramInvestInput =
  Mutations.Capital.CreateProgramInvest.IInput['data'];
export type ICreateProgramInvestOutput =
  Mutations.Capital.CreateProgramInvest.IOutput[typeof Mutations.Capital.CreateProgramInvest.name];


export function useCreateProgramInvest() {
  const system = useSystemStore();
  const session = useSessionStore();
  const walletStore = useWalletStore();

  const isGenerating = ref(false);
  const generationError = ref(false);

  async function createProgramInvest(
    data: ICreateProgramInvestInput,
  ): Promise<ICreateProgramInvestOutput> {
    const transaction = await api.createProgramInvest(data);
    return transaction;
  }

  async function generateProgramInvestStatement(
    amount: string,
  ): Promise<IGeneratedDocumentOutput | null> {
    try {
      isGenerating.value = true;
      generationError.value = false;

      const formattedAmount =
        parseFloat(amount).toFixed(system.info.symbols.root_govern_precision) +
        ' ' +
        system.info.symbols.root_govern_symbol;

      const data: Mutations.Capital.GenerateProgramMoneyInvestStatement.IInput['data'] = {
        coopname: system.info.coopname,
        username: session.username,
        amount: formattedAmount,
      };

      const doc = await api.generateProgramMoneyInvestStatement(data);
      return doc;
    } catch (error) {
      console.error('Ошибка при генерации заявления (программа):', error);
      generationError.value = true;
      throw error;
    } finally {
      isGenerating.value = false;
    }
  }

  async function createProgramInvestWithGeneratedStatement(
    amount: string,
  ): Promise<ICreateProgramInvestOutput> {
    let optimisticPatchId: string | null = null;

    try {
      isGenerating.value = true;

      const document = await generateProgramInvestStatement(amount);
      if (!document) {
        throw new Error('Не удалось сгенерировать заявление');
      }

      const digitalDocument = new DigitalDocument(document);
      const signedDoc = await digitalDocument.sign(session.username);

      const formattedAmount =
        parseFloat(amount).toFixed(system.info.symbols.root_govern_precision) +
        ' ' +
        system.info.symbols.root_govern_symbol;

      const investData: ICreateProgramInvestInput = {
        coopname: system.info.coopname,
        username: session.username,
        amount: formattedAmount,
        statement: signedDoc,
      };

      // Оптимистичный update: списываем с ЦК (program_type='wallet'),
      // зачисляем в Благорост (program_type='blagorost'). Обе суммы — в
      // `available`, потому что Ledger2::apply(INVEST) делает TRANSFER
      // w.wal.share → w.cap.blago: оба USER_SHARED, оба пишутся в .available
      // (см. operations.hpp:INVEST). progwallets.blocked в десктоп-картах не
      // отображается — UI читает available из L3 userwallets.
      optimisticPatchId = walletStore.applyOptimisticPatch([
        {
          username: session.username,
          program_type: 'wallet',
          available_delta: `-${formattedAmount}`,
        },
        {
          username: session.username,
          program_type: 'blagorost',
          available_delta: formattedAmount,
        },
      ]);

      const result = await createProgramInvest(investData);

      await walletStore.loadUserWallet({
        coopname: system.info.coopname,
        username: session.username,
      });

      return result;
    } catch (e) {
      if (optimisticPatchId) {
        walletStore.revertOptimisticPatch(optimisticPatchId);
      }
      throw e;
    } finally {
      isGenerating.value = false;
    }
  }

  return {
    createProgramInvest,
    createProgramInvestWithGeneratedStatement,
    generateProgramInvestStatement,
    isGenerating,
    generationError,
  };
}
