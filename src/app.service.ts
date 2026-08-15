import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('Backend is running! Docker Hot Reloadasdasdasdasdd!');
    return 'Freelance CRM Backend is running!';
  }
}
