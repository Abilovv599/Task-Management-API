import { IsNotEmpty } from 'class-validator';

export class ExchangeCodeDto {
  @IsNotEmpty()
  code: string;
}
