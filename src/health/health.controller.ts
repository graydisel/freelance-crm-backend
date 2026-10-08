import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
