// src/boot/init-stores.js
import { boot } from 'quasar/wrappers';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { useCardStore } from 'src/app/providers/card/store';
import type { RouteRecordRaw } from 'vue-router';
import { useSystemStore } from 'src/entities/System/model';
import { useAccountStore } from 'src/entities/Account/model';
import { useSessionStore } from 'src/entities/Session';

export default boot(async ({ router }) => {
  const system = useSystemStore();
  //Инициализация системного стора
  await system.loadSystemInfo();

  // инициализация всего остального
  const desktops = useDesktopStore();
  const cardStore = useCardStore();
  const account = useAccountStore();
  const session = useSessionStore();

  // Инициализация стора desktops
  await desktops.healthCheck();
  await desktops.loadDesktops();
  desktops.setActiveDesktop(desktops.defaultDesktopHash);
  // Инициализация сессии
  await cardStore.initWallet();
  // Загрузка аккаунта
  if (session.isAuth && session.username){
    try {
      await account.getAccount(session.username)
    } catch(e){
      session.close()
    }
  }

  // Добавление динамических маршрутов как дочерних к 'base'
  const baseRoute = router.getRoutes().find(route => route.name === 'base');

  if (baseRoute) {
    desktops.currentDesktop?.routes.forEach(route => {
      // Добавляем маршрут как дочерний к 'base'
      router.addRoute('base', route as RouteRecordRaw);
    });
  } else {
    console.error('Base route not found');
  }
});
