
export type MakeAllFieldsRequired<T> = {
  [P in keyof T as P extends '__typename' | '__directives' | '__alias' ? P : never]?: T[P];
} & {
  [P in keyof T as P extends '__typename' | '__directives' | '__alias' ? never : P]-?: T[P] extends object ? MakeAllFieldsRequired<T[P]> : Exclude<T[P], undefined>;
};
