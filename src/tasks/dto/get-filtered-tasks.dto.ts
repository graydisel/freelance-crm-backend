import {IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID} from "class-validator";
import {TaskPriority} from "../enums/task-priority.enum";

export class GetFilteredTasksDto {
  @IsNotEmpty()
  @IsString()
  projectId!: string;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Not correct task priority' })
  priority?: TaskPriority | 'all';

  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
