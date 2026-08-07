import { PartialType } from '@nestjs/swagger';
import { CreateClientRepresentativeDto } from './create-client-representative.dto';

export class UpdateClientRepresentativeDto extends PartialType(
  CreateClientRepresentativeDto,
) {}
