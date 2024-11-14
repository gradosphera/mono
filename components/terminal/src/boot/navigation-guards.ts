// src/boot/navigation-guards.js
import { boot } from 'quasar/wrappers';
import { COOPNAME } from 'src/shared/config';
import { useSessionStore } from 'src/entities/Session';
import { useCurrentUserStore } from 'src/entities/User';
import { useDesktopStore } from 'src/entities/Desktop/model';

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

  router.beforeEach(async (to, from, next) => {
    await desktops.healthCheck();
    console.log('to', to)
    if (desktops.health?.status === 'install' && to.name !== 'install') {
      console.log(1)
      next({ name: 'install', params: { coopname: COOPNAME } });
      return;
    }

    if (to.name === 'index') {
      const homePage =
        session.isAuth && currentUser.isRegistrationComplete
          ? desktops.currentDesktop?.authorizedHome
          : desktops.currentDesktop?.nonAuthorizedHome;

      console.log('homePage: ', homePage)
      // next();
      next({ name: homePage, params: { coopname: COOPNAME } });
      return;
    }

    if (hasAccess(to, currentUser.userAccount)) {
      next();
    } else {
      next({ name: 'permissionDenied' });
    }
  });
});
