import { useState, useEffect } from 'react'
import { matchApi } from '@/api/match.api'
import type { Match, ApiError } from '@/types'

interface UseMatchesResult {
    matches: Match[]
    isLoading: boolean
    error: string | null
    refetch: () => void
}

/**
 * Lấy danh sách trận đấu từ API.
 * Handle cả 2 dạng response: array[] và PaginatedResponse { content: [] }
 * @param limit  Nếu truyền vào thì chỉ trả về `limit` trận đầu tiên.
 */
export function useMatches(limit?: number): UseMatchesResult {
    const [matches, setMatches] = useState<Match[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [tick, setTick] = useState(0)

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const { data } = await matchApi.getAll()

                if (cancelled) return

                // Handle cả array thẳng lẫn { content: Match[] }
                const all: Match[] = Array.isArray(data)
                    ? data
                    : (data as { content: Match[] }).content ?? []

                setMatches(limit ? all.slice(0, limit) : all)
            } catch (err) {
                if (cancelled) return
                const apiErr = err as ApiError
                setError(apiErr.message ?? 'Không thể tải danh sách trận đấu')
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        load()
        return () => { cancelled = true }
    }, [tick, limit])

    return {
        matches,
        isLoading,
        error,
        refetch: () => setTick((t) => t + 1),
    }
}