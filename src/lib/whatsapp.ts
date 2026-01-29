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
 * Sends an automated WhatsApp message via UltraMsg API.
 */
export async function sendWhatsAppAPI(phone: string, message: string, instanceId: string, token: string) {
    try {
        const cleanPhone = phone.replace(/\+/g, '').replace(/\s/g, '')

        // UltraMsg API endpoint
        const url = `https://api.ultramsg.com/${instanceId}/messages/chat`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                token: token,
                to: cleanPhone,
                body: message,
                priority: '10',
            }),
        })

        const data = await response.json()
        if (data.sent === "true" || data.success) {
            return { success: true, messageId: data.id }
        } else {
            console.error("[WhatsApp API Error]", data)
            return { success: false, error: data.message || "Failed to send message" }
        }
    } catch (e) {
        console.error("[WhatsApp API Exception]", e)
        return { success: false, error: "Network or Server Error" }
    }
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
