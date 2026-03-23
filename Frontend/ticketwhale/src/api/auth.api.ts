import { apiClient } from './axios'
import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types'

export const authApi = {
    login: (payload: LoginPayload) =>
        apiClient.post<AuthResponse>('/api/v1/auth/login', payload),

    register: (payload: RegisterPayload) =>
        apiClient.post<AuthResponse>('/api/v1/auth/register', payload),
}