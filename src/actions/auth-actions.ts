'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { redirect } from "next/navigation"
import { sendWhatsAppAPI, formatPasswordResetMessage } from "@/lib/whatsapp"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"

const RegisterSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
})

export async function registerUser(
    prevState: string | undefined,
    formData: FormData,
) {
    const validatedFields = RegisterSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email') || undefined, // Treat empty string as undefined
        password: formData.get('password'),
        phone: formData.get('phone'),
    })

    if (!validatedFields.success) {
        return "Invalid fields. Please check your inputs."
    }

    const { name, email, password, phone } = validatedFields.data

    try {
        const existingPhone = await prisma.user.findUnique({
            where: { phone: phone.trim() },
        })

        if (existingPhone) {
            return "User with this phone number already exists."
        }

        if (email) {
            const existingEmail = await prisma.user.findUnique({
                where: { email },
            })
            if (existingEmail) {
                return "User with this email already exists."
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Handle email being undefined/null
        const userData: any = {
            name,
            password: hashedPassword,
            phone,
            role: 'user',
        }
        if (email) userData.email = email

        await prisma.user.create({
            data: userData,
        })

    } catch (error) {
        console.error("Registration error:", error)
        return "Failed to create account."
    }

    redirect('/login')
}


export async function authenticate(
    prevState: any,
    formData: FormData,
) {
    try {
        const phone = formData.get('phone') as string
        const password = formData.get('password') as string
        const user = await prisma.user.findUnique({ where: { phone: phone.trim() } })

        await signIn('credentials', {
            phone: phone.trim(),
            password,
            redirect: false,
        })

        const redirectUrl = user?.role === 'admin' ? '/admin' : (user?.role === 'owner' ? '/owner' : '/')
        return { redirectUrl }

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    // Check if user exists but password failed
                    const phone = formData.get('phone') as string
                    const user = await prisma.user.findUnique({ where: { phone: phone.trim() } })
                    if (!user) {
                        return { message: 'Phone number not found.' }
                    }
                    return { message: 'Incorrect password.' }
                default:
                    return { message: 'Something went wrong.' }
            }
        }
        throw error
    }
}

export async function handleSignOut() {
    const { signOut } = await import("@/auth")
    await signOut({ redirectTo: '/login' })
}

export async function sendWhatsAppReset(phone: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { phone: phone.trim() },
            select: { id: true, name: true, phone: true }
        })

        if (!user) {
            return { success: false, message: "Phone number not found." }
        }

        const settings = await prisma.globalSettings.findUnique({ where: { id: 'global' } })

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
        const message = formatPasswordResetMessage(resetCode)

        // If automated WhatsApp is enabled and configured, send it!
        if (settings?.whatsappEnabled && settings?.whatsappInstanceId && settings?.whatsappToken) {
            await sendWhatsAppAPI(
                user.phone,
                message,
                settings.whatsappInstanceId,
                settings.whatsappToken
            )
            return {
                success: true,
                automated: true,
                message: "تم إرسال كود إعادة التعيين إلى واتساب الخاص بك."
            }
        }

        // Fallback to manual link if not configured
        return {
            success: true,
            automated: false,
            adminPhone: settings?.adminPhone || "01020155988",
            message: `مرحباً، الاسم: ${user.name}\nرقم الهاتف: ${user.phone}\nأريد إعادة تعيين كلمة المرور الخاصة بي.`
        }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Database Error" }
    }
}

export async function sendEmailReset(emailOrPhone: string) {
    try {
        // 1. Find user by email or phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrPhone.trim() },
                    { phone: emailOrPhone.trim() }
                ]
            },
            select: { id: true, name: true, email: true }
        })

        if (!user || !user.email) {
            return { 
                success: false, 
                message: user ? "حسابك لا يحتوي على بريد إلكتروني مسجل. يرجى التواصل مع الدعم." : "لم يتم العثور على حساب بهذا البريد أو الهاتف." 
            }
        }

        // 2. Generate secure token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour

        // 3. Save to DB
        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpires }
        })

        // 4. Send email
        const settings = await prisma.globalSettings.findUnique({ where: { id: 'global' } })
        
        if (!settings?.emailEnabled) {
            return { success: false, message: "خدمة البريد الإلكتروني غير مفعلة حالياً." }
        }

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}`

        const result = await sendPasswordResetEmail(
            user.email,
            user.name || "مستخدم ملاعبنا",
            resetLink,
            settings.emailApiKey,
            settings.emailFromAddress || "noreply@malaebna.com",
            settings.emailSmtpHost ? {
                host: settings.emailSmtpHost,
                port: settings.emailSmtpPort || 587,
                user: settings.emailSmtpUser || "",
                pass: settings.emailSmtpPass || "",
                secure: settings.emailSmtpSecure || false
            } : null
        )

        if (!result.success) {
            return { success: false, message: "فشل إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً." }
        }

        return { success: true, message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني." }

    } catch (e) {
        console.error(e)
        return { success: false, message: "حدث خطأ أثناء معالجة طلبك." }
    }
}

export async function resetPassword(token: string, newPassword: string) {
    try {
        // 1. Find user by token
        const user = await prisma.user.findUnique({
            where: { resetToken: token }
        })

        if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            return { success: false, message: "الرابط غير صالح أو انتهت صلاحيته." }
        }

        // 2. Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // 3. Update user and clear token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpires: null
            }
        })

        return { success: true, message: "تم تغيير كلمة المرور بنجاح." }
    } catch (e) {
        console.error(e)
        return { success: false, message: "فشل تغيير كلمة المرور." }
    }
}

export async function deleteAccount() {
    const { auth, signOut } = await import("@/auth")
    const session = await auth()

    if (!session?.user) {
        return { success: false, message: "Not authenticated" }
    }

    try {
        // Delete all related data first if not handled by cascade
        // Prisma schema usually handles cascade delete for relations if configured, 
        // but let's be safe and let Prisma handle the user deletion which typically cascades.

        await prisma.user.delete({
            where: { id: session.user.id }
        })

        await signOut({ redirectTo: '/' })
        return { success: true }
    } catch (error) {
        console.error("Error deleting account:", error)
        return { success: false, message: "Failed to delete account" }
    }
}
