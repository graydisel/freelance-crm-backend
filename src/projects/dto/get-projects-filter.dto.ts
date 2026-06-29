import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectStatus } from '../enums/project-status.enum';

export class GetProjectsFilterDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ProjectStatus, { message: 'Not correct project status' })
  status?: ProjectStatus | 'all';
}
