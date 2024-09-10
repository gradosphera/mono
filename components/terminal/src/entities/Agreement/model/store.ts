import { defineStore } from 'pinia';
import { api } from '../api'
import { Ref, ref } from 'vue';
import type { DraftContract, SovietContract } from 'cooptypes';
import type { IGeneratedDocument } from 'src/entities/Document';

const namespace = 'agreementer';

interface IAgreementStore {
  /*  доменный интерфейс кошелька пользователя */
  agreementsTemplates: Ref<DraftContract.Tables.Drafts.IDraft[]>
  agreements: Ref<SovietContract.Tables.Agreements.IAgreement[]>;

  generatedWalletAgreement: Ref<IGeneratedDocument | null>
  loadAgreementsOfAllParticipants: (coopname: string) => Promise<void>;
  loadAgreementTemplates: (coopname: string) => Promise<void>;

}

export const useAgreementStore = defineStore(namespace, (): IAgreementStore => {
  const agreementsTemplates = ref<DraftContract.Tables.Drafts.IDraft[]>([]);
  const agreements = ref<SovietContract.Tables.Agreements.IAgreement[]>([]);

  const generatedWalletAgreement = ref<IGeneratedDocument | null>(null)

  const loadAgreementsOfAllParticipants = async (coopname: string) => {
    agreements.value = await api.loadAllAgreements(coopname)
  }

  const loadAgreementTemplates = async (coopname: string) => {
    agreementsTemplates.value = await api.loadAgreementTemplates(coopname)
  }

  return {
    agreementsTemplates,
    agreements,
    loadAgreementsOfAllParticipants,
    loadAgreementTemplates,
    generatedWalletAgreement
  };
});
