// src/boot/navigation-guards.js
import { boot } from 'quasar/wrappers';
import { useSessionStore } from 'src/entities/Session';
import { useCurrentUserStore } from 'src/entities/User';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { useSystemStore } from 'src/entities/System/model';

// Function to handle access logic
function hasAccess(to, userAccount) {
  if (!to.meta?.roles || to.meta?.roles.length === 0) {
    return true; // Access is allowed if no roles are defined
  }
  return userAccount && to.meta?.roles.includes(userAccount.role); // Check user roles against route roles
}

export default boot(async ({ router }) => {
  const desktops = useDesktopStore();
  const session = useSessionStore();
  const currentUser = useCurrentUserStore();
  const { info } = useSystemStore()

  router.beforeEach(async (to, from, next) => {
    await desktops.healthCheck();

    // проверяем установлено ли ПО, если нет - адресуем на install
    if (desktops.health?.status === 'install' && to.name !== 'install') {
      next({ name: 'install', params: { coopname: info.coopname } });
      return;
    }

    //перенаправляем на главную страницу для авторизованного или не авторизованного пользователя
    if (to.name === 'index') {
      const homePage =
        session.isAuth && currentUser.isRegistrationComplete
          ? desktops.currentDesktop?.authorizedHome
          : desktops.currentDesktop?.nonAuthorizedHome;

      next({ name: homePage, params: { coopname: info.coopname } });
      return;
    }

    //проверяем права доступа по роли пользователя в аккаунте провайдера
    if (hasAccess(to, currentUser.userAccount)) {
      next();
    } else {
      next({ name: 'permissionDenied' });
    }
  });
});
