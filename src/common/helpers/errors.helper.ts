import { ConflictException, NotFoundException } from '@nestjs/common';

export const handleDBErrors = (message: string, error?: any): never => {
  if (error.code === '23505')
    throw new ConflictException(`${message} ya existe, por favor ingrese otro nombre`);

  throw new NotFoundException(`${message} no existe`);
}