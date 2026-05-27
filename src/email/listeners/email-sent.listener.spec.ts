import { Test, TestingModule } from '@nestjs/testing';
import { EmailSentListener } from './email-sent.listener';
import { WhatsappMessagingService } from '../../whatsapp/whatsapp-messaging.service';

describe('EmailSentListener', () => {
  let listener: EmailSentListener;
  let whatsappService: jest.Mocked<Partial<WhatsappMessagingService>>;

  beforeEach(async () => {
    whatsappService = {
      sendMessage: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSentListener,
        { provide: WhatsappMessagingService, useValue: whatsappService },
      ],
    }).compile();

    listener = module.get<EmailSentListener>(EmailSentListener);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  it('should send a whatsapp message when email is sent', async () => {
    await listener.handleEmailSentEvent({
      name: 'Test',
      email: 'test@example.com',
      phone: '123',
      city: 'City',
      address: 'Address',
      details: 'Details',
      subject: 'Test Subject',
    });
    expect(whatsappService.sendMessage).toHaveBeenCalled();
  });
});
