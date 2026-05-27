import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('EmailService', () => {
  let service: EmailService;

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    // Set up environment variable for Resend API key
    process.env.RESEND_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
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
