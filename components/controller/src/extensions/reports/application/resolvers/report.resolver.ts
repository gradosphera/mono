import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from '~/application/auth/guards/graphql-jwt-auth.guard';
import { RolesGuard } from '~/application/auth/guards/roles.guard';
import { AuthRoles } from '~/application/auth/decorators/auth.decorator';
import { ReportRegistryService } from '../../domain/services/report-registry.service';
import { AvailableReportDTO, GenerateReportInputDTO, GeneratedReportDTO } from '../dto/report.dto';
import { config } from '~/config';
import type { ReportInput, LedgerAccountData } from '../../domain/interfaces/report-generator.interface';

@Resolver()
export class ReportResolver {
  constructor(private readonly reportRegistry: ReportRegistryService) {}

  @Query(() => [AvailableReportDTO], {
    name: 'getAvailableReports',
    description: 'Получить список доступных типов отчётов',
  })
  @UseGuards(GqlJwtAuthGuard)
  async getAvailableReports(): Promise<AvailableReportDTO[]> {
    return this.reportRegistry.getAvailableReports();
  }

  @Mutation(() => GeneratedReportDTO, {
    name: 'generateReport',
    description: 'Генерация отчёта для ФНС/ФСС',
  })
  @UseGuards(GqlJwtAuthGuard, RolesGuard)
  @AuthRoles(['chairman'])
  async generateReport(
    @Args('data') data: GenerateReportInputDTO,
  ): Promise<GeneratedReportDTO> {
    const input: ReportInput = {
      reportType: data.reportType,
      year: data.year,
      period: data.period,
      inn: '9728130611',
      kpp: '772801001',
      orgName: 'Потребительский Кооператив "ВОСХОД"',
      ogrn: '1247700283346',
      okved: '94.99',
      okfs: '16',
      okopf: '20200',
      signerFio: { lastName: 'Иванов', firstName: 'Иван', middleName: 'Иванович' },
      ledgerData: [],
    };

    // TODO: загрузить реальные данные из ledger
    // Пока используем тестовые данные
    input.ledgerData = [
      { accountId: 51, name: 'Расчётный счёт', available: 100000, blocked: 0 },
      { accountId: 80, name: 'Паевой фонд', available: 50000, blocked: 0 },
      { accountId: 86, name: 'Целевое финансирование', available: 30000, blocked: 0 },
    ];

    return this.reportRegistry.generate(input);
  }
}
