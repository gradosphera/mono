import { Injectable } from '@nestjs/common';
import { SystemInfoDTO } from '../dto/system.dto';
import { SystemDomainInteractor } from '~/domain/system/interactors/system.interactor';

@Injectable()
export class SystemService {
  constructor(private readonly systemDomainInteractor: SystemDomainInteractor) {}

  public async getInfo(): Promise<SystemInfoDTO> {
    const info = await this.systemDomainInteractor.getInfo();

    return new SystemInfoDTO(info);
  }
}
