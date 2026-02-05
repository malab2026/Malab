'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { redirect } from "next/navigation"
import { sendWhatsAppAPI, formatPasswordResetMessage } from "@/lib/whatsapp"

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
            adminPhone: settings?.adminPhone || "201020155988",
            message: `مرحباً، الاسم: ${user.name}\nرقم الهاتف: ${user.phone}\nأريد إعادة تعيين كلمة المرور الخاصة بي.`
        }
    } catch (e) {
        console.error(e)
        return { success: false, message: "Database Error" }
    }
}
