'use server'

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { redirect } from "next/navigation"

const RegisterSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
})

export async function registerUser(
    prevState: string | undefined,
    formData: FormData,
) {
    const validatedFields = RegisterSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
    })

    if (!validatedFields.success) {
        return "Invalid fields. Please check your input."
    }

    const { name, email, password, phone } = validatedFields.data

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return "User with this email already exists."
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role: 'user', // Default role
            },
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
        const email = formData.get('email') as string
        const user = await prisma.user.findUnique({ where: { email } })

        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirect: false,
        })

        if (user?.role === 'admin') return { redirectUrl: '/admin' }
        if (user?.role === 'owner') return { redirectUrl: '/owner' }
        return { redirectUrl: '/dashboard' }

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { message: 'Invalid credentials.' }
                default:
                    return { message: 'Something went wrong.' }
            }
        }
        throw error
    }
}
