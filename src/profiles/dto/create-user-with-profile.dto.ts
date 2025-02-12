import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserWithProfileDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsEnum(['client', 'professional', 'admin'], {
    message: 'role must be either "client" or "professional"',
  })
  role?: 'client' | 'professional' | 'admin';

  @IsOptional()
  @IsNumber()
  professionId?: number;
}
