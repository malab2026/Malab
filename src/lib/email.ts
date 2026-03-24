/**
 * Email Utility supporting both SMTP (Nodemailer) and Resend API
 * Handles all email notifications for the booking system
 */

import { Resend } from 'resend'
import nodemailer from 'nodemailer'

export interface SmtpConfig {
    host: string
    port: number
    user: string
    pass: string
    secure: boolean
}

/**
 * Shared helper to send email via SMTP or Resend
 */
async function sendEmail({
    to,
    subject,
    html,
    fromAddress,
    apiKey,
    smtp
}: {
    to: string,
    subject: string,
    html: string,
    fromAddress: string,
    apiKey?: string | null,
    smtp?: SmtpConfig | null
}) {
    // 1. Try SMTP if configured
    if (smtp?.host && smtp?.user && smtp?.pass) {
        try {
            const transporter = nodemailer.createTransport({
                host: smtp.host,
                port: smtp.port,
                secure: smtp.secure,
                auth: {
                    user: smtp.user,
                    pass: smtp.pass,
                },
            })

            const info = await transporter.sendMail({
                from: fromAddress,
                to,
                subject,
                html,
            })

            return { success: true, messageId: info.messageId }
        } catch (error: any) {
            console.error('[SMTP Error]', error)
            // Fallback to Resend if SMTP failed but API key exists
            if (!apiKey) return { success: false, error: error.message }
        }
    }

    // 2. Fallback to Resend
    if (apiKey) {
        try {
            const resend = new Resend(apiKey)
            const { data, error } = await resend.emails.send({
                from: fromAddress,
                to: [to],
                subject,
                html,
            })

            if (error) {
                console.error('[Resend Error]', error)
                return { success: false, error: error.message }
            }

            return { success: true, messageId: data?.id }
        } catch (e: any) {
            console.error('[Resend Exception]', e)
            return { success: false, error: e.message }
        }
    }

    return { success: false, error: 'No email provider configured' }
}

/**
 * Sends a booking notification email to admins and owners
 */
export async function sendBookingNotificationEmail(
    to: string,
    customerName: string,
    fieldName: string,
    bookingDate: string,
    bookingTime: string,
    apiKey: string | null,
    fromAddress: string,
    smtp?: SmtpConfig | null
) {
    const html = `
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
    return sendEmail({ to, subject: '🔔 حجز جديد - New Booking Alert', html, fromAddress, apiKey, smtp })
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
    apiKey: string | null,
    fromAddress: string,
    smtp?: SmtpConfig | null
) {
    const html = `
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
    return sendEmail({ to, subject: '✅ تم تأكيد حجزك - Booking Confirmed', html, fromAddress, apiKey, smtp })
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
    apiKey: string | null,
    fromAddress: string,
    smtp?: SmtpConfig | null
) {
    const html = `
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
    return sendEmail({ to, subject: '❌ تم رفض حجزك - Booking Rejected', html, fromAddress, apiKey, smtp })
}

/**
 * Sends a password reset email to the user
 */
export async function sendPasswordResetEmail(
    to: string,
    customerName: string,
    resetLink: string,
    apiKey: string | null,
    fromAddress: string,
    smtp?: SmtpConfig | null
) {
    const html = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">⚽ ملاعبنا</h1>
                <p style="color: #dbeafe; margin: 10px 0 0 0; font-size: 16px;">إعادة تعيين كلمة المرور</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #2563eb; margin-top: 0; font-size: 24px;">🔐 طلب تغيير كلمة المرور</h2>
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">مرحباً ${customerName}،</p>
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في ملاعبنا. إذا لم تقم بهذا الطلب، يمكنك تجاهل هذا البريد بأمان.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">إعادة تعيين كلمة المرور</a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="color: #9ca3af; font-size: 12px;">إذا كنت تواجه مشكلة في النقر على الزر، انسخ الرابط التالي والصقه في متصفحك:</p>
                <p style="color: #3b82f6; font-size: 12px; word-break: break-all;">${resetLink}</p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                <p>هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
            </div>
        </div>
    `
    return sendEmail({ 
        to, 
        subject: '🔐 إعادة تعيين كلمة المرور - Password Reset Request', 
        html, 
        fromAddress, 
        apiKey, 
        smtp 
    })
}
