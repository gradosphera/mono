import { Resolver, Query } from '@nestjs/graphql';
import { DesktopService } from '../services/desktop.service';
import { DesktopDTO } from '../dto/desktop.dto';

@Resolver(() => DesktopDTO)
export class DesktopResolver {
  constructor(private readonly desktopService: DesktopService) {}

  @Query(() => DesktopDTO, {
    name: 'getDesktop',
    description: 'Получить состав приложений рабочего стола',
  })
  async getDesktop(): Promise<DesktopDTO> {
    return this.desktopService.getDesktop();
  }
}
