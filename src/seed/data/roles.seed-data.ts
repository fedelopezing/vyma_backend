import { ValidRoles } from '../../auth/interfaces/valid-roles';

export const SEED_PERMISSIONS = [
  'read:professions',
  'read:services',
  'read:schedules',
  'write:schedules',
  'read:news',
  'write:news',
  'create:news',
  'update:news',
  'delete:news',
  'read:users',
  'write:users',
] as const;

export type SeedPermission = (typeof SEED_PERMISSIONS)[number];

export interface SeedRoleConfig {
  name: ValidRoles;
  permissions: SeedPermission[];
}

export const SEED_TABLES_ORDER = [
  'activation_tokens',
  'refresh_tokens',
  'schedule_breaks',
  'schedules',
  'services',
  'professions',
  'news',
  'profiles',
  'users',
  'roles',
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

const ALL_PERMS = [
  ...BASIC_PERMS,
  ...NEWS_PERMS,
  'read:users',
  'write:users',
] as SeedPermission[];

export const SEED_ROLES_CONFIG: SeedRoleConfig[] = [
  {
    name: ValidRoles.admin,
    permissions: ALL_PERMS,
  },
  { name: ValidRoles.professional, permissions: BASIC_PERMS },
  { name: ValidRoles.client, permissions: BASIC_PERMS },
  { name: ValidRoles.user, permissions: BASIC_PERMS },
  { name: ValidRoles.ccps, permissions: NEWS_PERMS },
];
