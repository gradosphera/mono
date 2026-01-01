import { Injectable } from '@nestjs/common';
import { DesktopDTO } from '../dto/desktop.dto';
import { DesktopDomainInteractor } from '../interactors/desktop.interactor';

@Injectable()
export class DesktopService {
  constructor(private readonly desktopDomainInteractor: DesktopDomainInteractor) {}

  public async getDesktop(): Promise<DesktopDTO> {
    const desktop = await this.desktopDomainInteractor.getDesktop();

    return new DesktopDTO(desktop);
  }
}
