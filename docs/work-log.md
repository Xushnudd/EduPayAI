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
