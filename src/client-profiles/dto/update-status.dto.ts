import { IsEnum, IsNotEmpty } from 'class-validator';
import { ClientStatus } from '../enums/client-status.enum';

export class UpdateStatusDto {
  @IsNotEmpty()
  @IsEnum(ClientStatus)
  status: ClientStatus;
}
