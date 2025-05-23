import { IsEmail, IsStrongPassword, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @MinLength(4)
  @IsEmail()
  email: string;

  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}
