'use client'

import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/providers/locale-context"

interface BackButtonProps {
    className?: string
    variant?: "default" | "outline" | "ghost" | "secondary"
    fallbackUrl?: string
}

export function BackButton({ className, variant = "secondary", fallbackUrl }: BackButtonProps) {
    const router = useRouter()
    const { isRtl } = useTranslation()

    const handleBack = () => {
        if (window.history.length > 2) {
            router.back()
        } else if (fallbackUrl) {
            router.push(fallbackUrl)
        } else {
            router.push('/')
        }
    }

    return (
        <Button
            variant={variant}
            onClick={handleBack}
            className={`flex items-center gap-2 font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 ${className}`}
        >
            {isRtl ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            <span>{isRtl ? "رجوع" : "Back"}</span>
        </Button>
    )
}
