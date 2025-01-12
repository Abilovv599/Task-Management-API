import { IsStrongPassword, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsStrongPassword()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}
