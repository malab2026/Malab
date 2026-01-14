export const translations = {
    ar: {
        // Navbar
        dashboard: "لوحة التحكم",
        admin: "الأدمن",
        owner: "صاحب الملعب",
        bookingHistory: "تاريخ الحجوزات",
        signOut: "تسجيل الخروج",
        login: "تسجيل الدخول",
        signUp: "إنشاء حساب",
        languageToggle: "English",

        // Home Page
        heroTitle: "ملاعبنا",
        heroSubtitle: "ابحث عن أفضل الملاعب واحجز مباراتك في ثوانٍ.",
        joinNow: "اشترك الآن",
        availableFields: "الملاعب المتاحة",
        viewAll: "عرض الكل",
        ratePerHour: "سعر الساعة",
        bookNow: "حجز",
        youBookedThisBefore: "لقد حجزت هذا من قبل ⚽",
        myBookingHistory: "سجل حجزاتي",
        fullHistory: "كل السجلات ←",

        // Booking Details
        aboutField: "عن الملعب",
        cancellationPolicy: "سياسة الإلغاء",
        noPolicy: "لا توجد سياسة إلغاء محددة.",
        reserveSlot: "احجز موعدك",
        pitchPrice: "سعر الملعب",
        serviceFee: "رسم خدمة",
        totalAmount: "الإجمالي",
        back: "رجوع",
        nextPayment: "التالي: الدفع",
        checkingAvailability: "جاري التحقق...",
        confirmBookNow: "تأكيد وحجز الآن",
        booking: "جاري الحجز...",
        slotsAvailable: "المواعيد متاحة!",
        completePayment: "يُرجى إكمال عملية الدفع لتأمين حجزك.",
        bookingSummary: "ملخص الحجز",
        paymentInstructions: "تعليمات الدفع",
        transferText: "يُرجى تحويل مبلغ {amount} EGP شامل (سعر الملعب + {fee} EGP خدمة) إلى رقم 01000000000 (InstaPay) وارفع صورة التحويل بالأسفل.",
        uploadReceipt: "ارفع صورة الإيصال",
        adminNote: "ملحوظة: بصفتك أدمن/صاحب ملعب، أنت تقوم بحجز الموعد يدوياً. لا حاجة لإيصال دفع.",
        selectAvailableSlots: "اختر المواعيد المتاحة",
        selectedSlots: "المواعيد المختارة",
        slotsNoLongerAvailable: "بعض المواعيد المختارة لم تعد متاحة.",

        // Weekly Schedule
        bookingSchedule: "جدول الحجوزات",
        resetToToday: "العودة لليوم",
        availableSlotsFor: "المواعيد المتاحة لـ",
        available: "متاح",
        occupied: "محجوز",
        selected: "مختار",
        booked: "تم الحجز",

        // Shared
        egp: "ج.م",
        hour: "ساعة",
    },
    en: {
        // Navbar
        dashboard: "Dashboard",
        admin: "Admin",
        owner: "Owner",
        bookingHistory: "Booking History",
        signOut: "Sign Out",
        login: "Login",
        signUp: "Sign Up",
        languageToggle: "عربي",

        // Home Page
        heroTitle: "Mala3ebna",
        heroSubtitle: "Find the best pitches and book your game in seconds.",
        joinNow: "Join Now",
        availableFields: "Available Fields",
        viewAll: "View All",
        ratePerHour: "Rate Per Hour",
        bookNow: "BOOK",
        youBookedThisBefore: "YOU BOOKED THIS BEFORE ⚽",
        myBookingHistory: "Booking History",
        fullHistory: "MY FULL HISTORY →",

        // Booking Details
        aboutField: "About this Field",
        cancellationPolicy: "Cancellation Policy",
        noPolicy: "No cancellation policy specified.",
        reserveSlot: "Reserve Your Slot",
        pitchPrice: "Pitch Price",
        serviceFee: "Service Fee",
        totalAmount: "Total Amount",
        back: "Back",
        nextPayment: "NEXT: PAYMENT",
        checkingAvailability: "Checking availability...",
        confirmBookNow: "Confirm & Book Now",
        booking: "Booking...",
        slotsAvailable: "Slots are Available!",
        completePayment: "Please complete the payment to secure your booking.",
        bookingSummary: "Booking Summary",
        paymentInstructions: "Payment Instructions",
        transferText: "Please transfer {amount} EGP inclusive of (Field Price + {fee} EGP service fee) to 01000000000 (InstaPay) and upload the receipt below.",
        uploadReceipt: "Upload Receipt",
        adminNote: "Note: As an admin/owner, you are blocking this slot manually. No receipt is required.",
        selectAvailableSlots: "Select Available Slots",
        selectedSlots: "Selected",
        slotsNoLongerAvailable: "Some selected slots are no longer available.",

        // Weekly Schedule
        bookingSchedule: "Booking Schedule",
        resetToToday: "RESET TO TODAY",
        availableSlotsFor: "Available slots for",
        available: "Available",
        occupied: "Occupied",
        selected: "Selected",
        booked: "BOOKED",

        // Shared
        egp: "EGP",
        hour: "Hour",
    }
};

export type Locale = 'ar' | 'en';
export type TranslationKey = keyof typeof translations.en;
