import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsNumber,
} from 'class-validator';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  durationMinutes: number;

  @IsNotEmpty()
  @IsNumber({}, { message: 'Price must be a valid number' })
  @IsPositive()
  price: number;
}
