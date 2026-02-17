
import React from 'react';

export const metadata = {
    title: 'Privacy Policy - Mala3ebna',
    description: 'Privacy Policy for the Mala3ebna application.',
};

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl rtl" dir="rtl">
            <h1 className="text-3xl font-bold mb-6">سياسة الخصوصية لـ ملاعبنا (Mala3ebna)</h1>
            <p className="text-sm text-gray-500 mb-8">آخر تحديث: 17 فبراير 2026</p>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">1. مقدمة</h2>
                <p className="mb-2">
                    مرحبًا بك في تطبيق "ملاعبنا". نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيف نجمع ونستخدم ونشارك معلوماتك عند استخدامك لتطبيقنا.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">2. البيانات التي نجمعها</h2>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong>معلومات الحساب:</strong> الاسم، رقم الهاتف، والبريد الإلكتروني عند التسجيل.</li>
                    <li><strong>بيانات الحجز:</strong> تواريخ وأوقات حجز الملاعب والملاعب المختارة.</li>
                    <li><strong>معلومات الجهاز:</strong> نوع الجهاز، نظام التشغيل، ومعرفات الجهاز الفريدة لتحسين تجربة المستخدم وإرسال الإشعارات.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">3. كيف نستخدم بياناتك</h2>
                <p className="mb-2">نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li>تسهيل وإدارة حجوزات الملاعب.</li>
                    <li>التواصل معك بخصوص حجوزاتك وتحديثات التطبيق (عبر الإشعارات أو واتساب).</li>
                    <li>تحسين خدماتنا وتجربة المستخدم.</li>
                    <li>الامتثال للمتطلبات القانونية والتنظيمية.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">4. مشاركة البيانات</h2>
                <p className="mb-2">
                    نحن لا نبيع بياناتك الشخصية لأطراف ثالثة. قد نشارك بياناتك فقط في الحالات التالية:
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li>مع أصحاب الملاعب لتأكيد وإدارة حجوزاتك.</li>
                    <li>مع مقدمي الخدمات الذين يساعدوننا في تشغيل التطبيق (مثل خدمات الاستضافة).</li>
                    <li>عندما يقتضي القانون ذلك.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">5. أمن البيانات</h2>
                <p className="mb-2">
                    نحن نتخذ إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو تخزين إلكتروني آمنة بنسبة 100%.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">6. حذف البيانات</h2>
                <p className="mb-2">
                    يحق لك طلب حذف حسابك وبياناتك الشخصية في أي وقت. يمكنك القيام بذلك من خلال إعدادات التطبيق أو عن طريق التواصل معنا مباشرة.
                </p>
            </section>

            <section className="mb-6" id="deletion">
                <h2 className="text-xl font-semibold mb-3">7. حذف الحساب والبيانات (Account Deletion)</h2>
                <p className="mb-2">
                    نلتزم في "ملاعبنا" بمنحك التحكم الكامل في بياناتك. يمكنك طلب حذف حسابك وبياناتك نهائياً في أي وقت.
                </p>

                <h3 className="font-semibold mt-4 mb-2">خطوات حذف الحساب (How to delete your account):</h3>
                <ul className="list-decimal list-inside space-y-2 mb-4">
                    <li><strong>من داخل التطبيق:</strong> اذهب إلى "لوحة التحكم" (Dashboard) {'>'} انزل لأسفل الصفحة {'>'} اضغط على زر "حذف الحساب" (Delete Account) {'>'} أكد الحذف.</li>
                    <li><strong>عن طريق الويب:</strong> إذا لم يعد لديك التطبيق، يمكنك طلب الحذف بإرسال بريد إلكتروني إلى <a href="mailto:support@malaeb-booking.com" className="text-blue-600">support@malaeb-booking.com</a> بعنوان "طلب حذف حساب".</li>
                </ul>

                <h3 className="font-semibold mt-4 mb-2">البيانات التي سيتم حذفها (Types of data deleted):</h3>
                <p className="mb-2">عند تأكيد الحذف، سيتم إزالة البيانات التالية بشكل فوري ونهائي:</p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                    <li>الاسم ورقم الهاتف (Name & Phone Number).</li>
                    <li>سجل الحجوزات السابقة (Booking History).</li>
                    <li>أي بيانات تعريفية أخرى مرتبطة بحسابك.</li>
                </ul>

                <p className="text-sm text-red-600 font-bold mt-2">
                    تنبيه: لا نحتفظ بأي بيانات للمستخدم بعد تأكيد طلب الحذف.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">8. اتصل بنا</h2>
                <p className="mb-2">
                    إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر:
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li>البريد الإلكتروني: support@malaeb-booking.com</li>
                    <li>الهاتف/واتساب: 01020155988</li>
                </ul>
            </section>
        </div>
    );
}
