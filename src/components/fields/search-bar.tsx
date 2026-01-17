"use client"

import { Input } from "@/components/ui/input"
import { useTranslation } from "@/components/providers/locale-context"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export function SearchBar() {
    const { t } = useTranslation()
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    return (
        <div className="relative mb-6">
            <Input
                placeholder={t('searchByName')}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('q')?.toString()}
                className="max-w-md w-full"
            />
        </div>
    )
}
