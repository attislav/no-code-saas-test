import { User } from '@/lib/types';

// Auth Session Types
export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  expiresAt?: string;
}

// Login Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Register Types
export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  marketingEmails?: boolean;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Password Reset Types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

// OAuth Types
export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  color: string;
  url: string;
}

export interface OAuthCallback {
  provider: string;
  code: string;
  state?: string;
}

// Auth Error Types
export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  ACCOUNT_LOCKED = 'account_locked',
  TOO_MANY_ATTEMPTS = 'too_many_attempts',
  INVALID_TOKEN = 'invalid_token',
  TOKEN_EXPIRED = 'token_expired',
  USER_NOT_FOUND = 'user_not_found',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  WEAK_PASSWORD = 'weak_password',
  INVALID_EMAIL = 'invalid_email'
}

// Auth State Management
export interface AuthState {
  session: AuthSession;
  isLoading: boolean;
  error: AuthError | null;
}

// Auth Actions
export type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: { accessToken: string; refreshToken: string } } }
  | { type: 'AUTH_FAILURE'; payload: AuthError }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_REFRESH'; payload: { user: User; accessToken: string } }
  | { type: 'AUTH_CLEAR_ERROR' };

// Auth Context
export interface AuthContextType {
  session: AuthSession;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (request: ResetPasswordRequest) => Promise<void>;
  clearError: () => void;
} 