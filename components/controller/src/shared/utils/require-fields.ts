// Или более читаемый вариант:
export type RequireFields<T, K> = Partial<T> & Required<Pick<T, Extract<K & keyof T, keyof T>>>;
