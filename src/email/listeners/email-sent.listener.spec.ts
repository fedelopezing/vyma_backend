import { Test, TestingModule } from '@nestjs/testing';
import { EmailSentListener } from './email-sent.listener';
import { WhatsappMessagingService } from '../../whatsapp/whatsapp-messaging.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

describe('EmailSentListener', () => {
  let listener: EmailSentListener;
  let whatsappService: DeepMocked<WhatsappMessagingService>;

  beforeEach(async () => {
    whatsappService = createMock<WhatsappMessagingService>();

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
    const event = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      city: faker.location.city(),
      address: faker.location.streetAddress(),
      details: faker.lorem.paragraph(),
      subject: faker.lorem.sentence(),
    };
    whatsappService.sendMessage.mockResolvedValue({ success: true } as any);

    await listener.handleEmailSentEvent(event);
    expect(whatsappService.sendMessage).toHaveBeenCalled();
  });
});
