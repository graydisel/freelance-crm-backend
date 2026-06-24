import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Not correct email format' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  passwordHash: string;

  firstName: string;
  lastName: string;
  roleName: string;
  companyId?: string;
}
