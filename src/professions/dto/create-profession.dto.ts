import { IsString, MinLength } from 'class-validator';

export class CreateProfessionDto {
  @IsString()
  @MinLength(3)
  name: string;
}
