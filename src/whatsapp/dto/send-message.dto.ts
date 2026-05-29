import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Número de teléfono del destinatario en formato internacional',
    example: '595981789843',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'Mensaje de texto a enviar por WhatsApp',
    example: 'Hola, este es un mensaje de prueba de Harmonia.',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
