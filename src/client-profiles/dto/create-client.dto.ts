import { ClientStatus } from '../enums/client-status.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsNumber()
  contractValue?: number;

  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(ClientStatus, { message: 'Not correct Client Status' })
  status?: ClientStatus;
}
