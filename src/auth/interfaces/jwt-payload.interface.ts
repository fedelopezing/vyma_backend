export interface JwtPayload {
  sub: number;
  uuid: string;
  email: string;
  role: string;
  iat?: number;
}
