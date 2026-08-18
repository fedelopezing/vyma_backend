import { Test, TestingModule } from '@nestjs/testing';
import { EmailSentListener } from './email-sent.listener';
import { WhatsappMessagingService } from '../../whatsapp/whatsapp-messaging.service';
import { ConfigService } from '@nestjs/config';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

describe('EmailSentListener', () => {
  let listener: EmailSentListener;
  let whatsappService: DeepMocked<WhatsappMessagingService>;
  let mockConfigService: DeepMocked<ConfigService>;

  beforeEach(async () => {
    whatsappService = createMock<WhatsappMessagingService>();
    mockConfigService = createMock<ConfigService>({
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'WHATSAPP_TO') {
          return '+595981789843';
        }
        return null;
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSentListener,
        { provide: WhatsappMessagingService, useValue: whatsappService },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
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
    whatsappService.sendMessage.mockResolvedValue({ success: true } as never);

    await listener.handleEmailSentEvent(event);
    expect(whatsappService.sendMessage).toHaveBeenCalledWith(
      '+595981789843',
      expect.stringContaining(event.name),
    );
  });

  it('should use default phone number if WHATSAPP_TO is not set in config', async () => {
    mockConfigService.get.mockReturnValue(null);
    const event = {
      name: 'John',
      email: 'john@test.com',
      phone: '12345',
      city: 'Asuncion',
      address: 'Central',
      details: 'Test details',
    };
    whatsappService.sendMessage.mockResolvedValue({ success: true } as never);

    await listener.handleEmailSentEvent(event);
    expect(whatsappService.sendMessage).toHaveBeenCalledWith(
      '+595981789843',
      expect.stringContaining('John'),
    );
  });

  it('should catch errors when sending whatsapp message fails and not throw', async () => {
    const event = {
      name: 'John',
      email: 'john@test.com',
      phone: '12345',
      city: 'Asuncion',
      address: 'Central',
      details: 'Test details',
    };
    whatsappService.sendMessage.mockRejectedValue(new Error('WhatsApp error'));

    await expect(listener.handleEmailSentEvent(event)).resolves.toBeUndefined();
  });
});
