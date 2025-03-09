import { IsNotEmpty } from 'class-validator';

export class TwoFactorAuthCredentialsDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  otpCode: string;
}
