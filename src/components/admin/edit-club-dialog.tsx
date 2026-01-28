'use client'

import { useState } from "react"
import { updateClub } from "@/actions/club-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit3, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface EditClubDialogProps {
    club: any
}

export function EditClubDialog({ club }: EditClubDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const result = await updateClub(club.id, formData)

        setIsLoading(false)
        if (result.success) {
            toast.success(result.message)
            setIsOpen(false)
        } else {
            toast.error(result.message)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Edit3 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl max-w-lg overflow-y-auto max-h-[90vh]">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-black tracking-tight">Edit Club Details</DialogTitle>
                    <DialogDescription className="font-bold text-gray-400">Update naming and branding for this club</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Name (Arabic)</Label>
                            <Input name="name" defaultValue={club.name} required className="rounded-2xl border-gray-100 focus:ring-blue-500" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Name (English)</Label>
                            <Input name="nameEn" defaultValue={club.nameEn} className="rounded-2xl border-gray-100 focus:ring-blue-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Club Logo</Label>
                        <div className="flex flex-col gap-3">
                            {club.logoUrl && (
                                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                    <img src={club.logoUrl} alt="Club logo" className="object-cover w-full h-full" />
                                </div>
                            )}
                            <input name="logo" type="file" accept="image/*" className="text-xs font-bold text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                            <input type="hidden" name="logoUrl" defaultValue={club.logoUrl} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Address (Ar)</Label>
                            <Input name="address" defaultValue={club.address} className="rounded-2xl border-gray-100" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Address (En)</Label>
                            <Input name="addressEn" defaultValue={club.addressEn} className="rounded-2xl border-gray-100" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description (Arabic)</Label>
                        <Textarea name="description" defaultValue={club.description} rows={3} className="rounded-2xl border-gray-100 resize-none" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description (English)</Label>
                        <Textarea name="descriptionEn" defaultValue={club.descriptionEn} rows={3} className="rounded-2xl border-gray-100 resize-none" />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transition-all">
                        {isLoading ? "Saving Changes..." : "Update Club"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
