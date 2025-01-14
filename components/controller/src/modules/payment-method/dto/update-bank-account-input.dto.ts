// payment-method.dto.ts
import { IsNotEmpty, IsString, IsDefined, IsBoolean } from 'class-validator';
import { BankAccountInputDTO } from './bank-account-input.dto';
import { Field, InputType } from '@nestjs/graphql';

@InputType('UpdateBankAccountInput')
export class UpdateBankAccountInputDTO {
  @Field(() => String, { description: 'Имя аккаунта пользователя' })
  @IsNotEmpty({ message: 'Имя аккаунта пользователя обязательно' })
  @IsString()
  username!: string;

  @Field(() => String, { description: 'Идентификатор платежного метода' })
  @IsNotEmpty({ message: 'Идентификатор метода обязателен' })
  @IsString()
  method_id!: string;

  @Field(() => Boolean, {
    description: 'Флаг основного метода платежа, который отображается в документах',
  })
  @IsNotEmpty({ message: 'Флаг основного метода платежа должен быть установлен' })
  @IsBoolean()
  is_default!: boolean;

  @Field(() => BankAccountInputDTO, { description: 'Данные банковского счёта' })
  @IsDefined({ message: 'Данные метода обязательны' })
  data!: BankAccountInputDTO;
}

// export class CreatePaymentMethodDTO {
//   @Field(() => String, { description: 'Тип метода оплаты' })
//   method_type!: 'sbp' | 'bank_transfer';

//   @Field(() => SBPDataDTO || BankAccountDTO, { description: 'Данные метода платежа' })
//   @IsDefined({ message: 'Данные метода обязательны' })
//   @ValidateNested()
//   @Type((options) => {
//     const object = options?.object as CreatePaymentMethodDTO;
//     if (object.method_type === 'sbp') {
//       return SBPDataDTO;
//     } else if (object.method_type === 'bank_transfer') {
//       return BankAccountDTO;
//     }
//     throw new Error('Invalid method_type');
//   })
//   data!: SBPDataDTO | BankAccountDTO;
// }
