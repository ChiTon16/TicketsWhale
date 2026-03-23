import { apiClient } from './axios'
import type { Match, Section } from '@/types'

export const matchApi = {
    getAll: () =>
        apiClient.get<Match[]>('/api/v1/matches'),

    getById: (matchId: string) =>
        apiClient.get<Match>(`/api/v1/matches/${matchId}`),

    getSections: (matchId: string) =>
        apiClient.get<Section[]>(`/api/v1/matches/${matchId}/sections`),
}