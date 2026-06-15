import { CreateClientDto } from './create-client.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateClientDto extends PartialType(CreateClientDto) {}
