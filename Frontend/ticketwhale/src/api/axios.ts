import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError, User } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// ─── Storage helpers ──────────────────────────────────────
export const storage = {
    getAccess: () => localStorage.getItem('accessToken'),
    getRefresh: () => localStorage.getItem('refreshToken'),
    getUser: (): User | null => {
        try { return JSON.parse(localStorage.getItem('user') ?? 'null') } catch { return null }
    },
    save: (accessToken: string, refreshToken: string, user: object) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
    },
    clear: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('auth-storage') // Zustand persist key
    },
}

// ─── Axios instance ───────────────────────────────────────
export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15_000,
})

// ─── Request: đính kèm accessToken ───────────────────────
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = storage.getAccess()
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (err) => Promise.reject(err),
)

// ─── Response: chuẩn hoá lỗi + auto refresh ──────────────
let isRefreshing = false
let pendingQueue: Array<{
    resolve: (token: string) => void
    reject: (err: unknown) => void
}> = []

const processQueue = (err: unknown, token: string | null) => {
    pendingQueue.forEach((p) => err ? p.reject(err) : p.resolve(token!))
    pendingQueue = []
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
        const status = error.response?.status ?? 0
        const data = error.response?.data as Record<string, unknown> | undefined

        // Chuẩn hoá lỗi
        const apiError: ApiError = {
            status,
            message: (data?.message as string) ?? error.message ?? 'Đã có lỗi xảy ra',
            errors: data?.errors as Record<string, string> | undefined,
        }

        const isAuthEndpoint = original?.url?.includes('/api/v1/auth/')

        // Không phải 401 hoặc là auth endpoint hoặc đã retry → trả lỗi bình thường
        if (status !== 401 || isAuthEndpoint || original._retry) {
            return Promise.reject(apiError)
        }

        const refreshToken = storage.getRefresh()

        // Không có refreshToken → logout
        if (!refreshToken) {
            storage.clear()
            window.dispatchEvent(new Event('auth:logout'))
            window.location.href = '/auth'
            return Promise.reject(apiError)
        }

        // Đang refresh → đẩy vào queue chờ
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                pendingQueue.push({
                    resolve: (token) => {
                        original.headers.Authorization = `Bearer ${token}`
                        resolve(apiClient(original))
                    },
                    reject: (err) => reject(err),
                })
            })
        }

        original._retry = true
        isRefreshing = true

        try {
            const { data: refreshData } = await axios.post(
                `${BASE_URL}/api/v1/auth/refresh`,
                { refreshToken },
                { headers: { 'Content-Type': 'application/json' } },
            )

            // Lưu token mới
            storage.save(refreshData.accessToken, refreshData.refreshToken, refreshData.user)

            // Thông báo AuthContext cập nhật user
            window.dispatchEvent(new CustomEvent('auth:refreshed', {
                detail: { user: refreshData.user, accessToken: refreshData.accessToken },
            }))

            processQueue(null, refreshData.accessToken)

            // Retry request gốc với token mới
            original.headers.Authorization = `Bearer ${refreshData.accessToken}`
            return apiClient(original)

        } catch (refreshErr) {
            processQueue(refreshErr, null)
            storage.clear()
            window.dispatchEvent(new Event('auth:logout'))
            window.location.href = '/auth'
            return Promise.reject(refreshErr)

        } finally {
            isRefreshing = false
        }
    },
)