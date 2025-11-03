import { Injectable } from '@nestjs/common';
import type { LoginInputDTO } from '../dto/login-input.dto';
import { RegisteredAccountDTO } from '~/application/account/dto/registered-account.dto';
import { AuthDomainInteractor } from '~/domain/auth/interactors/auth.interactor';
import type { LogoutInputDTO } from '../dto/logout-input.dto';
import type { StartResetKeyInputDTO } from '../dto/start-reset-key-input.dto';
import type { ResetKeyInputDTO } from '../dto/reset-key-input.dto';
import type { RefreshInputDTO } from '../dto/refresh-input.dto';

@Injectable()
export class AuthService {
  constructor(private readonly authDomainInteractor: AuthDomainInteractor) {}

  async login(data: LoginInputDTO): Promise<RegisteredAccountDTO> {
    const result = await this.authDomainInteractor.login(data);
    return new RegisteredAccountDTO(result);
  }

  async logout(data: LogoutInputDTO): Promise<void> {
    await this.authDomainInteractor.logout(data);
  }

  async startResetKey(data: StartResetKeyInputDTO): Promise<void> {
    await this.authDomainInteractor.startResetKey(data);
  }

  async sendVerificationEmail(username: string): Promise<void> {
    await this.authDomainInteractor.sendVerificationEmail(username);
  }

  async resetKey(data: ResetKeyInputDTO): Promise<void> {
    await this.authDomainInteractor.resetKey(data);
  }

  async refresh(data: RefreshInputDTO): Promise<RegisteredAccountDTO> {
    const result = await this.authDomainInteractor.refresh(data);
    return new RegisteredAccountDTO(result);
  }
}
