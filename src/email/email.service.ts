import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateEmailDto } from './dto/create-email.dto';
import { biolimpiezaEmailTemplate } from './templates/biolimpieza.email';
import { welcomeActivationTemplate } from './templates/welcome-activation.email';

@Injectable()
export class EmailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  async sendEmail(
    data: CreateEmailDto,
    emailFrom: string,
    emailTo: string[],
  ): Promise<{ message: string; email: unknown }> {
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
      throw new InternalServerErrorException('Error al enviar el correo');
    }
  }

  async sendActivationEmail(
    to: string,
    name: string,
    activationToken: string,
  ): Promise<{ message: string; email: unknown }> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const activationLink = `${frontendUrl}/auth/activate?token=${activationToken}`;
      const emailFrom = process.env.EMAIL_FROM || 'no-reply@harmonia.com';

      const email = await this.resend.emails.send({
        from: emailFrom,
        to: [to],
        subject: 'Activa tu cuenta en Harmonia',
        html: welcomeActivationTemplate(name, activationLink),
      });

      return { message: 'Correo de activación enviado', email };
    } catch (error) {
      console.error('Error al enviar el correo de activación', error);
      throw new InternalServerErrorException(
        'Error al enviar el correo de activación',
      );
    }
  }
}
