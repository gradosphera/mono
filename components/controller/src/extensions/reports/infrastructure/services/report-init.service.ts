import { Injectable, OnModuleInit } from '@nestjs/common';
import { ReportRegistryService } from '../../domain/services/report-registry.service';
import { ReportType } from '../../domain/enums/report-type.enum';
import { BuhotchGenerator } from '../generators/buhotch.generator';
import { Ndfl6Generator } from '../generators/ndfl6.generator';
import { createZeroReportGenerator } from '../generators/zero-report.generator';

/**
 * Сервис инициализации — регистрирует все генераторы при старте модуля
 */
@Injectable()
export class ReportInitService implements OnModuleInit {
  constructor(private readonly registry: ReportRegistryService) {}

  onModuleInit() {
    this.registry.register(new BuhotchGenerator());
    this.registry.register(new Ndfl6Generator());
    this.registry.register(createZeroReportGenerator(ReportType.RSV, '1151111', '5.08'));
    this.registry.register(createZeroReportGenerator(ReportType.PSV, '1151162', '5.01'));
    this.registry.register(createZeroReportGenerator(ReportType.DUSN, '1152017', '5.09'));
    this.registry.register(createZeroReportGenerator(ReportType.FSS4, '1111111', '1.00'));
    this.registry.register(createZeroReportGenerator(ReportType.UV_VZNOSY, '1110355', '5.03'));
    this.registry.register(createZeroReportGenerator(ReportType.UUSN, '1110355', '5.03'));
  }
}
