// утилита для выборки повторяющихся параметров из базовых интерфейсов
export type ExcludeCommonProps<T> = Omit<T, 'coopname' | 'username' | 'registry_id'>;
