/**
 * Email Utility using Resend API
 * Handles all email notifications for the booking system
 */

import { Resend } from 'resend'

/**
 * Sends a booking notification email to admins and owners
 */
export async function sendBookingNotificationEmail(
    to: string,
    customerName: string,
    fieldName: string,
    bookingDate: string,
    bookingTime: string,
    apiKey: string,
    fromAddress: string
) {
    try {
        const resend = new Resend(apiKey)

        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: [to],
            subject: '🔔 حجز جديد - New Booking Alert',
            html: `
                <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">⚽ ملاعبنا</h1>
                        <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">نظام إدارة الحجوزات</p>
                    </div>
                    
                    <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h2 style="color: #10b981; margin-top: 0; font-size: 24px;">🔔 حجز جديد</h2>
                        <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">تم استلام طلب حجز جديد يتطلب مراجعتك:</p>
                        
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>👤 العميل:</strong> ${customerName}</p>
                            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>🏟️ الملعب:</strong> ${fieldName}</p>
                            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>📅 التاريخ:</strong> ${bookingDate}</p>
                            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>⏰ الوقت:</strong> ${bookingTime}</p>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">يرجى مراجعة لوحة التحكم للموافقة على الحجز أو رفضه.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                        <p>هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
                    </div>
                </div>
            `
        })

        if (error) {
            console.error('[Email Error]', error)
            return { success: false, error: error.message }
        }

        return { success: true, messageId: data?.id }
    } catch (e: any) {
        console.error('[Email Exception]', e)
        return { success: false, error: e.message || 'Failed to send email' }
    }
}

/**
 * Sends a booking confirmation email to the customer
 */
export async function sendBookingConfirmationEmail(
    to: string,
    customerName: string,
    fieldName: string,
    bookingDate: string,
    bookingTime: string,
    apiKey: string,
    fromAddress: string
) {
    try {
        const resend = new Resend(apiKey)

        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: [to],
            subject: '✅ تم تأكيد حجزك - Booking Confirmed',
            html: `
                <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">⚽ ملاعبنا</h1>
                        <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">نظام إدارة الحجوزات</p>
                    </div>
                    
                    <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h2 style="color: #10b981; margin-top: 0; font-size: 24px;">✅ تم تأكيد حجزك!</h2>
                        <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">مرحباً ${customerName}،</p>
                        <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">نحن سعداء بإبلاغك أن حجزك قد تم تأكيده بنجاح!</p>
                        
                        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>🏟️ الملعب:</strong> ${fieldName}</p>
                            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>📅 التاريخ:</strong> ${bookingDate}</p>
                            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>⏰ الوقت:</strong> ${bookingTime}</p>
                        </div>
                        
                        <p style="color: #10b981; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0;">نتمنى لك مباراة ممتعة! ⚽</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                        <p>هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
                    </div>
                </div>
            `
        })

        if (error) {
            console.error('[Email Error]', error)
            return { success: false, error: error.message }
        }

        return { success: true, messageId: data?.id }
    } catch (e: any) {
        console.error('[Email Exception]', e)
        return { success: false, error: e.message || 'Failed to send email' }
    }
}

/**
 * Sends a booking rejection email to the customer
 */
export async function sendBookingRejectionEmail(
    to: string,
    customerName: string,
    fieldName: string,
    bookingDate: string,
    bookingTime: string,
    apiKey: string,
    fromAddress: string
) {
    try {
        const resend = new Resend(apiKey)

        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: [to],
            subject: '❌ تم رفض حجزك - Booking Rejected',
            html: `
                <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">⚽ ملاعبنا</h1>
                        <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">نظام إدارة الحجوزات</p>
                    </div>
                    
                    <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <h2 style="color: #ef4444; margin-top: 0; font-size: 24px;">❌ تم رفض حجزك</h2>
                        <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">مرحباً ${customerName}،</p>
                        <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">للأسف، تم رفض طلب حجزك للأسباب التالية:</p>
                        
                        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>🏟️ الملعب:</strong> ${fieldName}</p>
                            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>📅 التاريخ:</strong> ${bookingDate}</p>
                            <p style="margin: 8px 0; color: #374151; font-size: 15px;"><strong>⏰ الوقت:</strong> ${bookingTime}</p>
                        </div>
                        
                        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">يرجى التواصل مع الإدارة لمعرفة التفاصيل أو اختيار موعد آخر.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                        <p>هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
                    </div>
                </div>
            `
        })

        if (error) {
            console.error('[Email Error]', error)
            return { success: false, error: error.message }
        }

        return { success: true, messageId: data?.id }
    } catch (e: any) {
        console.error('[Email Exception]', e)
        return { success: false, error: e.message || 'Failed to send email' }
    }
}
