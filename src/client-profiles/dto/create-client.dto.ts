import { Transform } from 'class-transformer';
import { ClientStatus } from '../enums/client-status.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  companyName!: string;

  @IsNumber()
  contractValue?: number;

  @IsString()
  @IsNotEmpty({ message: 'Contact person is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  contactPerson!: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Contact email is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  contactEmail!: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone?: string;

  @IsOptional()
  @IsEnum(ClientStatus, { message: 'Not correct Client Status' })
  status?: ClientStatus;
}
