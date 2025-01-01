import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { RegisteredAccountDTO } from '~/modules/account/dto/registered-account.dto';
import { LoginInputDTO } from '../dto/login-input.dto';
import { AuthService } from '../services/auth.service';
import { RefreshInputDTO } from '../dto/refresh-input.dto';
import { LogoutInputDTO } from '../dto/logout-input.dto';
import { StartResetKeyInputDTO } from '../dto/start-reset-key-input.dto';
import { ResetKeyInputDTO } from '../dto/reset-key-input.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => RegisteredAccountDTO, {
    name: 'login',
    description: 'Войти в систему с помощью цифровой подписи и получить JWT-токены доступа',
  })
  async login(
    @Args('data', { type: () => LoginInputDTO })
    data: LoginInputDTO
  ): Promise<RegisteredAccountDTO> {
    return this.authService.login(data);
  }

  @Mutation(() => RegisteredAccountDTO, {
    name: 'refresh',
    description: 'Обновить токен доступа аккаунта',
  })
  async refresh(
    @Args('data', { type: () => RefreshInputDTO })
    data: RefreshInputDTO
  ): Promise<RegisteredAccountDTO> {
    return await this.authService.refresh(data);
  }

  @Mutation(() => Boolean, {
    name: 'logout',
    description: 'Выйти из системы и заблокировать JWT-токены',
  })
  async logout(
    @Args('data', { type: () => LogoutInputDTO })
    data: LogoutInputDTO
  ): Promise<boolean> {
    await this.authService.logout(data);
    return true;
  }

  @Mutation(() => Boolean, {
    name: 'startResetKey',
    description: 'Выслать токен для замены приватного ключа аккаунта на электронную почту',
  })
  async startResetKey(
    @Args('data', { type: () => StartResetKeyInputDTO })
    data: StartResetKeyInputDTO
  ): Promise<boolean> {
    await this.authService.startResetKey(data);
    return true;
  }

  @Mutation(() => Boolean, {
    name: 'resetKey',
    description: 'Заменить приватный ключ аккаунта',
  })
  async resetKey(
    @Args('data', { type: () => ResetKeyInputDTO })
    data: ResetKeyInputDTO
  ): Promise<boolean> {
    await this.authService.resetKey(data);
    return true;
  }
}
