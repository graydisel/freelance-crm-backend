export enum Permission {
  PROJECTS_READ = 'projects:read',
  PROJECTS_CREATE = 'projects:create',
  PROJECTS_UPDATE = 'projects:update',
  PROJECTS_DELETE = 'projects:delete',

  TASKS_READ = 'tasks:read',
  TASKS_CREATE = 'tasks:create',
  TASKS_UPDATE = 'tasks:update',
  TASKS_UPDATE_STATUS = 'tasks:update_status',
  TASKS_COMPLETE = 'tasks:complete',
  TASKS_MANAGE_ALL = 'tasks:manage_all',
  TASKS_DELETE = 'tasks:delete',

  ANALYTICS_READ = 'analytics:read',

  // Clients
  CLIENTS_READ = 'clients:read',
  CLIENTS_CREATE = 'clients:create',
  CLIENTS_UPDATE = 'clients:update',
  CLIENTS_DELETE = 'clients:delete',
}
