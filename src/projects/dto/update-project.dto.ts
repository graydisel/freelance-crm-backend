import { ProjectStatus } from '../enums/project-status.enum';

export class UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  clientId?: string;
  managerId?: string;
}
