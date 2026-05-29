import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

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

  throw new InternalServerErrorException(
    `Error inesperado al procesar ${message}`,
  );
};

export const getErrorMessage = (
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred',
): string => {
  return error instanceof Error ? error.message : defaultMessage;
};

export const getErrorStack = (error: unknown): string | undefined => {
  return error instanceof Error ? error.stack : String(error);
};
