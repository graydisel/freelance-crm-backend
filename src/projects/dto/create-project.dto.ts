import { ProjectStatus } from '../enums/project-status.enum';

import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNotEmpty,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsUUID()
  @IsNotEmpty()
  clientId!: string;

  @IsUUID()
  @IsNotEmpty()
  managerId!: string;
}
