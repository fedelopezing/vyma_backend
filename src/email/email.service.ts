import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateEmailDto } from './dto/create-email.dto';
import { biolimpiezaEmailTemplate } from './templates/biolimpieza.email';

@Injectable()
export class EmailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async sendEmail(data: CreateEmailDto, emailFrom: string, emailTo: string[]) {
    try {
      const email = await this.resend.emails.send({
        from: emailFrom,
        to: emailTo,
        subject: data.subject || 'Solicitud de presupuesto',
        html: biolimpiezaEmailTemplate(data),
      });

      //this.eventEmitter.emit('email.sent', data);

      return {
        message: `El correo ha sido enviado correctamente!`,
        email,
      };
    } catch {
      throw new Error('Error al enviar el correo');
    }
  }
}
