import { apiClient } from './axios'

export interface StadiumDto {
    name: string
    team: string
    city: string
    location: string
    capacity: number
    yearOpened: number
    imageUrl: string
    wikipediaUrl: string
}

export const stadiumApi = {
    getAll: async (): Promise<StadiumDto[]> => {
        const { data } = await apiClient.get('/api/v1/stadiums')
        return Array.isArray(data) ? data : data.content ?? []
    },

    getByName: async (name: string): Promise<StadiumDto> => {
        const { data } = await apiClient.get(`/api/v1/stadiums/${encodeURIComponent(name)}`)
        return data
    },
}