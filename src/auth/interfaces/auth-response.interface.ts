export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    uuid: string;
    name: string;
    email: string;
    role?: string;
  };
}

export interface MessageResponse {
  message: string;
}
