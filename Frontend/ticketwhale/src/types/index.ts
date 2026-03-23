export type UserRole = 'USER' | 'ADMIN'
export type MatchStatus = 'SCHEDULED' | 'ONGOING' | 'FINISHED' | 'CANCELLED'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED'
export type TicketStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'
export type BlockStatus = 'AVAILABLE' | 'SOLD_OUT'

// ── Auth ──────────────────────────────────────────────────
export interface User {
    id: string
    email: string
    fullName: string
    role: UserRole
}

export interface AuthResponse {
    accessToken: string
    refreshToken: string   // ← thêm
    tokenType: string
    user: User
}

// ── Payment ───────────────────────────────────────────────
export interface CreatePaymentResponse {
    paymentUrl: string
}

export interface PaymentCallbackResponse {
    success: boolean
    message: string
    responseCode: string
    bookingId: string
}

export interface TicketQrResponse {
    qrCode: string      // base64 PNG
    bookingId: string
    status: string
}

// ── Match ─────────────────────────────────────────────────
export interface Match {
    id: string
    homeTeam: string
    awayTeam: string
    homeCrest: string | null
    awayCrest: string | null
    matchTime: string              // ISO 8601 UTC → convert sang UTC+7 khi hiển thị
    status: MatchStatus
    matchday: number | null
    stadiumName: string | null
    aiSummary: string | null       // Phân tích AI, null = không hiển thị
}

// ── Section + Block ───────────────────────────────────────
export interface Block {
    id: string
    name: string
    price: number
    totalTickets: number
    availableTickets: number
    status: BlockStatus
}

export interface Section {
    id: string
    name: string
    stand: string             // "EAST STAND", "NORTH STAND", ...
    price: number
    totalSeats: number
    availableSeats: number
    blocks: Block[]
}

// ── Booking + Ticket ──────────────────────────────────────
export interface Ticket {
    id: string
    sectionId: string
    sectionName: string
    price: number
    status: TicketStatus
}

export interface MatchInfo {
    id: string
    homeTeam: string
    awayTeam: string
    homeCrest: string | null
    awayCrest: string | null
    matchTime: string
    stadiumName: string | null
}

export interface Booking {
    id: string
    userId: string
    totalAmount: number
    status: BookingStatus
    expiresAt: string
    createdAt: string
    paidAt: string | null
    paymentCode: string | null
    tickets: Ticket[]
    match: MatchInfo | null
}

// ── Request Payloads ──────────────────────────────────────
export interface RegisterPayload {
    email: string
    password: string
    fullName: string
}

export interface LoginPayload {
    email: string
    password: string
}

export interface CreateBookingPayload {
    matchId: string
    sectionId: string
    quantity: number
    userEmail: string
    userFullName: string
}

// ── API Error ─────────────────────────────────────────────
export interface ApiError {
    message: string
    status: number
    errorCode?: string
    timestamp?: string
    errors?: Record<string, string>
}

export interface PaginatedResponse<T> {
    content: T[]
    totalPages?: number
    totalElements?: number
    size?: number
    number?: number
    first?: boolean
    last?: boolean
    empty?: boolean
}