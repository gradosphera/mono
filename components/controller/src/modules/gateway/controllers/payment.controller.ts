import { Controller, Post, Param, Body, HttpCode } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ProviderInteractor } from '~/domain/provider/provider.interactor';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly providerInteractor: ProviderInteractor) {}

  @Post('ipn/:provider')
  @HttpCode(200)
  async catchIPN(@Param('provider') providerName: string, @Body() body: Record<string, any>): Promise<void> {
    this.logger.log(`Receive new IPN for provider ${providerName}`, {
      body,
      source: 'catchIPN',
    });

    const provider = this.providerInteractor.getProvider(providerName);

    // Обрабатываем IPN данные
    await provider.handleIPN(body);
  }
}
