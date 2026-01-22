import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import { IGeneratedAccount } from 'src/shared/lib/types/user';
import { type IUserData } from 'src/shared/lib/types/user/IUserData';
import type { Cooperative } from 'cooptypes';
import { useSystemStore } from 'src/entities/System/model';
import type { IDocument, ISignatureInfo } from 'src/shared/lib/types/document';
import { Zeus } from '@coopenomics/sdk';
import type { IInitialPaymentOrder } from 'src/shared/lib/types/payments';

const namespace = 'registrator';

// Начальное состояние для account
const initialAccountState: IGeneratedAccount = {
  username: '',
  private_key: '',
  public_key: '',
};

// Начальное состояние для userData
const initialUserDataState: IUserData = {
  type: null,
  individual_data: {
    first_name: '',
    last_name: '',
    middle_name: '',
    birthdate: '',
    full_address: '',
    phone: '',
  },
  organization_data: {
    type: Zeus.OrganizationType.COOP,
    short_name: '',
    full_name: '',
    represented_by: {
      first_name: '',
      last_name: '',
      middle_name: '',
      position: '',
      based_on: '',
    },
    country: 'Russia',
    city: '',
    full_address: '',
    fact_address: '',
    phone: '',
    details: {
      kpp: '',
      inn: '',
      ogrn: '',
    },
    bank_account: {
      currency: 'RUB',
      card_number: undefined,
      bank_name: '',
      account_number: '',
      details: {
        bik: '',
        corr: '',
        kpp: '',
      },
    },
  },
  entrepreneur_data: {
    first_name: '',
    last_name: '',
    middle_name: '',
    birthdate: '',
    phone: '',
    country: Zeus.Country.Russia,
    city: '',
    full_address: '',
    details: {
      inn: '',
      ogrn: '',
    },
    bank_account: {
      currency: 'RUB',
      card_number: undefined,
      bank_name: '',
      account_number: '',
      details: {
        bik: '',
        corr: '',
        kpp: '',
      },
    },
  },
};

// Начальное состояние для любого документа
const initialDocumentState: IDocument = {
  hash: '',
  meta: {} as Cooperative.Document.IMetaDocument,
  meta_hash: '',
  version: '',
  doc_hash: '',
  signatures: [] as ISignatureInfo[],
};

// Начальное состояние для payment
const initialPaymentState: IInitialPaymentOrder | null = null;

// Начальное состояние для agreements
const initialAgreementsState = {
  condidential: false,
  digital_signature: false,
  wallet: false,
  ustav: false,
  user: false,
  self_paid: false,
};
export const useRegistratorStore = defineStore(
  namespace,
  () => {
    const state = reactive({
      step: 1,
      role: 'user',
      email: '',
      selectedBranch: '',
      selectedProgramKey: '',
      requiresProgramSelection: false,
      account: structuredClone(initialAccountState),
      userData: structuredClone(initialUserDataState),
      signature: '',
      inLoading: false,
      agreements: structuredClone(initialAgreementsState),
      statement: structuredClone(initialDocumentState),
      walletAgreement: structuredClone(initialDocumentState),
      privacyAgreement: structuredClone(initialDocumentState),
      signatureAgreement: structuredClone(initialDocumentState),
      userAgreement: structuredClone(initialDocumentState),
      payment: initialPaymentState as IInitialPaymentOrder | null,
      is_paid: false,
    });

    const stepNames = [
      'EmailInput',
      'SetUserData',
      'SelectProgram',
      'GenerateAccount',
      'SelectBranch',
      'ReadStatement',
      'SignStatement',
      'PayInitial',
      'WaitingRegistration',
      'Welcome',
    ] as const;

    type StepName = (typeof stepNames)[number];

    const steps = stepNames.reduce(
      (acc, step, index) => {
        acc[step] = index + 1; // Индексы начинаются с 1
        return acc;
      },
      {} as Record<StepName, number>,
    );

    const system = useSystemStore();
    const isBranched = computed(
      () => system.info?.cooperator_account.is_branched,
    );

    const filteredSteps = computed(() =>
      stepNames.filter((step) => {
        if (step === 'SelectBranch' && !isBranched.value) return false;
        if (step === 'SelectProgram' && !state.requiresProgramSelection) return false;
        return true;
      }),
    );

    const isStepDone = (stepName: StepName) => {
      const stepIndex = steps[stepName];
      return stepIndex < state.step;
    };

    const isStep = (stepName: StepName) => {
      const stepIndex = steps[stepName];
      return stepIndex === state.step;
    };

    const next = () => {
      if (state.step < filteredSteps.value.length) {
        state.step += 1;
      }
    };

    const prev = () => {
      if (state.step > 1) {
        state.step -= 1;
      }
    };

    const goTo = (targetStep: StepName) => {
      const targetIndex = steps[targetStep];
      if (targetIndex > 0) {
        state.step = targetIndex;
      }
    };

    const clearAddUserState = () =>
      reactive({
        spread_initial: false,
        created_at: '',
        initial: 0,
        minimum: 0,
        org_initial: 0,
        org_minimum: 0,
      });

    const addUserState = clearAddUserState();

    const clearUserData = () => {
      state.step = 1;
      state.selectedBranch = '';
      state.selectedProgramKey = '';
      state.requiresProgramSelection = false;
      state.email = '';
      state.account = structuredClone(initialAccountState);
      state.agreements = structuredClone(initialAgreementsState);
      state.userData = structuredClone(initialUserDataState);
      state.payment = initialPaymentState;
      state.is_paid = false;
      state.statement = structuredClone(initialDocumentState);
      state.walletAgreement = structuredClone(initialDocumentState);
      state.privacyAgreement = structuredClone(initialDocumentState);
      state.signatureAgreement = structuredClone(initialDocumentState);
      state.userAgreement = structuredClone(initialDocumentState);
    };

    return {
      state,
      steps,
      filteredSteps,
      next,
      prev,
      goTo,
      isStepDone,
      isStep,
      clearUserData,
      addUserState,
      isBranched,
    };
  },
  {
    persist: true,
  },
);
