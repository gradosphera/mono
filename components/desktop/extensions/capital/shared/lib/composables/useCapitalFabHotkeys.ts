import { onMounted, onUnmounted, type Ref } from 'vue';
import { CAPITAL_FAB_HOTKEY_CODES, type CapitalFabHotkeyId } from '../capital-fab-hotkeys';

export type CapitalFabHotkeyHandler = () => void;

/** Обработчики по смыслу действия; отсутствующий ключ — сочетание не обрабатывается */
export type CapitalFabHotkeysHandlers = Partial<
  Record<CapitalFabHotkeyId, CapitalFabHotkeyHandler>
>;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true;
  }
  if (target.isContentEditable) {
    return true;
  }
  return target.closest('[contenteditable="true"]') !== null;
}

const CODE_TO_ACTION: Record<string, CapitalFabHotkeyId> = {
  [CAPITAL_FAB_HOTKEY_CODES.project]: 'project',
  [CAPITAL_FAB_HOTKEY_CODES.component]: 'component',
  [CAPITAL_FAB_HOTKEY_CODES.issue]: 'issue',
  [CAPITAL_FAB_HOTKEY_CODES.requirement]: 'requirement',
  [CAPITAL_FAB_HOTKEY_CODES.plan]: 'plan',
  [CAPITAL_FAB_HOTKEY_CODES.author]: 'author',
  [CAPITAL_FAB_HOTKEY_CODES.invest]: 'invest',
  [CAPITAL_FAB_HOTKEY_CODES.join]: 'join',
};

/**
 * Глобальный слушатель keydown для открытия диалогов FAB по общим клавишам capital.
 * Не срабатывает в полях ввода и при зажатых Ctrl/Meta/Alt (чтобы не перехвять системные сочетания).
 */
export function useCapitalFabHotkeys(
  getHandlers: () => CapitalFabHotkeysHandlers,
  options?: { enabled?: Ref<boolean> },
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    if (e.repeat) {
      return;
    }
    if (isEditableTarget(e.target)) {
      return;
    }
    if (options?.enabled && !options.enabled.value) {
      return;
    }

    const action = CODE_TO_ACTION[e.code];
    if (!action) {
      return;
    }

    const handlers = getHandlers();
    const fn = handlers[action];
    if (typeof fn !== 'function') {
      return;
    }

    e.preventDefault();
    fn();
  };

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown, false);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown, false);
  });
}
