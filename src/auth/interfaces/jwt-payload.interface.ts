export interface JwtPayload {
  sub: number;
  uuid: string;
  email: string;
  role: string;
  companyId?: number;
  companyUuid?: string;
  isSuperAdmin: boolean;
  iat?: number;
  exp?: number;
}
