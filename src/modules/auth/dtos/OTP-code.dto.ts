import { IsNotEmpty } from 'class-validator';

export class OtpCodeDto {
  @IsNotEmpty()
  otpCode: string;
}
