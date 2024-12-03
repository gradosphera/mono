import { Resolver, Query } from '@nestjs/graphql';
import { SystemInfoDTO } from '../dto/system.dto';
import { SystemService } from '../services/system.service';

@Resolver(() => SystemInfoDTO)
export class SystemResolver {
  constructor(private readonly systemService: SystemService) {}

  @Query(() => SystemInfoDTO, {
    name: 'getInfo',
    description: 'Получить сводную публичную информацию о системе',
  })
  async getInfo(): Promise<SystemInfoDTO> {
    return this.systemService.getInfo();
  }
}
