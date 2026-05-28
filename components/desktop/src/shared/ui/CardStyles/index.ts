// Экспорт стилей карточек для использования в компонентах
import './index.scss';

// Константы для классов, чтобы избежать опечаток
export const CARD_CLASSES = {
  // Основные карточки
  CARD_CONTAINER: 'card-container',
  INFO_CARD: 'info-card',
  INFO_CARD_HOVER: 'info-card-hover',

  // Карточки страниц
  PAGE_MAIN_CARD: 'page-main-card',
  SECTION_CARD: 'section-card',
  SECTION_CARD_WARNING: 'section-card-warning',

  // Специальные карточки
  BALANCE_CARD: 'balance-card',
  BALANCE_CARD_PRIMARY: 'balance-card-primary',
  BALANCE_CARD_WARNING: 'balance-card-warning',
  INFO_WARNING_CARD: 'info-warning-card',

  // Состояния
  EMPTY_STATE: 'empty-state',

  // Заголовки и содержимое
  SECTION_HEADER: 'section-header',
  CARD_TITLE: 'card-title',
  CARD_LABEL: 'card-label',
  CARD_VALUE: 'card-value',
} as const;

export type CardClass = (typeof CARD_CLASSES)[keyof typeof CARD_CLASSES];
