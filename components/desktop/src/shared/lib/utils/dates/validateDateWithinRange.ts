import moment from 'moment-with-locales-es6';

export function validateDateWithinRange(yearsAgo, yearsAhead = 0) {
  return (val) => {
    const inputDate = moment(val, 'YYYY/MM/DD HH:mm', true); // указание формата для парсинга
    const lowerLimit = moment().subtract(Math.abs(yearsAgo), 'years'); // Предел в прошлом
    const upperLimit = moment().add(Math.abs(yearsAhead), 'years'); // Предел в будущем

    if (!inputDate.isValid()) {
      return 'Неверный формат даты';
    }

    if (inputDate.isBefore(lowerLimit)) {
      return `Дата не может быть раньше ${lowerLimit.format('YYYY/MM/DD HH:mm')}`;
    }

    if (inputDate.isAfter(upperLimit)) {
      return `Дата не может быть позже ${upperLimit.format('YYYY/MM/DD HH:mm')}`;
    }

    return true;
  };
}
