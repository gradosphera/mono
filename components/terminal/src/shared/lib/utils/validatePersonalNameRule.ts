export const validatePersonalName = (val: any) => {
  return val === '' || /^[a-zA-Zа-яА-Я\- ]*$/.test(val) || 'Разрешены только буквы латинского алфавита, кириллица, знак - и пробел'
}
