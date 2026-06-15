import {ProjectStatus} from "../enums/project-status.enum";

export class CreateProjectDto {
    name: string;
    description?: string;
    status?: ProjectStatus;
    clientId: string;
    managerId: string;
}