import { Controller, Get, HttpStatus, HttpCode } from '@nestjs/common';

@Controller('health')
export class HealthController {
    @Get()
    @HttpCode(HttpStatus.OK)
    check() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}
