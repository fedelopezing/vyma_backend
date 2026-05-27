import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
  let mockResendInstance: any;

  beforeEach(async () => {
    process.env.RESEND_API_KEY = 'test-api-key';
    mockEventEmitter = createMock<EventEmitter2>();

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
    mockResendInstance = (service as any).resend;
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
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
