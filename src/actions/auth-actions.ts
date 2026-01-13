'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { redirect } from "next/navigation"

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
        const existingUser = await prisma.user.findUnique({
            where: { phone },
        })

        if (existingUser) {
            return "User with this phone number already exists."
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
        const user = await prisma.user.findUnique({ where: { phone } })

        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirect: false,
        })

        if (user?.role === 'admin') return { redirectUrl: '/admin' }
        if (user?.role === 'owner') return { redirectUrl: '/owner' }
        return { redirectUrl: '/' }

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { message: 'Invalid credentials.' }
                default:
                    return { message: 'Something went wrong.' }
            }
        }
    }
}

export async function handleSignOut() {
    const { signOut } = await import("@/auth")
    await signOut({ redirectTo: '/login' })
}
