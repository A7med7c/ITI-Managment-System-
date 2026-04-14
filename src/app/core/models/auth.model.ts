export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userName: string;
  displayName: string;
  phoneNumber: string;
}

export interface LoginResponse {
  email?: string;
  displayName?: string;
  token?: string;
  accessToken?: string;
  Token?: string;
  AccessToken?: string;
}
