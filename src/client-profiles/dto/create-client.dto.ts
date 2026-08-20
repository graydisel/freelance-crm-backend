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
  @Transform(
    ({ value }: { value: any }) =>
      (typeof value === 'string' ? value.trim() : value) as unknown,
  )
  companyName!: string;

  @IsNumber()
  contractValue?: number;

  @IsString()
  @IsNotEmpty({ message: 'Contact person is required' })
  @Transform(
    ({ value }: { value: any }) =>
      (typeof value === 'string' ? value.trim() : value) as unknown,
  )
  contactPerson!: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Contact email is required' })
  @Transform(
    ({ value }: { value: any }) =>
      (typeof value === 'string' ? value.trim() : value) as unknown,
  )
  contactEmail!: string;

  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Transform(
    ({ value }: { value: any }) =>
      (typeof value === 'string' ? value.trim() : value) as unknown,
  )
  phone?: string;

  @IsOptional()
  @IsEnum(ClientStatus, { message: 'Not correct Client Status' })
  status?: ClientStatus;
}
