import { Test, TestingModule } from '@nestjs/testing';
import { UserCreatedListener } from './user-created.listener';
import { EmailService } from '../../email/email.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { User } from '../entities/user.entity';

describe('UserCreatedListener', () => {
  let listener: UserCreatedListener;
  let mockEmailService: DeepMocked<EmailService>;

  beforeEach(async () => {
    mockEmailService = createMock<EmailService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCreatedListener,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    listener = module.get<UserCreatedListener>(UserCreatedListener);
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  describe('handleUserCreatedEvent', () => {
    it('should call emailService.sendActivationEmail with correct parameters', async () => {
      const user = new User();
      user.email = 'test@example.com';
      user.name = 'Test User';
      const activationToken = 'raw-token-123';

      await listener.handleUserCreatedEvent({ user, activationToken });

      expect(mockEmailService.sendActivationEmail).toHaveBeenCalledWith(
        user.email,
        user.name,
        activationToken,
      );
    });

    it('should catch errors from emailService and not rethrow', async () => {
      const user = new User();
      user.email = 'test@example.com';
      user.name = 'Test User';
      const activationToken = 'raw-token-123';

      mockEmailService.sendActivationEmail.mockRejectedValue(
        new Error('Email service down'),
      );

      // We expect the promise to resolve, not reject, because the error is caught
      await expect(
        listener.handleUserCreatedEvent({ user, activationToken }),
      ).resolves.toBeUndefined();

      expect(mockEmailService.sendActivationEmail).toHaveBeenCalledWith(
        user.email,
        user.name,
        activationToken,
      );
    });
  });
});
