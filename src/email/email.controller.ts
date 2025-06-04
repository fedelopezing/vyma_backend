import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('budget')
  sendBudget(@Body() createEmailDto: CreateEmailDto) {
    const emailTo = process.env.EMAIL_BIOLIMPIEZA_TO.split(',').map(email => email.trim()) || [];
    return this.emailService.sendEmail(createEmailDto, 'Biolimpieza <no-reply@send.biolimpieza.com.py>', emailTo);
  }

}
