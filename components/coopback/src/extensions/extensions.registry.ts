import { PowerupPluginModule } from './powerup/powerup-extension.module';

import { YookassaPluginModule } from './yookassa/yookassa-extension.module';
import { SberpollPluginModule } from './sberpoll/sberpoll-extension.module';
import { QrPayPluginModule } from './qrpay/qrpay-extension.module';

export const AppRegistry = {
  powerup: PowerupPluginModule,
  yookassa: YookassaPluginModule,
  sberpoll: SberpollPluginModule,
  qrpay: QrPayPluginModule,
};
