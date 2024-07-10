import config from '../config/config';

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: "API Цифрового Кооператива",
    // description: `Модуль предоставляет:

    //   - API для хранения персональных данных пользователей

    //   - Инструменты для создания аккаунтов пайщиков

    //   - Инструменты для генерации документов и их сохранения

    //   - Инструменты для получения принятых советом документов и пайщиков

    // `,
    version: '1',
    license: {
      name: 'MIT',
      url: 'https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
  ],
};

export default swaggerDef;
