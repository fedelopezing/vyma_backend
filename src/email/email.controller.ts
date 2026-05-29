import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Endpoint público para el formulario de presupuesto de la web.
   * Protegido por rate limiting: máximo 5 solicitudes por IP cada 10 minutos
   * para prevenir abuso/spam sin requerir autenticación.
   */
  @Post('budget')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 600000, limit: 5 } }) // 5 req / 10 min por IP
  @ApiOperation({
    summary: 'Enviar solicitud de presupuesto (formulario público)',
    description:
      'Endpoint público. Limitado a 5 solicitudes por IP cada 10 minutos para prevenir spam.',
  })
  sendBudget(@Body() createEmailDto: CreateEmailDto) {
    const emailTo =
      process.env.EMAIL_BIOLIMPIEZA_TO?.split(',').map((email) =>
        email.trim(),
      ) ?? [];
    return this.emailService.sendEmail(
      createEmailDto,
      'Biolimpieza <no-reply@send.biolimpieza.com.py>',
      emailTo,
    );
  }
}
