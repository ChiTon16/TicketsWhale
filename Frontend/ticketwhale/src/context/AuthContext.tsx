import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { apiClient, storage } from '@/api/axios'
import type { User } from '@/types'

// ─── Types ────────────────────────────────────────────────

interface AuthContextValue {
    user: User | null
    isAuthenticated: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

// ─── Context ──────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Khởi tạo từ localStorage nếu có
    const [user, setUser] = useState<User | null>(() => storage.getUser())

    const isAuthenticated = user !== null

    // Lắng nghe event logout/refreshed từ axios interceptor
    useEffect(() => {
        const handleLogout = () => setUser(null)

        const handleRefreshed = (e: Event) => {
            const detail = (e as CustomEvent).detail
            if (detail?.user) setUser(detail.user)
        }

        window.addEventListener('auth:logout', handleLogout)
        window.addEventListener('auth:refreshed', handleRefreshed)
        return () => {
            window.removeEventListener('auth:logout', handleLogout)
            window.removeEventListener('auth:refreshed', handleRefreshed)
        }
    }, [])

    // ── Login ──────────────────────────────────────────────
    const login = useCallback(async (email: string, password: string) => {
        const { data } = await apiClient.post('/api/v1/auth/login', { email, password })
        storage.save(data.accessToken, data.refreshToken, data.user)
        setUser(data.user)
    }, [])

    // ── Logout ─────────────────────────────────────────────
    const logout = useCallback(async () => {
        const refreshToken = storage.getRefresh()
        try {
            if (refreshToken) {
                await apiClient.post('/api/v1/auth/logout', { refreshToken })
            }
        } catch {
            // Bỏ qua lỗi logout — vẫn xoá local state
        } finally {
            storage.clear()
            setUser(null)
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

// ─── Hook ─────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}