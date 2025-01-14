export  type MakeAllFieldsRequired<T> = T extends (...args: any[]) => any
  ? T
  : T extends object
    ? {
        // Специальные поля оставляем опциональными, если они были опциональны
        [P in keyof T as P extends "__typename" | "__directives" | "__alias" ? P : never]?: T[P];
      } & {
        // Все остальные поля делаем обязательными (и рекурсивно обязательными)
        [P in keyof T as P extends "__typename" | "__directives" | "__alias" ? never : P]-?: NonNullable<MakeAllFieldsRequired<T[P]>>;
      }
    : T;
