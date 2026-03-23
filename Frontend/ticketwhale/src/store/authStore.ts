import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth.api'
import type { User, LoginPayload, RegisterPayload, ApiError } from '@/types'

// ─── State shape ──────────────────────────────────────────────────────────────

interface AuthState {
    user: User | null
    accessToken: string | null
    isLoading: boolean
    error: string | null

    // Actions
    setAuth: (user: User, token: string) => void
    login: (payload: LoginPayload) => Promise<void>
    register: (payload: RegisterPayload) => Promise<void>
    logout: () => void
    clearError: () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isLoading: false,
            error: null,

            // ── setAuth — dùng sau khi login/register thủ công ──────
            setAuth: (user: User, token: string) => {
                localStorage.setItem('accessToken', token)
                set({ user, accessToken: token, error: null })
            },

            // ── Login ───────────────────────────────────────────────
            login: async (payload) => {
                set({ isLoading: true, error: null })
                try {
                    const { data } = await authApi.login(payload)
                    localStorage.setItem('accessToken', data.accessToken)
                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        isLoading: false,
                    })
                } catch (err) {
                    const apiError = err as ApiError
                    set({
                        isLoading: false,
                        error: apiError.message ?? 'Đăng nhập thất bại',
                    })
                    throw err
                }
            },

            // ── Register ────────────────────────────────────────────
            register: async (payload) => {
                set({ isLoading: true, error: null })
                try {
                    const { data } = await authApi.register(payload)
                    localStorage.setItem('accessToken', data.accessToken)
                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        isLoading: false,
                    })
                } catch (err) {
                    const apiError = err as ApiError
                    set({
                        isLoading: false,
                        error: apiError.message ?? 'Đăng ký thất bại',
                    })
                    throw err
                }
            },

            // ── Logout ──────────────────────────────────────────────
            logout: () => {
                localStorage.removeItem('accessToken')
                set({ user: null, accessToken: null, error: null })
            },

            clearError: () => set({ error: null }),
        }),

        {
            name: 'auth-storage',
            // Chỉ persist user, không persist token (đã lưu localStorage riêng)
            partialize: (state) => ({ user: state.user }),
        },
    ),
)

// ─── Selectors ────────────────────────────────────────────

export const useIsAuthenticated = () =>
    useAuthStore((s) => s.accessToken !== null)

export const useCurrentUser = () =>
    useAuthStore((s) => s.user)