/** Подключается через ts-node -r … до основного скрипта: ослабляет Zod-валидацию env в config.ts */
process.env.CONTROLLER_SCHEMA_GEN = '1';
