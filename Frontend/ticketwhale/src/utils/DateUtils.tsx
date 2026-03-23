/**
 * Convert ISO datetime (UTC) sang UTC+7 (Asia/Ho_Chi_Minh)
 *
 * Backend trả về "2026-03-21T15:00:00" KHÔNG có Z suffix.
 * JavaScript sẽ coi đây là local time nếu không có Z → sai giờ.
 * Fix: thêm Z vào cuối để ép parse sang UTC trước khi convert.
 */

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

/** Ép chuỗi ISO thành UTC bằng cách thêm Z nếu chưa có */
function toUTC(iso: string): Date {
    const normalized = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
    return new Date(normalized);
}

/**
 * Format matchTime → "21:00 - 21/03/2026"
 */
export function formatMatchTimeVN(iso: string): string {
    const d = toUTC(iso);

    const time = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: VN_TIMEZONE,
    }).format(d);

    const date = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: VN_TIMEZONE,
    }).format(d);

    return `${time} - ${date}`;
}

/**
 * Format riêng date và time — dùng trong MatchDetailPage
 */
export function formatMatchDateTimeVN(iso: string): { date: string; time: string } {
    const d = toUTC(iso);

    const time = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: VN_TIMEZONE,
    }).format(d);

    const date = new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        timeZone: VN_TIMEZONE,
    }).format(d);

    return { date, time };
}

/**
 * Format ngắn: "21 thg 3, 2026" + "22:00" — dùng trong MatchCard, MatchesPage
 */
export function formatMatchShortVN(iso: string): { date: string; time: string } {
    const d = toUTC(iso);

    const time = new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: VN_TIMEZONE,
    }).format(d);

    const date = new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: VN_TIMEZONE,
    }).format(d);

    return { date, time };
}