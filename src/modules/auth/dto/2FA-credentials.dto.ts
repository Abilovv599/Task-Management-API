import { IsEmail, IsNotEmpty } from 'class-validator';

export class TwoFactorAuthCredentialsDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otpCode: string;
}
