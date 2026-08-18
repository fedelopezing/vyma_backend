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
  let mockConfigService: DeepMocked<ConfigService>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockResendInstance: any;

  beforeEach(async () => {
    mockEventEmitter = createMock<EventEmitter2>();
    mockConfigService = createMock<ConfigService>({
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'RESEND_API_KEY') return 'test-api-key';
        if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        if (key === 'EMAIL_FROM') return 'no-reply@vyma.com';
        if (key === 'ADMIN_EMAIL') return 'admin@vyma.com';
        return null;
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
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
    it('should send email successfully with custom subject', async () => {
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

    it('should send email with default subject when not provided', async () => {
      const data = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        city: faker.location.city(),
        address: faker.location.streetAddress(),
        details: faker.lorem.paragraph(),
      };
      const emailFrom = 'from@test.com';
      const emailTo = ['to@test.com'];
      const expectedResponse = { id: faker.string.uuid() };
      mockResendInstance.emails.send.mockResolvedValue(expectedResponse);

      const result = await service.sendEmail(data, emailFrom, emailTo);

      expect(result.message).toBe('El correo ha sido enviado correctamente!');
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Solicitud de presupuesto',
        }),
      );
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

  describe('sendActivationEmail', () => {
    it('should send activation email successfully', async () => {
      const expectedResponse = { id: 'act-1' };
      mockResendInstance.emails.send.mockResolvedValue(expectedResponse);

      const result = await service.sendActivationEmail(
        'user@test.com',
        'John',
        'token-123',
      );

      expect(result).toEqual({
        message: 'Correo de activación enviado',
        email: expectedResponse,
      });
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith({
        from: 'no-reply@vyma.com',
        to: ['user@test.com'],
        subject: 'Activa tu cuenta en Vyma',
        html: expect.stringContaining('token=token-123'),
      });
    });

    it('should use fallback urls and sender when config returns null', async () => {
      mockConfigService.get.mockReturnValue(null);
      const expectedResponse = { id: 'act-2' };
      mockResendInstance.emails.send.mockResolvedValue(expectedResponse);

      const result = await service.sendActivationEmail(
        'user@test.com',
        'John',
        'token-456',
      );

      expect(result.email).toEqual(expectedResponse);
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'no-reply@vyma.com',
          html: expect.stringContaining(
            'http://localhost:3000/auth/activate?token=token-456',
          ),
        }),
      );
    });

    it('should throw InternalServerErrorException when sendActivationEmail fails', async () => {
      mockResendInstance.emails.send.mockRejectedValue(
        new Error('Resend error'),
      );

      await expect(
        service.sendActivationEmail('user@test.com', 'John', 'token-123'),
      ).rejects.toThrow('Error al enviar el correo de activación');
    });
  });

  describe('sendSystemAlert', () => {
    it('should send system alert email successfully', async () => {
      const expectedResponse = { id: 'alert-1' };
      mockResendInstance.emails.send.mockResolvedValue(expectedResponse);

      const result = await service.sendSystemAlert(
        'Alert Subject',
        'Alert Message',
      );

      expect(result).toEqual({
        message: 'Alerta del sistema enviada',
        email: expectedResponse,
      });
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith({
        from: 'no-reply@vyma.com',
        to: ['admin@vyma.com'],
        subject: 'Alert Subject',
        html: '<p>Alert Message</p>',
      });
    });

    it('should use fallback config values when not configured in env', async () => {
      mockConfigService.get.mockReturnValue(null);
      const expectedResponse = { id: 'alert-2' };
      mockResendInstance.emails.send.mockResolvedValue(expectedResponse);

      const result = await service.sendSystemAlert(
        'Alert Subject',
        'Alert Message',
      );

      expect(result.email).toEqual(expectedResponse);
      expect(mockResendInstance.emails.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'no-reply@vyma.com',
          to: ['admin@vyma.com'],
        }),
      );
    });

    it('should throw InternalServerErrorException when sendSystemAlert fails', async () => {
      mockResendInstance.emails.send.mockRejectedValue(
        new Error('Resend error'),
      );

      await expect(
        service.sendSystemAlert('Alert Subject', 'Alert Message'),
      ).rejects.toThrow('Error al enviar la alerta del sistema');
    });
  });
});
