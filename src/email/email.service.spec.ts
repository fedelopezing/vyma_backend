import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

describe('EmailService', () => {
  let service: EmailService;

  // Mock WhatsappService
  const mockWhatsappService = {
    sendMessage: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    // Set up environment variable for Resend API key
    process.env.RESEND_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: WhatsappService,
          useValue: mockWhatsappService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    // Clean up environment variable
    delete process.env.RESEND_API_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
