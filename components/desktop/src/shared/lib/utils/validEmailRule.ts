import emailRegex from 'email-regex';
const emailValidator = emailRegex({ exact: true });

export function validEmail(email: string) {
  return emailValidator.test(email) || 'Некорректный email'
}
