/**
 * Типы целевых потребительских программ кооператива
 */
export enum ProgramType {
  /** Основная программа */
  MAIN = 'main',

  /** Программа маркетплейса */
  MARKETPLACE = 'marketplace',

  /** Программа генератора */
  GENERATOR = 'generator',

  /** Программа благорост */
  BLAGOROST = 'blagorost',
}

/**
 * Маппинг program_id -> тип программы
 */
export const PROGRAM_ID_TO_TYPE: Record<string, ProgramType> = {
  '1': ProgramType.MAIN,
  '2': ProgramType.MARKETPLACE,
  '3': ProgramType.GENERATOR,
  '4': ProgramType.BLAGOROST,
};

/**
 * Маппинг тип программы -> program_id
 */
export const PROGRAM_TYPE_TO_ID: Record<ProgramType, string> = {
  [ProgramType.MAIN]: '1',
  [ProgramType.MARKETPLACE]: '2',
  [ProgramType.GENERATOR]: '3',
  [ProgramType.BLAGOROST]: '4',
};

/**
 * Получить тип программы по её ID
 */
export function getProgramType(program_id: string): ProgramType {
  return PROGRAM_ID_TO_TYPE[program_id] || ProgramType.MAIN;
}

/**
 * Получить ID программы по её типу
 */
export function getProgramId(program_type: ProgramType): string {
  return PROGRAM_TYPE_TO_ID[program_type] || '1';
}
