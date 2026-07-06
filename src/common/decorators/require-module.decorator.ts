import { SetMetadata } from '@nestjs/common';
import { CompanyModule } from '../constants/modules.enum';

export const MODULES_KEY = 'required_modules';
export const RequireModule = (...modules: CompanyModule[]) =>
  SetMetadata(MODULES_KEY, modules);
