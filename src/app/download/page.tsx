import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export default function DownloadPage() {
    return (
        <main className="min-h-screen pb-10">
            <Navbar />
            <div className="container mx-auto py-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <Image src="/logo.png" alt="MALA3EBNA" width={150} height={150} className="rounded-2xl shadow-2xl" />
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-sm border border-white/20 inline-block mb-4">
                            <h1 className="text-4xl font-black text-gray-900">Download MALA3EBNA</h1>
                        </div>
                        <p className="text-xl text-gray-700 font-medium">احجز ملعبك في ثواني - حمل التطبيق دلوقتي!</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {/* Android Card */}
                        <Card className="border-0 shadow-2xl overflow-hidden hover:shadow-green-500/20 transition-all">
                            <CardHeader className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="text-5xl">🤖</div>
                                    <CardTitle className="text-2xl font-black">Android</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-gray-600 font-medium">حمل التطبيق على أجهزة Android</p>
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-14 shadow-lg"
                                    asChild
                                >
                                    <a href="https://github.com/malab2026/Malab/releases/latest/download/app-release.apk" download>
                                        📥 Download APK
                                    </a>
                                </Button>
                                <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
                                    <p className="font-bold text-gray-700">📋 خطوات التثبيت:</p>
                                    <ol className="list-decimal list-inside space-y-1">
                                        <li>حمل ملف APK</li>
                                        <li>افتح الملف من Downloads</li>
                                        <li>اسمح بالتثبيت من مصادر غير معروفة</li>
                                        <li>اضغط Install</li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>

                        {/* iOS Card */}
                        <Card className="border-0 shadow-2xl overflow-hidden hover:shadow-blue-500/20 transition-all">
                            <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                <div className="flex items-center gap-3">
                                    <div className="text-5xl">🍎</div>
                                    <CardTitle className="text-2xl font-black">iOS</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-gray-600 font-medium">نسخة المحاكي (Simulator Only)</p>
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-14 shadow-lg"
                                    asChild
                                >
                                    <a href="https://github.com/malab2026/Malab/releases/latest/download/App-Simulator-Debug.zip" download>
                                        📥 Download Simulator IPA
                                    </a>
                                </Button>
                                <div className="text-xs text-gray-500 space-y-1 bg-blue-50 p-3 rounded-lg">
                                    <p className="font-bold text-blue-700">⚠️ تنبيه هام:</p>
                                    <p>الملف ده <b>Simulator Build</b>.</p>
                                    <p className="font-bold mt-2">طريقة التشغيل:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>فك الضغط (Unzip)</li>
                                        <li>اسحب ملف <code>App.app</code> على الـ iOS Simulator</li>
                                        <li>هذا الملف <b>لا يعمل</b> على iPhone حقيقي.</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Features Section */}
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-black text-center text-gray-900">✨ مميزات التطبيق</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                    <div className="text-4xl mb-2">⚡</div>
                                    <h3 className="font-bold text-gray-900 mb-1">حجز سريع</h3>
                                    <p className="text-sm text-gray-600">احجز ملعبك في ثواني</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                    <div className="text-4xl mb-2">📱</div>
                                    <h3 className="font-bold text-gray-900 mb-1">سهل الاستخدام</h3>
                                    <p className="text-sm text-gray-600">واجهة بسيطة وسلسة</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                                    <div className="text-4xl mb-2">💳</div>
                                    <h3 className="font-bold text-gray-900 mb-1">دفع آمن</h3>
                                    <p className="text-sm text-gray-600">معاملات محمية 100%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center mt-10">
                        <Button variant="outline" className="bg-white shadow-sm" asChild>
                            <Link href="/">← العودة للرئيسية</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    )
}
