import { apiClient } from './axios'
import type { CreatePaymentResponse } from '../types'

// Tạo URL thanh toán VNPay
export const createVNPayPayment = async (
    bookingId: string
): Promise<CreatePaymentResponse> => {
    const { data } = await apiClient.post(
        `/api/v1/payments/vnpay/${bookingId}`
    )
    return data
}