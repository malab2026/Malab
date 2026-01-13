'use client'

import { useActionState } from "react"
import { updateServiceFee } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Settings, CheckCircle2, AlertCircle } from "lucide-react"

export function ServiceFeeForm({ initialFee }: { initialFee: number }) {
    const [state, dispatch] = useActionState(updateServiceFee, null)

    return (
        <Card className="border-green-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-green-50/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-green-900">
                    <Settings className="h-5 w-5" />
                    Global Settings
                </CardTitle>
                <CardDescription className="text-xs font-medium text-green-700/70">
                    Configure platform-wide booking parameters
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form action={dispatch} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="serviceFee" className="text-sm font-bold text-gray-700">
                            Booking Service Fee (EGP)
                        </Label>
                        <div className="relative">
                            <Input
                                id="serviceFee"
                                name="serviceFee"
                                type="number"
                                step="0.5"
                                defaultValue={initialFee}
                                className="pl-10 h-12 text-lg font-bold border-gray-200 focus:border-green-500 focus:ring-green-500"
                                required
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                                £
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">
                            * This fee is added to every booking slot created by users.
                        </p>
                    </div>

                    {state?.message && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${state.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {state.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <span className="font-semibold">{state.message}</span>
                        </div>
                    )}

                    <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition-all active:scale-95">
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
