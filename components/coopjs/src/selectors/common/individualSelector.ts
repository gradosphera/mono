import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import type { ValueTypes } from "../../zeus";

// "Сырой" объект
const rawIndividualSelector = {
  email: true,
  full_address: true,
  phone: true,
  first_name: true,
  last_name: true,
  middle_name: true,
  birthdate: true,
  passport: {
    number: true,
    code: true,
    issued_at: true,
    issued_by: true,
    series: true,
  },
  username: true,
};


// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['Branch']['trusted']> = rawIndividualSelector;


export const individualSelector = rawIndividualSelector; // Используем "сырой" объект напрямую
export { rawIndividualSelector };
