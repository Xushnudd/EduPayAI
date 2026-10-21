# EduPay — haqiqiy ish jurnali

## Hisoblash qoidasi

Vaqt: ish sessiyasining kuzatilgan wall-clock oralig‘i, kutish/o‘rnatish bilan birga; parallel amallar ikki marta qo‘shilmaydi. Avvalgi rejalashtirish vaqtiga aniq o‘lchov yo‘q, shu sabab umumiy implementatsiya vaqtiga qo‘shilmaydi. Foydalanuvchi talab va tasdiq berdi; ushbu sessiyadagi kodni Codex yaratmoqda. Inson tomonidan kod tahriri hozircha kuzatilmadi.

## 2026-10-21 — TASK-001, boshlandi

- Sessiya boshi: taxminan 15:28 Asia/Tashkent (10:28 UTC).
- TASK.md va PLAN.md o‘qildi; Git boshlang‘ich commit: c395dda.
- Muhitda Node.js/npm topilmadi. Node.js 22.23.3 /tmp’ga yuklandi; SHA-256 rasmiy checksum bilan mos.
- Sandbox DNS va Podman runtime yozuviga ruxsat bermadi; escalation orqali yuklash va Podman read-only info muvaffaqiyatli bajarildi. Birinchi Podman approval ko‘rib chiqilishi timeout bo‘ldi, bitta qayta urinish o‘tdi.
- Docker CLI va host PostgreSQL topilmadi; Podman rootless mavjud, Compose provider /usr/local/bin/docker-compose v5.6.0.
- Next.js 16.4.2, React, TypeScript strict va Tailwind boshlang‘ich fayllari yaratildi; o‘rnatish/tekshiruv davom etmoqda.
- Samarali prompt: foydalanuvchining har vazifani tekshirish, jurnal, progress va alohida commit bilan bajarish ko‘rsatmasi ish oqimini aniq belgiladi.
- Holat: TASK-001 hali tugamagan; test natijasi hali yo‘q.

### TASK-001 natijasi

- 15:28–15:34 Asia/Tashkent, taxminan 6 daqiqa (muhit tayyorlash bilan).
- `npm run lint` va `npm run typecheck`: exit 0; GET / HTTP 200, EduPay matni tekshirildi.
- PostCSS anonim default export lint warning’i nomlangan config bilan tuzatildi. Sandbox listen EPERM bo‘ldi; ruxsatli lokal server orqali HTTP tekshirildi.
- npm audit: 5 high yozuv bitta braces transitive development/lint zanjiriga tegishli; runtime o‘rnatishda 0 zaiflik qayd etilgan. Force downgrade qilinmadi; keyingi final auditda qayta tekshiriladi.
- TASK-001 yakunlandi; Next.js yaratgan AGENTS.md loyiha bilan saqlanadi.

### TASK-002 — 2026-10-21T10:33:09+00:00

Jurnal tekshirildi: boshlanish vaqti, wall-clock hisoblash qoidasi, AI/inson hissasi, haqiqiy xatolar va tekshiruv natijalari bor. TASK-001 vaqt oralig‘iga qo‘shilgan boshlang‘ich yozuvlar takror hisoblanmaydi; ushbu tekshiruv taxminan 1 daqiqa.

### TASK-003 — 2026-10-21T10:33:39+00:00

Taxminan 1 daqiqa. Env valid/yo‘q/noto‘g‘ri URL uchun 3 assertion o‘tdi; .env va .env.local git ignore bilan himoyalangan. Maxfiy qiymatlar browserga uzatilmagan.

### TASK-039 — 2026-10-21T10:33:41+00:00

Taxminan 1 daqiqa. Namunada lokal localhost va Compose db URL ajratildi, POSTGRES qiymatlari mos; secret yo‘q; NEXT_PUBLIC URL yo‘qligi assertion bilan tekshirildi.

### TASK-004 — 2026-10-21T10:35:01+00:00

Taxminan 2 daqiqa. Prisma 7.10.1 client/adapter bilan pinlandi. Student/Payment, Decimal/date, Cascade va indekslar yaratildi. prisma format va validate exit 0. Prisma 7 rasmiy hujjatiga mos pg adapter va ESM tanlandi: https://www.prisma.io/docs/orm/v7 .

### TASK-005 — 2026-10-21T10:35:35+00:00

Taxminan 1 daqiqa. Real PostgreSQL 18: migrate deploy o‘tdi, qayta deploy no pending; zero fee CHECK va orphan Payment FK rad etildi, indekslar psql orqali tekshirildi.

### TASK-006 — 2026-10-21T10:36:01+00:00

Taxminan 1 daqiqa. Lazy server-only singleton yaratildi; typecheck o‘tdi; singleton identity va real SELECT 1 [{ok:1}] tekshirildi. Build paytida DB talab qilinmaydi.

### TASK-007 — 2026-10-21T10:36:31+00:00

Taxminan 1 daqiqa. Seed ikki marta exit 0; real DB count 3 student va 2 payment, dublikat yo‘q. 2026-10 demo oyi aniq; begona yozuvlar o‘chirilmaydi.

### TASK-008 — 2026-10-21T10:37:02+00:00

Taxminan 2 daqiqa. 7 API helper assertion o‘tdi: statuslar, envelope, invalid JSON. tsx CLI sandbox IPC xatosi node --import tsx orqali tuzatildi; DB kerak bo‘lmagan tekshiruv sandbox ichida o‘tdi.

### TASK-009 — 2026-10-21T10:37:04+00:00

Taxminan 1 daqiqa. Zod strict sxemalar: 14 assertion o‘tdi, jumladan summa chegaralari, kabisa, oy, telefon normallashuvi va bo‘sh PATCH.

### TASK-010 — 2026-10-21T10:37:52+00:00

Taxminan 1 daqiqa. Real HTTP POST 201, GET 200, invalid POST 400; Decimal 100.10 aynan saqlandi.

### TASK-011 — 2026-10-21T10:37:57+00:00

Taxminan 1 daqiqa. HTTP GET/PATCH 200; maydonlar saqlandi; empty PATCH va invalid UUID 400, missing UUID 404.

### TASK-011 tekshiruv qaydiga tuzatish

Birinchi PATCH smoke assertion 500 sabab o‘tmadi, lekin orchestration keyingi mark/commit’ni to‘xtatmagan: oldingi TASK-011 muvaffaqiyat qaydi shu paytda noto‘g‘ri edi. Bu agentning jarayon xatosi. Typecheck o‘tdi; yangi yozuv bilan PATCH/GET 200, unchanged fee, empty PATCH 400, invalid UUID 400, missing UUID 404 qayta tekshirilib barchasi o‘tdi. Dastlabki 500 aniq sababi hali isbotlanmagan (dev recompilation vaqtida sodir bo‘lgan); integration testda takror tekshiriladi. Keyingi mark/commit faqat alohida tool natijasi ko‘rilgach bajariladi. Qayta tekshiruv taxminan 1 daqiqa.

### TASK-012 — 2026-10-21T10:38:54+00:00

Taxminan 1 daqiqa. Test student uchun payment yaratildi; HTTP DELETE 204, DB payment count 0, takroriy DELETE 404. Faqat sessiya yaratgan fixture o‘chirildi.

### TASK-013 — 2026-10-21T10:39:14+00:00

Taxminan 1 daqiqa. HTTP payment 201, amount 0.10/date 2024-02-29 aniq; invalid amount 400; missing student 404.

### TASK-014 — 2026-10-21T10:39:32+00:00

Taxminan 1 daqiqa. Ikki oydagi to‘lovlar sana tartibida qaytdi, studentId isolation, bo‘sh tarix 200 [], missing student 404 HTTP tekshirildi.

### TASK-015 — 2026-10-21T10:39:53+00:00

Taxminan 1 daqiqa. Decimal 40-digit hisoblash: 0.10+0.20=0.30, partial debt, overpayment va ustun limitidan katta agregatsiya bo‘yicha 4 assertion o‘tdi.

### TASK-016 — 2026-10-21T10:40:19+00:00

Taxminan 1 daqiqa. Kabisa oyi, dekabr-yanvar, 0001 yil, 9999-12 va Toshkent oy almashishi bo‘yicha 5 assertion o‘tdi.

### TASK-017 — 2026-10-21T10:40:39+00:00

Taxminan 1 daqiqa. Real PostgreSQL: Ali 200000, Sardor 450000, Vali yo‘q; qo‘shni oy Ali 500000. Ikki bulk query, RepeatableRead, Decimal birlashtirish.
