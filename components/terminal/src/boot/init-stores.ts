// src/boot/init-stores.js
import { boot } from 'quasar/wrappers';
import { useDesktopStore } from 'src/entities/Desktop/model';
import { useCardStore } from 'src/app/providers/card/store';
import type { RouteRecordRaw } from 'vue-router';

export default boot(async ({ router }) => {
  const desktops = useDesktopStore();
  const cardStore = useCardStore();

  // Инициализация стора desktops
  await desktops.healthCheck();
  await desktops.loadDesktops();
  await desktops.setActiveDesktop(desktops.defaultDesktopHash);

  // Инициализация кошелька
  await cardStore.initWallet();

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
