import moment from './dates/moment';

export function convertToEOSDate(dateStr: string): string {
  const result =  moment(dateStr, 'YYYY/MM/DD HH:mm').format('YYYY-MM-DDTHH:mm:ss.SSS');
  return result
}
