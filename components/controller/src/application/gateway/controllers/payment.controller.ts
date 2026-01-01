import { Controller, Post, Param, Body, HttpCode, Inject } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ProviderPort, PROVIDER_PORT } from '~/domain/gateway/ports/provider.port';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(@Inject(PROVIDER_PORT) private readonly providerPort: ProviderPort) {}

  @Post('ipn/:provider')
  @HttpCode(200)
  async catchIPN(@Param('provider') providerName: string, @Body() body: Record<string, any>): Promise<void> {
    this.logger.log(`Receive new IPN for provider ${providerName}`, {
      body,
      source: 'catchIPN',
    });

    const provider = this.providerPort.getProvider(providerName);

    // Обрабатываем IPN данные
    await provider.handleIPN(body);
  }
}
