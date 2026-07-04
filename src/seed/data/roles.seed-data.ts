import { ValidRoles } from '../../auth/interfaces/valid-roles';

export const SEED_PERMISSIONS = [
  'read:professions',
  'write:professions',
  'read:services',
  'write:services',
  'read:schedules',
  'write:schedules',
  'read:news',
  'write:news',
  'create:news',
  'update:news',
  'delete:news',
  'read:events',
  'write:events',
  'create:events',
  'update:events',
  'delete:events',
  'read:users',
  'write:users',
  'read:companies',
  'write:companies',
  'read:schedule-breaks',
  'write:schedule-breaks',
  'read:ads',
  'write:ads',
  'create:ads',
  'update:ads',
  'delete:ads',
] as const;

export type SeedPermission = (typeof SEED_PERMISSIONS)[number];

export interface SeedRoleConfig {
  name: ValidRoles;
  permissions: SeedPermission[];
}

export const SEED_TABLES_ORDER = [
  // Nivel 5 — depende de schedules
  'schedule_breaks',
  // Nivel 4 — depende de profiles
  'schedules',
  // Nivel 3 — depende de users, companies, professions
  'members',
  'news',
  'events',
  'ads',
  'refresh_tokens',
  'activation_tokens',
  'profiles',
  'user_companies',
  // Nivel 2 — depende de roles, companies
  'services',
  'professions',
  'users',
  // Nivel 1
  'role_permissions',
  'roles',
  // Nivel 0 — sin dependencias
  'exchange_rates',
  'companies',
  'permissions',
] as const;

const BASIC_PERMS: SeedPermission[] = [
  'read:professions',
  'read:services',
  'read:schedules',
  'write:schedules',
];

const NEWS_PERMS: SeedPermission[] = [
  'read:news',
  'write:news',
  'create:news',
  'update:news',
  'delete:news',
];

const EVENTS_PERMS: SeedPermission[] = [
  'read:events',
  'write:events',
  'create:events',
  'update:events',
  'delete:events',
];

const ADS_PERMS: SeedPermission[] = [
  'read:ads',
  'write:ads',
  'create:ads',
  'update:ads',
  'delete:ads',
];

const ALL_PERMS = [
  ...BASIC_PERMS,
  ...NEWS_PERMS,
  ...EVENTS_PERMS,
  ...ADS_PERMS,
  'read:users',
  'write:users',
  'write:professions',
  'write:services',
  'read:companies',
  'write:companies',
  'read:schedule-breaks',
  'write:schedule-breaks',
] as SeedPermission[];

export const SEED_ROLES_CONFIG: SeedRoleConfig[] = [
  {
    name: ValidRoles.admin,
    permissions: ALL_PERMS,
  },
  { name: ValidRoles.professional, permissions: BASIC_PERMS },
  { name: ValidRoles.client, permissions: BASIC_PERMS },
  { name: ValidRoles.user, permissions: BASIC_PERMS },
  {
    name: ValidRoles.manager,
    permissions: [...BASIC_PERMS, ...NEWS_PERMS, ...EVENTS_PERMS, ...ADS_PERMS],
  },
];
