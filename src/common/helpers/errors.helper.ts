import { ConflictException, NotFoundException } from '@nestjs/common';

export const handleDBErrors = (message: string, error?: unknown): never => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as Record<string, unknown>).code === '23505'
  ) {
    throw new ConflictException(
      `${message} ya existe, por favor ingrese otro nombre`,
    );
  }

  throw new NotFoundException(`${message} no existe`);
};
