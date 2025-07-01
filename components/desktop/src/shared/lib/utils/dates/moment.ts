import moment from 'moment-timezone';

// Функции для правильного склонения
function relativeTimeWithPlural(
  number: number,
  withoutSuffix: boolean,
  key: string,
): string {
  const format: Record<string, string[]> = {
    ss: ['секунда', 'секунды', 'секунд'],
    mm: ['минута', 'минуты', 'минут'],
    hh: ['час', 'часа', 'часов'],
    dd: ['день', 'дня', 'дней'],
    MM: ['месяц', 'месяца', 'месяцев'],
    yy: ['год', 'года', 'лет'],
  };

  if (key === 'm') {
    return withoutSuffix ? 'минута' : 'минуту';
  }

  if (key === 'h') {
    return 'час';
  }

  if (key === 'd') {
    return 'день';
  }

  if (key === 'M') {
    return 'месяц';
  }

  if (key === 'y') {
    return 'год';
  }

  const words = format[key];
  if (!words) return '';

  let word;
  if (number % 10 === 1 && number % 100 !== 11) {
    word = words[0];
  } else if (
    number % 10 >= 2 &&
    number % 10 <= 4 &&
    (number % 100 < 10 || number % 100 >= 20)
  ) {
    word = words[1];
  } else {
    word = words[2];
  }

  return number + ' ' + word;
}

// Добавляем русскую локализацию вручную
moment.updateLocale('ru', {
  months:
    'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split(
      '_',
    ),
  monthsShort: 'янв_фев_мар_апр_май_июн_июл_авг_сен_окт_ноя_дек'.split('_'),
  weekdays:
    'Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота'.split('_'),
  weekdaysShort: 'Вс_Пн_Вт_Ср_Чт_Пт_Сб'.split('_'),
  weekdaysMin: 'Вс_Пн_Вт_Ср_Чт_Пт_Сб'.split('_'),
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD.MM.YYYY',
    LL: 'D MMMM YYYY',
    LLL: 'D MMMM YYYY HH:mm',
    LLLL: 'dddd, D MMMM YYYY HH:mm',
  },
  calendar: {
    sameDay: '[Сегодня в] LT',
    nextDay: '[Завтра в] LT',
    nextWeek: '[В] dddd [в] LT',
    lastDay: '[Вчера в] LT',
    lastWeek: '[В прошлую] dddd [в] LT',
    sameElse: 'L',
  },
  relativeTime: {
    future: 'через %s',
    past: '%s назад',
    s: 'несколько секунд',
    ss: relativeTimeWithPlural,
    m: relativeTimeWithPlural,
    mm: relativeTimeWithPlural,
    h: relativeTimeWithPlural,
    hh: relativeTimeWithPlural,
    d: relativeTimeWithPlural,
    dd: relativeTimeWithPlural,
    M: relativeTimeWithPlural,
    MM: relativeTimeWithPlural,
    y: relativeTimeWithPlural,
    yy: relativeTimeWithPlural,
  },
});

// Устанавливаем локаль по умолчанию
moment.locale('ru');

export default moment;
