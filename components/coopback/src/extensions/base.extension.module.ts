import { OnModuleInit, Injectable } from '@nestjs/common';
import Joi from 'joi';
import { ExtensionDomainEntity } from '~/domain/extension/entities/extension-domain.entity';

@Injectable()
export abstract class BaseExtModule implements OnModuleInit {
  abstract name: string;
  abstract plugin: ExtensionDomainEntity<any>;
  public configSchemas = Joi.object<any>({});

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async onModuleInit() {}

  abstract initialize(): Promise<void>;
}
