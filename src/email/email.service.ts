import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { CreateEmailDto } from './dto/create-email.dto';
import { biolimpiezaEmailTemplate } from './templates/biolimpieza.email';
import { welcomeActivationTemplate } from './templates/welcome-activation.email';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
  }

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
      const frontendUrl =
        this.configService.get<string>('FRONTEND_URL') ||
        'http://localhost:3000';
      const activationLink = `${frontendUrl}/auth/activate?token=${activationToken}`;
      const emailFrom =
        this.configService.get<string>('EMAIL_FROM') || 'no-reply@vyma.com';

      const email = await this.resend.emails.send({
        from: emailFrom,
        to: [to],
        subject: 'Activa tu cuenta en Vyma',
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

  async sendSystemAlert(
    subject: string,
    message: string,
  ): Promise<{ message: string; email: unknown }> {
    try {
      const emailFrom =
        this.configService.get<string>('EMAIL_FROM') || 'no-reply@vyma.com';
      const adminEmail =
        this.configService.get<string>('ADMIN_EMAIL') || 'admin@vyma.com';

      const email = await this.resend.emails.send({
        from: emailFrom,
        to: [adminEmail],
        subject,
        html: `<p>${message}</p>`,
      });

      return { message: 'Alerta del sistema enviada', email };
    } catch (error) {
      console.error('Error al enviar la alerta del sistema', error);
      throw new InternalServerErrorException(
        'Error al enviar la alerta del sistema',
      );
    }
  }
}
