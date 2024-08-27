import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { IGeneratedAccount } from 'src/shared/lib/types/user';
import { IUserData } from 'src/shared/lib/types/user/IUserData';


const namespace = 'registrator';

function clearObjectValues(obj: any): any {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      clearObjectValues(obj[key]); // рекурсивный вызов
    } else if (typeof obj[key] === 'string' && obj[key] !== '') {
      obj[key] = '';
    } else if (typeof obj[key] === 'boolean') {
      obj[key] = false;
    }
  }
  return obj;
}



export const useRegistratorStore = defineStore(
  namespace,
  () => {
    const state = reactive({
      step: 1,
      role: 'user',
      email: '',
      account: { username: '', private_key: '', public_key: '' } as IGeneratedAccount,
      userData: {
        type: 'individual',
        individual_data: {
          first_name: '',
          last_name: '',
          middle_name: '',
          birthdate: '',
          full_address: '',
          phone: '',
          email: '',
        },
        organization_data: {
          type: 'coop', // или другой тип, если нужно
          is_cooperative: false,
          short_name: '',
          full_name: '',
          represented_by: {
            first_name: '',
            last_name: '',
            middle_name: '',
            position: '',
            based_on: '',
          },
          country: 'Russia', // или 'Other'
          city: '',
          full_address: '',
          phone: '',
          email: '',
          details: {
            inn: '',
            ogrn: '',
          },
          bank_account: {
            currency: 'RUB', // или 'Other'
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
          email: '',
          country: 'Russia', // или 'Other'
          city: '',
          full_address: '',
          details: {
            inn: '',
            ogrn: '',
          },
          bank_account: {
            currency: 'RUB', // или 'Other'
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
      } as IUserData,
      signature: '',
      inLoading: false,
      agreements: {
        condidential: false,
        digital_signature: false,
        wallet: false,
        ustav: false,
        user: false,
        self_paid: false,
      },
      statement: {
        hash: '',
        meta: {},
        public_key: '',
        signature: '',
      },
      payment: {
        provider: 'yookassa',
        details: {
          token: '',
          url: '',
        },
      },
      is_paid: false,
    });

    const clearAddUserState = () => reactive({
      spread_initial: false,
      created_at: '',
      initial: 0,
      minimum: 0,
      org_initial: 0,
      org_minimum: 0
    })

    const addUserState = clearAddUserState()

    const clearUserData = () => {
      state.step = 1
      state.email = ''
      state.account = clearObjectValues(state.account);
      state.userData = clearObjectValues(state.userData);
      state.payment.provider = 'yookassa'
      state.is_paid = false
      state.statement = {
        hash: '',
        meta: {},
        public_key: '',
        signature: '',
      }
    }


    return {
      state,
      addUserState,
      clearUserData,
      clearAddUserState
    };
  },
  {
    persist: true,
  }
);
