import { apiClient } from './axios'
import type { Booking, CreateBookingPayload, CreatePaymentResponse } from '@/types'

// ── Booking ───────────────────────────────────────────────

export const bookingApi = {
    create: async (payload: CreateBookingPayload): Promise<Booking> => {
        const { data } = await apiClient.post('/api/v1/bookings', payload)
        return data
    },

    getMyBookings: async (): Promise<Booking[]> => {
        const { data } = await apiClient.get('/api/v1/bookings')
        // Handle cả array thẳng lẫn { content: [] }
        return Array.isArray(data) ? data : data.content ?? []
    },

    getById: async (bookingId: string): Promise<Booking> => {
        const { data } = await apiClient.get(`/api/v1/bookings/${bookingId}`)
        return data
    },

    cancel: async (bookingId: string): Promise<void> => {
        await apiClient.delete(`/api/v1/bookings/${bookingId}`)
    },
}

// ── Payment ───────────────────────────────────────────────

export const paymentApi = {
    createVNPay: async (bookingId: string): Promise<CreatePaymentResponse> => {
        const { data } = await apiClient.post(`/api/v1/payments/vnpay/${bookingId}`)
        return data
    },

    /** Lấy QR code dạng base64 JSON */
    getTicketQR: (bookingId: string) =>
        apiClient.get<{ status: string; bookingId: string; qrCode: string }>(
            `/api/v1/payments/ticket-qr/${bookingId}`
        ),
}