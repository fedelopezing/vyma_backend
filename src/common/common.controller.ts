import { ApiTags } from '@nestjs/swagger';
import { Controller } from '@nestjs/common';
import { CommonService } from './common.service';

@ApiTags('Common')
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}
}
