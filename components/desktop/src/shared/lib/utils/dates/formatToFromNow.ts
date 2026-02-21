import moment from './moment';

export function formatToFromNow(dateStr: string): string {
  // Приводим время к локальному часовому поясу пользователя
  const localMoment = moment.utc(dateStr).local();
  const result = localMoment.fromNow();
  return result;
}
