import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: jest.fn(),
        },
      };
    }),
  };
});

describe('EmailService', () => {
  let service: EmailService;
  let mockEventEmitter: DeepMocked<EventEmitter2>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockResendInstance: any;

  beforeEach(async () => {
    mockEventEmitter = createMock<EventEmitter2>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>({
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'RESEND_API_KEY') return 'test-api-key';
              if (key === 'FRONTEND_URL') return 'http://localhost:3000';
              if (key === 'EMAIL_FROM') return 'no-reply@vyma.com';
              if (key === 'ADMIN_EMAIL') return 'admin@vyma.com';
              return null;
            }),
          }),
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mockResendInstance = service['resend'];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const data = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        city: faker.location.city(),
        address: faker.location.streetAddress(),
        details: faker.lorem.paragraph(),
        subject: faker.lorem.sentence(),
      };
      const emailFrom = 'from@test.com';
      const emailTo = ['to@test.com'];
      const expectedResponse = { id: faker.string.uuid() };
      mockResendInstance.emails.send.mockResolvedValue(expectedResponse);

      const result = await service.sendEmail(data, emailFrom, emailTo);

      expect(result.message).toBe('El correo ha sido enviado correctamente!');
      expect(result.email).toEqual(expectedResponse);
      expect(mockResendInstance.emails.send).toHaveBeenCalled();
    });

    it('should throw an error when resend fails', async () => {
      const data = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        city: faker.location.city(),
        address: faker.location.streetAddress(),
        details: faker.lorem.paragraph(),
      };
      mockResendInstance.emails.send.mockRejectedValue(
        new Error('Resend fail'),
      );

      await expect(
        service.sendEmail(data, 'from@test.com', ['to@test.com']),
      ).rejects.toThrow('Error al enviar el correo');
    });
  });
});
