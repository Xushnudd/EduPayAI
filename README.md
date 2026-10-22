# EduPay

O‘quvchilar, to‘lovlar va oylik qarzdorliklarni boshqarish uchun Next.js va PostgreSQL asosidagi veb-ilova. Interfeys o‘zbek tilida va telefon ekranlariga mos.

## Talablar

- Node.js `>=22.12 <23` (masalan, Node 22 LTS) va npm
- PostgreSQL 18
- Mahalliy konteyner rejimi uchun Docker Engine va Docker Compose v2 plugin; Podman rejimi uchun Podman va `podman compose` ishga tushiradigan Compose provider

Loyiha Next.js 16.4.2 ishlatadi. Production build hozircha Next’ning rasmiy Webpack rejimida (`next build --webpack`) yig‘iladi.

## 1. Mahalliy o‘rnatish va npm dev

PostgreSQL’da ilova hamda alohida test bazasini yarating. Quyidagi misolda rol/baza nomlari `edupay`, parol esa faqat namuna:

```sh
sudo -u postgres psql -c "CREATE ROLE edupay LOGIN PASSWORD 'change_me';"
sudo -u postgres createdb -O edupay edupay
sudo -u postgres createdb -O edupay edupay_test
```

Repo’ni klonlab, `.env.example`’dan Git ignore qilinadigan `.env` nusxa oling. `DATABASE_URL` va `TEST_DATABASE_URL`-dagi parol hamda hostni o‘z PostgreSQL sozlamangizga moslang. Test URL alohida, `_test` bilan tugaydigan PostgreSQL bazasiga qarashi kerak.

```sh
git clone git@github.com:Xushnudd/EduPayAI.git
cd EduPayAI
cp .env.example .env
# .env dagi DATABASE_URL va TEST_DATABASE_URL qiymatlarini tahrirlang
npm ci
npx prisma generate
npx prisma migrate deploy
npm run db:seed       # ixtiyoriy demo yozuvlari
npm run dev
```

Ilova `http://127.0.0.1:3000` manzilida ochiladi. Ilova DB’si bo‘sh bo‘lsa, o‘quvchilarni UI orqali yarating. `npm run db:seed` 2026-10 demo ma’lumotlarini idempotent qo‘shadi; seed mavjud yozuvlarni o‘chirmaydi.

### Test, lint va build

```sh
npm run lint
npm run typecheck
npm run test:unit

# TEST_DATABASE_URL .env da alohida *_test bazasini ko‘rsatsin
set -a
. ./.env
set +a
npm run test:integration
npx playwright install chromium
npm run test:e2e

npm run build
npm start
```

Unit testlar Node test runner’da ishlaydi. Integration va E2E testlar faqat PostgreSQL nomi `_test` bilan tugaydigan `TEST_DATABASE_URL`-ni qabul qiladi; berilgan `DATABASE_URL` bilan bir xil DB bo‘lsa, testlar yozishdan oldin to‘xtaydi. Test oqimlari o‘z fixture’larini o‘chiradi. Playwright mobil (360×800) va desktop (1280×800) o‘lchamlarni ochadi. Build/start uchun ilova DB’si ulanishi shart emas, lekin sahifalardan foydalanish uchun DB kerak.

## 2. Docker Compose

Docker uchun kerakli Compose qiymatlari `.env.example` ichida namunaviy holatda bor. Haqiqiy parolni o‘zgartirib `.env` faylida saqlang. `COMPOSE_DATABASE_URL` ichidagi host aynan `db` bo‘ladi; DB porti hostga chiqarilmaydi.

```sh
cp .env.example .env
# .env ichida POSTGRES_PASSWORD va COMPOSE_DATABASE_URL parolini bir xil almashtiring
docker compose up --build -d
docker compose ps
docker compose logs -f app
```

Cold start’da app DB healthcheck’ini kutib, `prisma migrate deploy` bajaradi; muvaffaqiyatsiz migratsiyada web server ochilmaydi. Seed avtomatik yurmaydi. UI `http://127.0.0.1:3000` da ishlaydi. API ham shu manzilda mavjud.

```sh
docker compose restart app             # container qayta ishga tushadi
docker compose down                    # named DB volume saqlanadi
docker compose up -d                   # mavjud DB bilan qayta ko‘tarish
docker compose up --build -d app       # ilova image’ini qayta build qilish
docker compose down -v                 # DIQQAT: DB named volume va undagi yozuvlarni o‘chiradi
```

Migratsiya xatosi bo‘lsa `docker compose logs app` bilan sababni ko‘ring; app migratsiya muvaffaqiyatli bo‘lmaguncha so‘rov qabul qilmaydi. Migratsiyani tuzatib `docker compose up -d app` bilan qayta ishga tushiring. Ataylab noto‘g‘ri migratsiya holatini faqat alohida test project va disposable volume’da tekshiring (tekshiruv qaydi `docs/work-log.md`da); oddiy DB volume’ni saqlash uchun `down -v` ishlatmang. Boshqa loyihalar bilan 3000-port to‘qnashsa compose’dagi host portni bo‘sh portga o‘zgartiring.

## 3. Podman Compose

Podman’ning `compose` buyrug‘i tashqi Compose providerni chaqiradi. Podman hamda Docker Compose v2 mos provider o‘rnatilgan bo‘lsin (`podman compose version` bilan ko‘ring). Repo ayni `compose.yaml` va `Dockerfile`-dan foydalanadi:

```sh
cp .env.example .env
# .env dagi Compose parollarini mahalliy qiymatlarga almashtiring
podman compose up --build -d
podman compose ps
podman compose logs -f app
podman compose restart app
podman compose down
podman compose up -d
podman compose up --build -d app
podman compose down -v                 # DIQQAT: Podman named volume’dagi DB yozuvlarini o‘chiradi
```

Podman va Docker named volume’lari bir-biridan mustaqil. Boshqa engine’da ishlagan baza avtomatik ko‘rinmaydi. Rootless rejimda provider, port va volume ruxsatlari operatsion tizimga qarab farq qilishi mumkin. Compose app’ni faqat loopback `127.0.0.1:3000` ga publish qiladi; PostgreSQL servisining host porti yo‘q.

## API

Barcha JSON natijalar `{ "data": ... }` qobig‘ida qaytadi; xatolar `{ "error": { "code", "message", "fields?" } }` ko‘rinishida. Summa JSON’da kasrli satr (`"500000.00"`), to‘lov sanasi kalendar kuni (`YYYY-MM-DD`) sifatida beriladi.

| Method | URL | Vazifa |
|---|---|---|
| `GET` / `POST` | `/api/students` | O‘quvchilarni olish / yaratish |
| `GET` / `PATCH` / `DELETE` | `/api/students/{id}` | Bitta o‘quvchini olish / qisman tahrirlash / o‘chirish |
| `POST` | `/api/payments` | To‘lov kiritish (`studentId`, `amount`, `paidOn`) |
| `GET` | `/api/students/{id}/payments` | O‘quvchining barcha to‘lovlari, yangi sanadan boshlab |
| `GET` | `/debtors?month=YYYY-MM` | Tanlangan oy uchun qarzdorlar |

Masalan:

```sh
curl 'http://127.0.0.1:3000/debtors?month=2026-10'
curl -X POST http://127.0.0.1:3000/api/students \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ali","phone":"+998901234567","groupName":"Matematika","monthlyFee":"500000.00"}'
```

## Hisoblash qoidalari va cheklovlar

- `GET /debtors?month=YYYY-MM` to‘lovning `paidOn` sanasiga qarab oyni tanlaydi; `/debtors` UI’da joriy oy Toshkent vaqti bo‘yicha standart.
- Qarzdorlik `oylik tarif − shu oy to‘lovlari`, eng kami nol. Ortiqcha to‘lov keyingi oyga ko‘chmaydi.
- Tarif tarixchasi yoki o‘quvchining qabul sanasi saqlanmaydi. Shu sabab hozirgi tarif barcha ko‘rilayotgan oylar uchun ishlatiladi va barcha mavjud o‘quvchilar barcha oylar uchun hisoblanadi.
- O‘quvchini o‘chirish uning to‘lov yozuvlarini ham DB foreign key `ON DELETE CASCADE` orqali o‘chiradi.
- Bu topshiriq versiyasida autentifikatsiya/rol nazorati yo‘q; internetga ochiq production’da ishlatishdan oldin kirish nazorati qo‘shilishi kerak.
- `.env` va DB dump’larini repository’ga qo‘shmang; `.env.example` maxfiy qiymatlarsiz namuna.

## Keyingi hafta uchun takliflar

1. Autentifikatsiya, rollar va audit jurnali qo‘shib, moliyaviy ma’lumotlarga kirishni cheklash.
2. Tarif va o‘quvchining qabul/chiqish sanalari tarixini yuritib, eski oy qarzlarini to‘g‘ri qayta hisoblash.
3. O‘quvchini o‘chirish o‘rniga arxivlash va o‘chirilgan to‘lovlar bo‘yicha audit izini saqlash.
4. To‘lovni xizmat oyiga bog‘lash, kreditni oylar orasida taqsimlash va qaytarimlarni boshqarish.
5. CI’da PostgreSQL testlari, image build va dependency/security tekshiruvlarini avtomatik bajarish.

Hisobot, ish jurnali va topshirish holati: [`docs/ai-report.md`](docs/ai-report.md), [`docs/work-log.md`](docs/work-log.md), [`docs/submission.md`](docs/submission.md).
