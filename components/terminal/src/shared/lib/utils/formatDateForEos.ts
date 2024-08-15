import moment from 'moment-with-locales-es6';

export function convertToEOSDate(dateStr: string): string {
  console.log('on convert', dateStr)
  const result =  moment(dateStr, 'YYYY/DD/MM HH:mm').format('YYYY-MM-DDTHH:mm:ss.SSS');
  console.log('after: ', result)
  return result
}
