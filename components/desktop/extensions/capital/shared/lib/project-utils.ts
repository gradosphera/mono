import { EMPTY_HASH } from 'src/shared/lib/consts/blockchain';
import type { IGetProjectOutput } from 'app/extensions/capital/entities/Project/model';

/**
 * Определяет, является ли объект проектом (верхний уровень)
 * @param data - данные проекта/компонента
 * @returns true если это проект, false если компонент
 */
export function isProject(data: IGetProjectOutput): boolean {
  return !data?.parent_hash || data.parent_hash === EMPTY_HASH;
}

/**
 * Определяет, является ли объект компонентом (имеет родительский проект)
 * @param data - данные проекта/компонента
 * @returns true если это компонент, false если проект
 */
export function isComponent(data: IGetProjectOutput): boolean {
  return Boolean(data?.parent_hash && data.parent_hash !== EMPTY_HASH);
}
