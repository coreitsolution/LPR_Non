import { Pagination, User } from "../types";

export interface AuthData {
  token: string | null;
  isAuthenticated: boolean;
  userInfo: User | null;
  userId: number;
}

export interface UserInfoResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: User[]
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  statusCode: number
  status: string
  success: boolean
  message: string
  userId: number
}

export interface RefreshTokenResponse {
  accessToken: string
}