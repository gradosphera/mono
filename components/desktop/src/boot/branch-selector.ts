import { watch } from 'vue';
import { useAccountStore } from 'src/entities/Account/model';
import { useSessionStore } from 'src/entities/Session';
import { useSystemStore } from 'src/entities/System/model';
import { useSelectBranch } from 'src/features/Branch/SelectBranch/model';

// boot/overlay.js
export default async () => {
  const session = useSessionStore();
  const system = useSystemStore();
  const account = useAccountStore();
  const { isVisible } = useSelectBranch();

  // Функция для проверки условий
  const checkConditions = () => {
    if (
      session.isAuth && //авторизован
      system.info?.cooperator_account?.is_branched && //кооператив с участками
      account?.account?.participant_account && //пользователь - пайщик кооператива
      account.account.participant_account.braname === ''//у пользователя нет установленного кооперативного участка
    ) {
      isVisible.value = true;
      console.log('on select branch', isVisible);
    } else {
      console.log('not need select branch');
      isVisible.value = false;
    }
  };

  // Первый запуск проверки
  checkConditions();

  // Добавляем watcher на реактивные параметры
  watch(
    [() => session.isAuth, () => system.info, () => account.account],
    () => {
      console.log('Parameters changed');
      checkConditions(); // Проверяем условия при изменении
    },
    { deep: true } // Следим за вложенными объектами
  );
};
