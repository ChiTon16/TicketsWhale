import { apiClient } from './axios'

export interface NewsArticle {
    title: string
    description: string | null
    url: string
    imageUrl: string | null
    publishedAt: string   // "05:30 22/03/2026"
    source: string
}

export const newsApi = {
    getAll: async (): Promise<NewsArticle[]> => {
        const { data } = await apiClient.get('/api/v1/news')
        return Array.isArray(data) ? data : data.content ?? []
    },
}