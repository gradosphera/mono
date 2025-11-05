import { defineStore } from 'pinia';
import { IIndividualData } from 'src/shared/lib/types/user/IUserData';
import { ICreateOrganizationData } from 'src/shared/ui/UserDataForm/CreateOrganizationDataForm';
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
  organization_data: Ref<ICreateOrganizationData | undefined>
  current_step: Ref<'key' | 'init' | 'soviet' | 'vars'>
  install_code: Ref<string | undefined>
}

const namespace = 'install';

export const useInstallCooperativeStore = defineStore(
  namespace,
  (): IInstallCooperative => {

    const soviet = ref([])
    const is_finish = ref(false)
    const wif = ref()
    const vars = ref<IVars>()
    const organization_data = ref<ICreateOrganizationData>()
    const current_step = ref<'key' | 'init' | 'soviet' | 'vars'>('key')
    const install_code = ref()

    return {
      soviet,
      is_finish,
      wif,
      vars,
      organization_data,
      current_step,
      install_code
    }
  }, {
    persist: true,
  })

