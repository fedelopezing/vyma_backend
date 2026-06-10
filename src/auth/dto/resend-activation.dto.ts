import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendActivationDto {
  @ApiProperty({
    description:
      'Correo electrónico del usuario para reenviar el token de activación',
    example: 'usuario@example.com',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;
}
