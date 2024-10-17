import { Application } from 'express';
import { IPlugin } from '../../types/plugin.types';

export class Powerup implements IPlugin {
  name = 'Powerup';

  async initialize(app: Application, config: any) {
    console.log(`Инициализация ${this.name} с конфигурацией`, config);

    // Добавление маршрута для плагина
    app.get('/pluginA', (req, res) => {
      res.send('Маршрут плагина A');
    });
  }
}
