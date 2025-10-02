import { ObjectType, Field } from '@nestjs/graphql';
import { IsString, IsNumber } from 'class-validator';

@ObjectType('Symbols')
export class SymbolsDTO {
  @Field(() => String, { description: 'Корневой символ блокчейна' })
  @IsString()
  public readonly root_symbol: string;

  @Field(() => String, { description: 'Символ управления блокчейном' })
  @IsString()
  public readonly root_govern_symbol: string;

  @Field(() => Number, { description: 'Точность корневого символа' })
  @IsNumber()
  public readonly root_precision: number;

  @Field(() => Number, { description: 'Точность символа управления' })
  @IsNumber()
  public readonly root_govern_precision: number;

  constructor(root_symbol: string, root_govern_symbol: string, root_precision: number, root_govern_precision: number) {
    this.root_symbol = root_symbol;
    this.root_govern_symbol = root_govern_symbol;
    this.root_precision = root_precision;
    this.root_govern_precision = root_govern_precision;
  }
}
