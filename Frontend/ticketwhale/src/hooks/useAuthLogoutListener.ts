import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

/**
 * Lắng nghe event 'auth:logout' từ axios interceptor.
 * Đặt hook này trong App.tsx để clear Zustand state khi token hết hạn.
 *
 * Usage trong App.tsx:
 *   import { useAuthLogoutListener } from '@/hooks/useAuthLogoutListener'
 *   function App() {
 *     useAuthLogoutListener()
 *     ...
 *   }
 */
export function useAuthLogoutListener() {
    const logout = useAuthStore((s) => s.logout)

    useEffect(() => {
        const handler = () => logout()
        window.addEventListener('auth:logout', handler)
        return () => window.removeEventListener('auth:logout', handler)
    }, [logout])
}