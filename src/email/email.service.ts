import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { CreateEmailDto } from './dto/create-email.dto';
import { biolimpiezaEmailTemplate } from './templates/biolimpieza.email';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class EmailService {
  private readonly resend = new Resend(process.env.RESEND_API_KEY);

  constructor(private readonly whatsappService: WhatsappService) {}

  async sendEmail(data: CreateEmailDto, emailFrom: string, emailTo: string[]) {
    try {
      const email = await this.resend.emails.send({
        from: emailFrom,
        to: emailTo,
        subject: data.subject || 'Solicitud de presupuesto',
        html: biolimpiezaEmailTemplate(data),
      });

      try {
        await this.sendMessage(data);
      } catch (error) {
        console.error('Error al enviar mensaje de WhatsApp:', error);
      }

      return {
        message: `El correo ha sido enviado correctamente!`,
        email,
      };
    } catch (error) {
      throw new Error('Error al enviar el correo');
    }
  }

  async sendMessage(data: CreateEmailDto) {
    const phoneNumber = process.env.WHATSAPP_TO || '+595981789843';
    const message = `*Asunto:* Esta persona ha solicitado un presupuesto
    *Nombre:* ${data.name}
    *Email:* ${data.email}
    *Numero:* ${data.phone}
    *Ciudad:* ${data.city}
    *Dirección:* ${data.address}
    *Detalle:* ${data.details}`;

    return await this.whatsappService.sendMessage(phoneNumber, message);
  }
}
