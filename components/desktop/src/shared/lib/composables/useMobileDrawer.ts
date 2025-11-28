import { useDesktopStore } from 'src/entities/Desktop/model';

/**
 * Composable для управления drawer на мобильных устройствах
 * Используется для автоматического закрытия drawer при определенных действиях
 */
export function useMobileDrawer() {
  const desktop = useDesktopStore();

  /**
   * Закрывает левый drawer только на мобильных устройствах
   */
  const closeDrawerOnMobile = () => {
    desktop.closeLeftDrawerOnMobile();
  };

  return {
    closeDrawerOnMobile,
  };
}
