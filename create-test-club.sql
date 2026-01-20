-- إضافة نادي تجريبي
INSERT INTO "Club" (id, name, "nameEn", "logoUrl", address, "addressEn", description, "descriptionEn", "createdAt")
VALUES (
  'club-test-001',
  'نادي ملاعبنا الرياضي',
  'Mala3ebna Sports Club',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop',
  'بنها، القليوبية',
  'Benha, Qalyubia',
  'نادي رياضي متكامل يضم أفضل الملاعب في المنطقة',
  'Complete sports club with the best fields in the area',
  NOW()
);

-- ربط الملاعب الموجودة بالنادي (اختياري - لو عندك ملاعب موجودة)
-- UPDATE "Field" SET "clubId" = 'club-test-001' WHERE "clubId" IS NULL;
