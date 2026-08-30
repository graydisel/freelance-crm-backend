import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProjectStatus } from '../enums/project-status.enum';

export class UpdateProjectStatusDto {
  @IsNotEmpty()
  @IsEnum(ProjectStatus)
  newStatus!: ProjectStatus;
}
