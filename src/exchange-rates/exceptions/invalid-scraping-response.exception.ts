import { InternalServerErrorException as InternalServerError } from '@nestjs/common';

export class InvalidScrapingResponseException extends InternalServerError {
  constructor(detail?: string) {
    super(
      detail
        ? `Formato de respuesta inválido de Cambios Chaco: ${detail}`
        : 'Formato de respuesta inválido de la API de Cambios Chaco',
    );
  }
}
