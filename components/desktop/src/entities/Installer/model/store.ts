import { defineStore } from 'pinia';
import { IIndividualData } from 'src/shared/lib/types/user/IUserData';
import { Ref, ref } from 'vue';

interface data {
  id: number,
  role: 'chairman' | 'member',
  type: 'individual',
  individual_data: IIndividualData
}

interface IAgreementVar {
  protocol_number: string;
  protocol_day_month_year: string;
}

interface IVars {
  coopname: string;
  full_abbr: string;
  full_abbr_genitive: string;
  full_abbr_dative: string;
  short_abbr: string;
  website: string;
  name: string;
  confidential_link: string;
  confidential_email: string;
  contact_email: string;
  passport_request: 'yes' | 'no';
  wallet_agreement: IAgreementVar;
  privacy_agreement: IAgreementVar;
  signature_agreement: IAgreementVar;
  user_agreement: IAgreementVar;
  participant_application: IAgreementVar;
  coopenomics_agreement?: IAgreementVar | null;
}

interface IInstallCooperative {
  wif: Ref<string | undefined>
  is_finish: Ref<boolean>
  soviet: Ref<data[]>
  vars: Ref<IVars | undefined>
  current_step: Ref<'key' | 'soviet' | 'vars'>
}

const namespace = 'install';

export const useInstallCooperativeStore = defineStore(
  namespace,
  (): IInstallCooperative => {

    const soviet = ref([])
    const is_finish = ref(false)
    const wif = ref()
    const vars = ref<IVars>()
    const current_step = ref<'key' | 'soviet' | 'vars'>('key')

    return {
      soviet,
      is_finish,
      wif,
      vars,
      current_step
    }
  }, {
    persist: true,
  })

