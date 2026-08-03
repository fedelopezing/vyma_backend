export interface CompanyPreview {
  id: number;
  uuid: string;
  name: string;
  role?: string;
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
  user: {
    uuid: string;
    name: string;
    email: string;
  };
  companies: CompanyPreview[];
}

export interface MessageResponse {
  message: string;
}
