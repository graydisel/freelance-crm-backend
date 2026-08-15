import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('Backend is running!');
    return 'Freelance CRM Backend is running!';
  }
}
