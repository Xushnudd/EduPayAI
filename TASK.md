# EduPay — O‘quv markazi to‘lovlarini boshqarish tizimi

## Loyiha haqida

**EduPay** — o‘quv markazlarida o‘quvchilar, ularning oylik to‘lovlari va qarzdorliklarini hisobga olish uchun mo‘ljallangan kichik dasturiy tizim.

Tizim o‘quvchilar ma’lumotlarini boshqarish, to‘lovlarni qayd etish va belgilangan oy bo‘yicha qarzdorlarni aniqlash imkoniyatini beradi.

## Umumiy ma’lumotlar

- **Loyiha nomi:** EduPay
- **Loyiha turi:** To‘lovlarni hisobga olish tizimi
- **Buyurtmachi:** Ecomdev
- **Bajarish muddati:** 3 kun
- **Ma’lumotlar bazasi:** Ixtiyoriy
- **Dasturlash tili:** Node.js (JavaScript/TypeScript), Python, PHP yoki Java
- **Sun’iy intellekt:** Foydalanishga ruxsat berilgan

Agar topshiriqni bajarish uchun qo‘shimcha vaqt kerak bo‘lsa, buyurtmachiga xabar berish mumkin.

---

## 1. Backend — API

### 1.1. O‘quvchilarni boshqarish

Tizim har bir o‘quvchi haqida quyidagi ma’lumotlarni saqlashi kerak:

| Maydon | Tavsif |
|---|---|
| Ism | O‘quvchining ismi |
| Telefon | O‘quvchining telefon raqami |
| Guruh | O‘quvchi qatnashadigan guruh |
| Oylik to‘lov | Har oy to‘lanishi kerak bo‘lgan summa |

**Asosiy funksiyalar:**

- Yangi o‘quvchi qo‘shish.
- Barcha o‘quvchilar ro‘yxatini olish.
- Mavjud o‘quvchining ma’lumotlarini tahrirlash.
- O‘quvchini tizimdan o‘chirish.

### 1.2. To‘lovlarni boshqarish

Tizim o‘quvchilar tomonidan amalga oshirilgan to‘lovlarni saqlashi kerak.

Har bir to‘lov quyidagi ma’lumotlardan iborat:

| Maydon | Tavsif |
|---|---|
| O‘quvchi | To‘lovni amalga oshirgan o‘quvchi |
| Summa | To‘langan pul miqdori |
| Sana | To‘lov amalga oshirilgan sana |

**Asosiy funksiyalar:**

- Yangi to‘lov qo‘shish.
- Muayyan o‘quvchining barcha to‘lovlarini ko‘rish.

### 1.3. Qarzdorlarni aniqlash

Tizim belgilangan oy uchun qarzdor o‘quvchilar ro‘yxatini shakllantirishi kerak.

**API endpoint:**

`GET /debtors?month=YYYY-MM`

Bu yerda `YYYY-MM` — tekshiriladigan yil va oy.

**Ishlash tartibi:**

1. Tanlangan oy uchun o‘quvchining barcha to‘lovlari aniqlanadi.
2. To‘lovlarning umumiy summasi hisoblanadi.
3. Hisoblangan summa o‘quvchining belgilangan oylik to‘lovi bilan solishtiriladi.
4. Oylik to‘lovni to‘liq amalga oshirmagan o‘quvchilar qarzdorlar ro‘yxatiga kiritiladi.
5. Har bir qarzdorning qolgan qarz summasi ko‘rsatiladi.

**Qarzni hisoblash formulasi:**

`Qarz = Oylik to‘lov − Tanlangan oyda to‘langan jami summa`

**Misol:**

| O‘quvchi | Oylik to‘lov | To‘langan | Qarz |
|---|---:|---:|---:|
| Ali | 500 000 | 300 000 | 200 000 |
| Vali | 600 000 | 600 000 | 0 |
| Sardor | 450 000 | 0 | 450 000 |

Ushbu misolda Ali va Sardor qarzdorlar ro‘yxatiga kiritiladi. Vali esa to‘lovni to‘liq amalga oshirgani sababli ro‘yxatga kiritilmaydi.

---

## 2. Foydalanuvchi interfeysi

Quyidagi ikki variantdan faqat bittasini amalga oshirish talab etiladi.

### Variant A — Telegram bot

Telegram bot orqali qarzdorlarni ko‘rish va yangi to‘lov kiritish imkoniyati yaratiladi.

**Bot buyruqlari:**

`/debt`

Joriy oyda qarzdor bo‘lgan o‘quvchilar ro‘yxatini chiqaradi.

`/pay <student_id> <amount>`

Ko‘rsatilgan o‘quvchi uchun yangi to‘lovni qayd etadi.

### Variant B — Veb-interfeys

Mobil qurilmalarda foydalanishga qulay veb-sahifa ishlab chiqiladi.

**Asosiy funksiyalar:**

- Qarzdor o‘quvchilar ro‘yxatini ko‘rsatish.
- Yangi to‘lov kiritish uchun forma yaratish.
- Interfeysning telefon ekranlariga moslashuvini ta’minlash.

---

## 3. README hujjati

Loyihada `README.md` fayli bo‘lishi shart.

### 3.1. Ishga tushirish yo‘riqnomasi

README faylida loyihani noldan ishga tushirish uchun zarur bo‘lgan barcha buyruqlar ko‘rsatilishi kerak.

Boshqa dasturchi ushbu yo‘riqnoma yordamida loyihani yuklab olib, mustaqil ishga tushira olishi kerak.

### 3.2. Kelajakdagi yaxshilanishlar

Agar loyihani rivojlantirish uchun qo‘shimcha bir hafta vaqt berilsa, qanday yaxshilanishlar amalga oshirilishi haqida 3–5 ta taklif yozilishi kerak.

---

## 4. Sun’iy intellektdan foydalanish hisoboti

Loyihani ishlab chiqishda sun’iy intellekt vositalaridan foydalanish mumkin.

Topshiriq yakunida Telegram orqali **5–8 ta gapdan iborat hisobot** yuborilishi kerak.

Hisobotda quyidagi savollarga javob beriladi:

1. Qaysi AI vositalaridan foydalanildi?
2. Qaysi promptlar eng yaxshi natija berdi?
3. AI qanday xatolarga yo‘l qo‘ydi?
4. Ushbu xatolar qanday aniqlandi va tuzatildi?
5. Kodning qaysi qismlari mustaqil yozildi?
6. Qaysi qismlar AI yordamida yaratildi?

Hisobot haqiqiy bajarilgan ishlarga asoslanishi kerak.

---

## 5. Loyihani topshirish

Tayyor loyiha Telegram orqali **@code_debugger007** manziliga yuboriladi.

Quyidagi ma’lumotlar taqdim etilishi shart:

1. **GitHub repository havolasi** — ochiq yoki tekshiruvchilar uchun kirish huquqi berilgan.
2. **AI hisoboti** — 4-qismga muvofiq 5–8 ta gap.
3. **Sarflangan vaqt** — loyihaga jami necha soat ketgani.

## 6. Tekshirish mezonlari

Buyurtmachi loyihani quyidagi talablar bo‘yicha tekshiradi:

- O‘quvchilarni yaratish, ko‘rish, o‘zgartirish va o‘chirish.
- To‘lov qo‘shish va o‘quvchining to‘lovlarini olish.
- Belgilangan oy uchun qarzdorlarni to‘g‘ri hisoblash.
- Tanlangan Telegram bot yoki veb-interfeysning ishlashi.
- Loyihani ishga tushirish bo‘yicha README yo‘riqnomasi.
- Kelajakdagi yaxshilanishlar haqidagi 3–5 ta taklif.

Topshiriqning 1–3-qismlaridagi har bir talab kod va README bilan solishtirib tekshiriladi.

Agar ayrim talablar bajarilmagan bo‘lsa, bu haqda ochiq ma’lumot berilishi kerak.

---

**Loyihaning asosiy maqsadi:** o‘quv markazining oylik to‘lovlarini hisobga oladigan, qarzdorlarni aniqlaydigan va to‘lov kiritish imkoniyatini taqdim etadigan ishlaydigan kichik tizim yaratish.