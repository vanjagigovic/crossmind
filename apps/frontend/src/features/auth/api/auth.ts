import { post } from '../../../api/client'

export type User = {
  id: string
  email: string | null
  displayName: string
  isGuest: boolean
}

export type RegisterRequest = {
  email: string
  password: string
  displayName: string
}

export type RegisterResponse = User

export type LoginRequest = {
  email: string
  password: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: User
}

export type ForgotPasswordRequest = {
  email: string
}

export type ForgotPasswordResponse = {
  message: string
}

export type ResetPasswordRequest = {
  token: string
  newPassword: string
}

export type ResetPasswordResponse = {
  message: string
}

export function register(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  return post<RegisterResponse>('/auth/register', data)
}

export function login(
  data: LoginRequest,
): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/login', data)
}

export function guest(): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/guest', {})
}

export function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  return post<ForgotPasswordResponse>('/auth/forgot-password', data)
}

export function resetPassword(
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  return post<ResetPasswordResponse>('/auth/reset-password', data)
}

export function logout(refreshToken: string): Promise<void> {
  return post<void>('/auth/logout', { refreshToken })
}