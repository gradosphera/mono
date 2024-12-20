import { defineStore } from 'pinia';
import { api } from '../api'
import { Ref, ref } from 'vue';
import type { DraftContract, SovietContract } from 'cooptypes';
import type { IGeneratedDocument } from 'src/shared/lib/document';

const namespace = 'agreementer';

interface IAgreementStore {
  /*  доменный интерфейс кошелька пользователя */
  agreementsTemplates: Ref<DraftContract.Tables.Drafts.IDraft[]>
  agreementsOfAllParticipants: Ref<SovietContract.Tables.Agreements.IAgreement[]>;
  cooperativeAgreements: Ref<SovietContract.Tables.CoopAgreements.ICoopAgreement[]>;
  generatedAgreements: Ref<IGeneratedDocument[]>
  loadAgreementsOfAllParticipants: (coopname: string) => Promise<void>;
  loadAgreementTemplates: (coopname: string) => Promise<void>;
  loadCooperativeAgreements: (coopname: string) => Promise<void>;
}

export const useAgreementStore = defineStore(namespace, (): IAgreementStore => {
  const agreementsTemplates = ref<DraftContract.Tables.Drafts.IDraft[]>([]);
  const agreementsOfAllParticipants = ref<SovietContract.Tables.Agreements.IAgreement[]>([]);

  const cooperativeAgreements = ref<SovietContract.Tables.CoopAgreements.ICoopAgreement[]>([]);

  const generatedAgreements = ref<IGeneratedDocument[]>([])

  const loadAgreementsOfAllParticipants = async (coopname: string) => {
    agreementsOfAllParticipants.value = await api.loadAgreementsOfAllParticipants(coopname)
  }

  const loadAgreementTemplates = async (coopname: string) => {
    agreementsTemplates.value = await api.loadAgreementTemplates(coopname)
  }

  const loadCooperativeAgreements = async (coopname: string) => {
    cooperativeAgreements.value = await api.loadCooperativeAgreements(coopname)
  }

  return {
    cooperativeAgreements,
    agreementsTemplates,
    agreementsOfAllParticipants,
    loadAgreementsOfAllParticipants,
    loadAgreementTemplates,
    loadCooperativeAgreements,
    generatedAgreements
  };
});
