import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import type { ValueTypes } from "../../zeus/index";

// "Сырой" объект
export const rawEntrepreneurSelector = {
  birthdate: true,
  city: true,
  country: true,
  details: {
    inn: true,
    ogrn: true,
  },
  email: true,
  first_name: true,
  full_address: true,
  last_name: true,
  middle_name: true,
  phone: true,
  username: true,
};


// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes['Entrepreneur']> = rawEntrepreneurSelector;


export const entrepreneurSelector = rawEntrepreneurSelector; // Используем "сырой" объект напрямую

