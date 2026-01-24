'use client'

import { useActionState } from "react"
import { updateGlobalSettings } from "@/actions/admin-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Settings, CheckCircle2, AlertCircle, MessageCircle, Phone } from "lucide-react"

import { useTranslation } from "@/components/providers/locale-context"

interface GlobalSettingsFormProps {
    initialFee: number
    initialPhone: string
    initialWhatsappEnabled: boolean
}

export function GlobalSettingsForm({ initialFee, initialPhone, initialWhatsappEnabled }: GlobalSettingsFormProps) {
    const { t } = useTranslation()
    const [state, dispatch] = useActionState(updateGlobalSettings, null)

    return (
        <Card className="border-green-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-green-50/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-green-900">
                    <Settings className="h-5 w-5" />
                    {t('serviceFeeConfig')}
                </CardTitle>
                <CardDescription className="text-xs font-medium text-green-700/70">
                    {t('serviceFeeConfigDesc')}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form action={dispatch} className="space-y-6">
                    {/* Service Fee */}
                    <div className="space-y-2">
                        <Label htmlFor="serviceFee" className="text-sm font-bold text-gray-700">
                            {t('serviceFeeLabel')}
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
                                {t('egp')}
                            </span>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* WhatsApp Configuration */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4 text-green-600" />
                                    WhatsApp Integration
                                </Label>
                                <p className="text-[10px] text-gray-400 font-medium">Enable chat and automated notifications</p>
                            </div>
                            <input type="hidden" name="whatsappEnabled" value={initialWhatsappEnabled ? "true" : "false"} />
                            <Switch
                                defaultChecked={initialWhatsappEnabled}
                                onCheckedChange={(checked) => {
                                    const input = document.querySelector('input[name="whatsappEnabled"]') as HTMLInputElement;
                                    if (input) input.value = checked ? "true" : "false";
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminPhone" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                Admin WhatsApp Phone
                            </Label>
                            <Input
                                id="adminPhone"
                                name="adminPhone"
                                type="tel"
                                defaultValue={initialPhone}
                                placeholder="2010xxxxxxxx"
                                className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 font-medium"
                                required
                            />
                            <p className="text-[9px] text-gray-400">Include country code without + (e.g., 20 for Egypt)</p>
                        </div>
                    </div>

                    {state?.message && (
                        <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${state.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {state.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <span className="font-semibold">{state.message}</span>
                        </div>
                    )}

                    <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-md transition-all active:scale-95">
                        {t('saveChanges')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
