/**
 * WhatsApp Messaging Utility
 * Supports direct chat links and automated message templates.
 */

export const WHATSAPP_BASE_URL = "https://wa.me/"

/**
 * Generates a WhatsApp chat link with an optional pre-filled message.
 * @param phone The phone number with country code (e.g., 201012345678)
 * @param message Optional text message
 */
export function getWhatsAppChatLink(phone: string, message?: string) {
    const cleanPhone = phone.replace(/\+/g, '').replace(/\s/g, '')
    const url = new URL(`${WHATSAPP_BASE_URL}${cleanPhone}`)
    if (message) {
        url.searchParams.append('text', message)
    }
    return url.toString()
}

/**
 * Formats a message for booking confirmation.
 */
export function formatBookingConfirmedMessage(fieldName: string, date: string, time: string) {
    return `تم تأكيد حجزك بنجاح! ✅\n\n🏟️ الملعب: ${fieldName}\n📅 التاريخ: ${date}\n⏰ الوقت: ${time}\n\nنتمنى لك مباراة ممتعة! ⚽`
}

/**
 * Formats a message for booking rejection.
 */
export function formatBookingRejectedMessage(fieldName: string) {
    return `للأسف تم رفض حجزك في ملعب ${fieldName} ❌\n\nيرجى التواصل مع الإدارة لمعرفة التفاصيل أو اختيار موعد آخر.`
}

/**
 * Formats a message for password reset.
 */
export function formatPasswordResetMessage(otp: string) {
    return `كود إعادة تعيين كلمة المرور هو: ${otp} 🔑\n\nإذا لم تطلب هذا الكود، يرجى تجاهل هذه الرسالة.`
}
