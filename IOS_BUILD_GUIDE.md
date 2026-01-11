# دليل بناء تطبيق iOS - MALA3EBNA

## المتطلبات الأساسية ⚠️

**مهم جداً:** بناء تطبيقات iOS يتطلب:
- ✅ جهاز **Mac** (MacBook, iMac, Mac Mini)
- ✅ **Xcode** مثبت من App Store
- ✅ حساب **Apple Developer** (مجاني للتجربة، $99/سنة للنشر)
- ✅ **CocoaPods** مثبت

## الخطوة 1: تجهيز البيئة على Mac

### تثبيت Xcode
```bash
# من App Store أو
xcode-select --install
```

### تثبيت CocoaPods
```bash
sudo gem install cocoapods
```

### تثبيت Node.js و npm
```bash
# استخدم Homebrew
brew install node
```

## الخطوة 2: بناء المشروع

```bash
# 1. استنساخ المشروع (لو مش موجود)
git clone https://github.com/malab2026/Malab.git
cd Malab

# 2. تثبيت Dependencies
npm install --legacy-peer-deps

# 3. بناء الموقع
npm run build

# 4. مزامنة مع iOS
npx cap sync ios

# 5. تثبيت iOS Dependencies
cd ios/App
pod install
cd ../..
```

## الخطوة 3: فتح المشروع في Xcode

```bash
npx cap open ios
```

أو افتح يدوياً:
```
ios/App/App.xcworkspace
```

⚠️ **مهم:** افتح ملف `.xcworkspace` مش `.xcodeproj`

## الخطوة 4: إعداد Signing & Capabilities

في Xcode:

1. اختر المشروع من الـ Navigator الشمال
2. اختار Target "App"
3. روح على تاب **Signing & Capabilities**
4. اختار **Team** (حساب Apple Developer بتاعك)
5. غير **Bundle Identifier** لو محتاج (مثلاً: `com.yourname.mala3ebna`)

## الخطوة 5: اختيار الجهاز

من شريط الأدوات فوق في Xcode:
- اختار جهازك المتصل، أو
- اختار **Any iOS Device (arm64)** للـ Archive

## الخطوة 6: بناء التطبيق

### للتجربة على Simulator:
1. اختار **iPhone 15 Pro** (أو أي simulator)
2. دوس **Run** (▶️) أو `Cmd + R`

### للتجربة على جهاز حقيقي:
1. وصل الـ iPhone/iPad بكابل USB
2. اختار الجهاز من القائمة
3. دوس **Run** (▶️)
4. على الجهاز: **Settings > General > VPN & Device Management** > ثق في المطور

### لعمل Archive (للنشر):
1. من القائمة: **Product > Archive**
2. انتظر حتى ينتهي البناء
3. في نافذة **Organizer** اللي هتفتح:
   - اختار الـ Archive
   - دوس **Distribute App**
   - اختار **Ad Hoc** (للتوزيع المحدود) أو **App Store** (للنشر)

## الخطوة 7: تصدير IPA

بعد Archive:
1. اختار **Export**
2. اختار **Development** أو **Ad Hoc**
3. اختار مكان الحفظ
4. هتحصل على ملف `.ipa`

## الخطوة 8: التوزيع

### التوزيع المباشر (Ad Hoc):
- شارك ملف `.ipa` مع الأجهزة المسجلة
- استخدم **Apple Configurator** أو **Xcode** للتثبيت

### النشر على App Store:
1. من Xcode Organizer، اختار **Distribute App**
2. اختار **App Store Connect**
3. املأ البيانات المطلوبة
4. ارفع التطبيق
5. روح على https://appstoreconnect.apple.com
6. أكمل معلومات التطبيق (Screenshots, Description, etc.)
7. اعمل Submit للمراجعة

## الخطوة 9: TestFlight (اختياري)

TestFlight بيسمح لك بتوزيع التطبيق لـ 10,000 مستخدم للتجربة:

1. ارفع build على App Store Connect
2. في TestFlight، ضيف testers
3. المستخدمين يحملوا تطبيق **TestFlight** من App Store
4. يستخدموا الكود اللي هتبعته ليهم

## استكشاف الأخطاء الشائعة

### خطأ: "No signing certificate found"
**الحل:**
1. روح على https://developer.apple.com
2. Certificates, Identifiers & Profiles
3. أنشئ Certificate جديد
4. حمله وافتحه (هيتضاف لـ Keychain)

### خطأ: "Provisioning profile doesn't include signing certificate"
**الحل:**
1. أنشئ Provisioning Profile جديد
2. تأكد إنه بيتضمن الـ Certificate بتاعك
3. حمله وافتحه في Xcode

### خطأ: "Pod install failed"
**الحل:**
```bash
cd ios/App
pod repo update
pod install
```

## ملاحظات مهمة

- 📱 **للتجربة فقط:** ممكن تستخدم حساب Apple ID مجاني
- 🏪 **للنشر على App Store:** محتاج حساب مدفوع ($99/سنة)
- ⏱️ **المراجعة:** بتاخد من يوم لـ 3 أيام
- 🔒 **الأمان:** خلي الـ Certificates والـ Profiles في مكان آمن

## بدائل لو مفيش Mac

### 1. استخدام خدمة سحابية:
- **Codemagic** (https://codemagic.io)
- **Bitrise** (https://bitrise.io)
- **GitHub Actions** مع macOS runner (مكلف)

### 2. استئجار Mac في السحابة:
- **MacStadium** (https://macstadium.com)
- **MacinCloud** (https://macincloud.com)

### 3. استخدام Hackintosh (غير رسمي):
- تثبيت macOS على جهاز PC
- ⚠️ مخالف لشروط Apple

## الخلاصة

بناء iOS محتاج Mac، لكن لو مش متوفر:
1. استخدم خدمة CI/CD زي Codemagic
2. استأجر Mac في السحابة
3. اطلب من صديق عنده Mac يساعدك

---

🏟️ **MALA3EBNA** - Built with ❤️ for football lovers
