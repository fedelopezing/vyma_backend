export interface CompanyPreview {
  id: number;
  uuid: string;
  name: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    uuid: string;
    name: string;
    email: string;
    role?: string;
    company?: CompanyPreview;
  };
}

export interface SelectionResponse {
  requiresCompanySelection: true;
  selectionToken: string;
  companies: CompanyPreview[];
}

export interface MessageResponse {
  message: string;
}
