// plugins/plugins.module.ts
import { DynamicModule, Module, Global } from '@nestjs/common';
import { AppRegistry } from './extensions.registry';

@Module({})
export class ExtensionsModule {
  static register(): DynamicModule {
    const pluginModules = Object.values(AppRegistry).map((plugin) => plugin.class);

    return {
      module: ExtensionsModule,
      imports: pluginModules, // Подключаем модули через imports
      exports: pluginModules, // Экспортируем модули для использования в других модулях
    };
  }
}
