# دليل تغيير اللوجو وتصدير التطبيق 📱🚀

## 1️⃣ تغيير اللوجو (App Icon)

### الخطوة الأولى: تثبيت الأداة
```bash
npm install @capacitor/assets --save-dev
```

### الخطوة الثانية: توليد الأيقونات تلقائياً
اللوجو موجود دلوقتي في `resources/icon.png`. استخدم الأمر ده عشان يولد كل المقاسات المطلوبة للأندرويد وiOS:

```bash
npx capacitor-assets generate --iconBackgroundColor '#3e8e41' --iconBackgroundColorDark '#3e8e41'
```

> **ملحوظة:** اللون الأخضر `#3e8e41` هو اللون الأساسي للوجو. لو عاوز تغيره، غير القيمة دي.

### الخطوة الثالثة: مزامنة التغييرات
```bash
npx cap sync
```

---

## 2️⃣ تصدير التطبيق للأندرويد (APK)

### الطريقة الأولى: APK للتجربة (Debug)

1. **افتح Android Studio:**
   ```bash
   npx cap open android
   ```

2. **من القائمة العلوية:**
   - اختار **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**

3. **بعد ما يخلص البناء:**
   - هيظهر لك إشعار تحت، دوس على **locate** عشان تفتح الفولدر
   - الملف هيكون في: `android/app/build/outputs/apk/debug/app-debug.apk`

### الطريقة الثانية: APK موقع للنشر (Release - Signed)

#### أ. إنشاء Keystore (مرة واحدة فقط)
افتح Terminal في Android Studio ونفذ:
```bash
keytool -genkey -v -keystore malaeb-release-key.keystore -alias malaeb -keyalg RSA -keysize 2048 -validity 10000
```

- هيطلب منك باسورد، احفظه كويس
- هيسألك أسئلة (الاسم، المؤسسة، إلخ)، اكتب أي حاجة
- الملف `malaeb-release-key.keystore` هيتعمل في المجلد الحالي

#### ب. إعداد ملف gradle.properties
روح على `android/gradle.properties` وضيف الأسطر دي في الآخر:

```properties
MALAEB_RELEASE_STORE_FILE=../malaeb-release-key.keystore
MALAEB_RELEASE_KEY_ALIAS=malaeb
MALAEB_RELEASE_STORE_PASSWORD=YOUR_KEYSTORE_PASSWORD
MALAEB_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

> **مهم جداً:** بدل `YOUR_KEYSTORE_PASSWORD` و `YOUR_KEY_PASSWORD` بالباسوردات اللي دخلتها فوق.

#### ج. تعديل build.gradle
روح على `android/app/build.gradle` ودور على `android { ... }` وضيف جواها:

```gradle
signingConfigs {
    release {
        storeFile file(MALAEB_RELEASE_STORE_FILE)
        storePassword MALAEB_RELEASE_STORE_PASSWORD
        keyAlias MALAEB_RELEASE_KEY_ALIAS
        keyPassword MALAEB_RELEASE_KEY_PASSWORD
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

#### د. بناء APK الموقع
من Android Studio:
- **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
- أو من Terminal:
  ```bash
  cd android
  ./gradlew assembleRelease
  ```

الملف النهائي هيكون في: `android/app/build/outputs/apk/release/app-release.apk`

---

## 3️⃣ تصدير للـ Google Play Store (AAB)

Google Play بيطلب ملف **Android App Bundle (.aab)** مش APK:

```bash
cd android
./gradlew bundleRelease
```

الملف هيكون في: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 4️⃣ تثبيت التطبيق على موبايلك مباشرة

### للتجربة السريعة:
1. وصل الموبايل بالكمبيوتر
2. فعل **USB Debugging** من إعدادات المطور
3. في Android Studio، دوس على زرار **Run** (▶️)

### تثبيت APK يدوياً:
1. انقل ملف `app-debug.apk` أو `app-release.apk` للموبايل
2. افتحه من File Manager
3. اسمح بالتثبيت من مصادر غير معروفة لو طلب منك

---

## ✅ ملخص سريع

```bash
# 1. تثبيت الأداة
npm install @capacitor/assets --save-dev

# 2. توليد الأيقونات
npx capacitor-assets generate --iconBackgroundColor '#3e8e41'

# 3. مزامنة
npx cap sync

# 4. فتح Android Studio
npx cap open android

# 5. بناء APK من Android Studio
# Build > Build Bundle(s) / APK(s) > Build APK(s)
```

---

🎉 **بالتوفيق!** لو واجهتك أي مشكلة، قلي وأنا هساعدك.
