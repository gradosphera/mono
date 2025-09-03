import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SystemInfoDTO } from '../dto/system.dto';
import { SystemService } from '../services/system.service';
import { InstallDTO } from '../dto/install.dto';
import { InitDTO } from '../dto/init.dto';
import { SetWifInputDTO } from '../dto/set-wif-input.dto';
import { UpdateDTO } from '../dto/update.dto';

@Resolver(() => SystemInfoDTO)
export class SystemResolver {
  constructor(private readonly systemService: SystemService) {}

  @Query(() => SystemInfoDTO, {
    name: 'getSystemInfo',
    description: 'Получить сводную публичную информацию о системе',
  })
  async getSystemInfo(): Promise<SystemInfoDTO> {
    return this.systemService.getInfo();
  }

  @Mutation(() => SystemInfoDTO, {
    name: 'updateSystem',
    description: 'Обновить параметры системы',
  })
  async update(
    @Args('data', { type: () => UpdateDTO })
    data: UpdateDTO
  ): Promise<SystemInfoDTO> {
    return this.systemService.update(data);
  }

  @Mutation(() => SystemInfoDTO, {
    name: 'installSystem',
    description: 'Произвести установку членов совета перед началом работы',
  })
  async install(
    @Args('data', { type: () => InstallDTO })
    data: InstallDTO
  ): Promise<SystemInfoDTO> {
    return this.systemService.install(data);
  }

  @Mutation(() => SystemInfoDTO, {
    name: 'initSystem',
    description: 'Произвести инициализацию программного обеспечения перед установкой совета методом install',
  })
  async init(
    @Args('data', { type: () => InitDTO })
    data: InitDTO
  ): Promise<SystemInfoDTO> {
    return this.systemService.init(data);
  }

  @Mutation(() => Boolean, {
    name: 'setWif',
    description: 'Сохранить приватный ключ в зашифрованном серверном хранилище',
  })
  async setWif(
    @Args('data', { type: () => SetWifInputDTO })
    data: SetWifInputDTO
  ): Promise<boolean> {
    await this.systemService.setWif(data);
    return true;
  }
}
