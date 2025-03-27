import type { MakeAllFieldsRequired } from "../../utils/MakeAllFieldsRequired";
import type { ValueTypes } from "../../zeus/index";

// "Сырой" объект
export const rawOrganizationSelector = {
  city: true,
  country: true,
  details: {
    inn: true,
    kpp: true,
    ogrn: true,
  },
  email: true,
  fact_address: true,
  full_address: true,
  full_name: true,
  phone: true,
  represented_by: {
    based_on: true,
    first_name: true,
    last_name: true,
    middle_name: true,
    position: true,
  },
  short_name: true,
  type: true,
  username: true,
}


// Проверка валидности
const _validate: MakeAllFieldsRequired<ValueTypes["Organization"]> = rawOrganizationSelector;

export const organizationSelector = rawOrganizationSelector; // Используем "сырой" объект напрямую

