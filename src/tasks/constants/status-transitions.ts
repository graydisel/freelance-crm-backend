import { TaskStatus } from '../enums/task-status.enum';
import { RolesEnum } from '../../roles/enums/roles.enum';

export const STATUS_TRANSITIONS: Record<RolesEnum, TaskStatus[]> = {
  [RolesEnum.ADMIN]: [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.REVIEW,
    TaskStatus.DONE,
  ],
  [RolesEnum.MANAGER]: [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.REVIEW,
    TaskStatus.DONE,
  ],
  [RolesEnum.DEVELOPER]: [
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.REVIEW,
  ],
  [RolesEnum.CLIENT]: [],
};
