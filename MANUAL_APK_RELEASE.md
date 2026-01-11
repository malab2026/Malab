# دليل بناء ورفع APK يدوياً

## الخطوة 1: بناء الـ APK محلياً

```bash
# 1. بناء الموقع
npm run build

# 2. مزامنة مع Android
npx cap sync android

# 3. بناء APK
cd android
gradlew assembleRelease
cd ..
```

الملف هيكون في: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

## الخطوة 2: رفع الـ APK على GitHub

### الطريقة الأولى: من الموقع مباشرة

1. روح على: https://github.com/malab2026/Malab/releases
2. دوس على **"Draft a new release"**
3. في Tag version، اكتب: `v1.0.0`
4. في Release title، اكتب: `MALA3EBNA v1.0.0`
5. في Description، اكتب:
```markdown
## 📱 MALA3EBNA - Android Release

### ✨ Features
- احجز ملعبك في ثواني
- واجهة سهلة وبسيطة
- دفع آمن ومضمون

### 📥 Download
حمل ملف `app-release.apk` وثبته على موبايلك الأندرويد

### 📋 خطوات التثبيت
1. حمل ملف APK
2. افتح الملف من Downloads
3. اسمح بالتثبيت من مصادر غير معروفة
4. اضغط Install

🏟️ Built with ❤️ for football lovers
```
6. في **"Attach binaries"**، ارفع ملف `app-release-unsigned.apk` (غير اسمه لـ `app-release.apk`)
7. دوس **"Publish release"**

### الطريقة الثانية: من Command Line (لو عندك GitHub CLI)

```bash
# إنشاء Release ورفع APK
gh release create v1.0.0 \
  android/app/build/outputs/apk/release/app-release-unsigned.apk#app-release.apk \
  --title "MALA3EBNA v1.0.0" \
  --notes "📱 First Android release of MALA3EBNA app"
```

## الخطوة 3: التأكد من اللينك

بعد ما ترفع الـ Release، اللينك هيكون:
```
https://github.com/malab2026/Malab/releases/latest/download/app-release.apk
```

وده نفس اللينك اللي موجود في صفحة `/download` على الموقع!

## ملحوظات مهمة

- الـ APK دلوقتي **unsigned** (مش موقع بشهادة رسمية)
- لو عاوز توقعه، لازم تعمل **keystore** وتستخدمه في الـ build
- الـ GitHub Actions workflow هيعمل ده تلقائياً في المستقبل لما يتصلح

## استكشاف الأخطاء

### لو الـ gradlew مش شغال:
```bash
# على Windows
cd android
.\gradlew.bat assembleRelease
```

### لو فيه مشكلة في الـ build:
```bash
# نضف الـ build ونبدأ من جديد
cd android
.\gradlew clean
.\gradlew assembleRelease
```
