import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ConfigService } from '@nestjs/config';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { faker } from '@faker-js/faker';

describe('EmailController', () => {
  let controller: EmailController;
  let mockEmailService: DeepMocked<EmailService>;

  beforeEach(async () => {
    mockEmailService = createMock<EmailService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>({
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'EMAIL_BIOLIMPIEZA_TO') {
                return 'test1@test.com,test2@test.com';
              }
              return null;
            }),
          }),
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should send budget email successfully', async () => {
    const dto = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      city: faker.location.city(),
      address: faker.location.streetAddress(),
      details: faker.lorem.paragraph(),
    };
    const expectedResult = {
      message: 'El correo ha sido enviado correctamente!',
      email: { id: faker.string.uuid() },
    };
    mockEmailService.sendEmail.mockResolvedValue(expectedResult as never);

    expect(await controller.sendBudget(dto as never)).toEqual(expectedResult);
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
      dto,
      'Biolimpieza <no-reply@send.biolimpieza.com.py>',
      ['test1@test.com', 'test2@test.com'],
    );
  });
});
