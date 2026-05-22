export type CommandSection = 'pages' | 'actions' | 'recent';

export interface CommandItem {
  key: string;
  label: string;
  section: CommandSection;
  icon?: string;
  hotkey?: string;
  /** Действие при выборе команды. Компонент закрывается после вызова. */
  action: () => void;
}

export interface CommandPaletteProps {
  /** Управляющий v-model — palette открыто/закрыто */
  modelValue: boolean;
  commands: CommandItem[];
  /** Плейсхолдер для поиска */
  placeholder?: string;
}
