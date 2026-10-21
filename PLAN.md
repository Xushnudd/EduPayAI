# EduPay — amalga oshirish rejasi

> Holat: rejalashtirish tugallangan, amalga oshirish boshlanmagan. Asosiy talablar manbasi — `TASK.md`; u o‘zgartirilmaydi. Konteynerlashtirish talablari foydalanuvchining qo‘shimcha ko‘rsatmasidan olingan. Ushbu reja tasdiqlanmaguncha paket o‘rnatish, kod yozish, migratsiya yaratish yoki dasturni ishga tushirish boshlanmaydi.

## A. Loyiha haqida

### Maqsad va yakuniy natija

O‘quv markazi o‘quvchilari, ularning to‘lovlari va tanlangan oydagi qarzdorlikni boshqaruvchi kichik, lokal ishga tushiriladigan tizim yaratish. Frontend va REST API bitta Next.js loyihasida ishlaydi. Yakuniy natija: tekshirilgan dastur, PostgreSQL sxemasi va migratsiyalar, mobil veb-interfeys, qayta bajariladigan testlar, to‘liq README hamda topshirish materiallari.

### Qat’iy texnologiyalar

| Qatlam | Tanlov |
|---|---|
| Framework va frontend | Next.js App Router, React |
| Til | TypeScript, strict rejim |
| UI | Tailwind CSS |
| Backend | Next.js Route Handlers, REST API, Node.js runtime |
| Ma’lumotlar | PostgreSQL, Prisma ORM |
| Paket menejeri | npm, versiyalarni qayta tiklash uchun `package-lock.json` |
| Konteynerlar | Docker Compose; ayni konfiguratsiya bilan Podman Compose mosligini tekshirish |
| Rejalashtirilgan yordamchi vositalar | Zod validatsiyasi, Vitest, Playwright |

Amalga oshirish boshlanganda o‘zaro mos barqaror versiyalar tanlanadi va Node.js/npm talablari README’da yoziladi. Hozir versiyalarni taxminan pinlash yoki paket o‘rnatish talab etilmaydi.

### Majburiy talablar va kuzatuv jadvali

| Talab | Natija | Tegishli vazifalar |
|---|---|---|
| Ism, telefon, guruh, oylik to‘lov; o‘quvchi CRUD | API va sodda boshqaruv UI | TASK-004–005, TASK-010–012, TASK-020–021 |
| Summa, sana, o‘quvchi; to‘lov qo‘shish va tarix | API, forma va tarix ro‘yxati | TASK-013–014, TASK-022–023 |
| Berilgan oy qarzdorlari va qolgan summa | Aynan `/debtors?month=YYYY-MM`, mobil ro‘yxat | TASK-015–018, TASK-024 |
| B variant — mobil veb-interfeys | Qarzdorlar va to‘lov formasi telefon ekranida ishlaydi | TASK-019–026, TASK-031 |
| Noldan ishga tushirish README’si | Tekshirilgan buyruqlar, sozlamalar, API tavsifi | TASK-033, TASK-036 |
| Bir haftalik yaxshilanishlar | README’da 3–5 ta taklif | TASK-034 |
| Haqiqiy AI hisoboti | 5–8 gap, barcha 6 savolga javob | TASK-002, TASK-035 |
| Konteynerlashtirish va lokal development | Faqat app/db, named volume, avtomatik migratsiya, Docker/Podman va npm dev | TASK-039–046 |
| Topshirish | GitHub havolasi, AI hisoboti, jami soat; Telegram `@code_debugger007` | TASK-037–038 |

Telegram bot, autentifikatsiya, rollar, to‘lov provayderi, tarif tarixi, eksport, alohida backend, Redis, Nginx va bulut deployment infratuzilmasi ushbu uch kunlik ish doirasiga kirmaydi. UI’dagi o‘quvchi CRUD va tarix API’ni amalda tekshirishni osonlashtiruvchi sodda sahifalar bo‘ladi.

## B. Arxitektura

### Belgilanmagan tafsilotlar uchun taxminlar

1. **Valyuta:** UZS. Barcha pul qiymatlari `Decimal(14,2)`; API’da masalan `"500000.00"` shaklidagi satr. Hisoblashda JavaScript `number`, `parseFloat` va ikkilik kasr arifmetikasi ishlatilmaydi. Maksimum `999999999999.99`; ikki kasr xonasidan ortiq qiymat yaxlitlanmaydi, rad etiladi. Oylik to‘lov va yangi to‘lov summasi noldan katta.
2. **Sana:** to‘lov sanasi vaqt emas, `YYYY-MM-DD` kalendar kuni; PostgreSQL `date` turida saqlanadi. Prisma orqali UTC yarim tun ko‘rinishida xaritalanadi, UI’da vaqt zonasiga ko‘ra siljitilmaydi. Joriy kun/oy standart qiymati `Asia/Tashkent` bo‘yicha olinadi. Haqiqiy kalendar sanasi, jumladan kabisa yili tekshiriladi. Kelajak sana ham ruxsat etiladi — talab buni taqiqlamaydi.
3. **Oyga tegishlilik:** to‘lov aynan `paidOn` sanasining oyiga kiradi. Alohida xizmat oyi yo‘q. Oldingi oy uchun bugun kiritilgan to‘lov bugungi oyga hisoblanadi; tarixiy sana kiritish mumkin. Ortiqcha to‘lov boshqa oyga ko‘chmaydi.
4. **Tarif:** hisoblashda o‘quvchining hozirgi `monthlyFee` qiymati ishlatiladi; tarif o‘zgartirilsa oldingi oy natijalari ham o‘zgaradi. Tarif tarixini yuritish talabda yo‘q. Bu cheklov README va tahrirlash formasida tushuntiriladi.
5. **Hisoblanadigan o‘quvchilar:** ro‘yxatdagi barcha o‘quvchilar har qanday so‘ralgan oy uchun hisoblanadi. Qabul sanasi yoki faol holat yo‘qligi sababli yaratilgan sana bo‘yicha filtr, oylik proporsiya va o‘qishni tugatish qoidasi kiritilmaydi.
6. **O‘chirish:** haqiqiy o‘chirish; bog‘liq to‘lovlar FK `onDelete: Cascade` bilan birga o‘chadi. Bu sodda test tizimi uchun tanlov. UI tasdiqlash oynasida tarix ham o‘chishini aniq aytadi; bekor qilish mumkin. Moliyaviy arxiv talab qilinsa bu qaror qayta ko‘riladi.
7. **Telefon va guruh:** telefon satr, majburiy, bo‘shliq/tire/qavslar normallashtiriladi, ixtiyoriy boshlang‘ich `+` va 7–15 raqam; telefon yagona bo‘lishi shart emas. Guruh alohida jadval emas, matn. Bir xil ismga ruxsat beriladi.
8. **Kichik hajm:** pagination, qidiruv va saralash UI’si talab qilinmaydi; ro‘yxatlar deterministik tartibda qaytariladi. Bir xil o‘quvchi, sana va summali ikkita to‘lov haqiqiy ikki to‘lov bo‘lishi mumkin; deduplikatsiya qilinmaydi. UI yuborish davomida tugmani bloklaydi, POST’ni avtomatik qayta yubormaydi.
9. **Kirish:** login talab qilinmagan, lokal demo uchun autentifikatsiyasiz ishlaydi. Haqiqiy shaxsiy ma’lumotlar seed yoki repozitoriyga kiritilmaydi; ochiq internetga chiqarish bu rejada majburiy emas.

Tasdiqlashda ayniqsa 3–6-bandlar biznes qoidalari sifatida ko‘rib chiqiladi. O‘zgartirish so‘ralmasa keyingi amalga oshirish shu taxminlarga tayanadi.

### Papkalar strukturasi

Quyidagi daraxt kelajakdagi fayllar rejasidir, hozir ularni yaratish nazarda tutilmagan.

```text
EduPay/
  TASK.md
  PLAN.md
  README.md
  .env.example
  .gitignore
  Dockerfile
  .dockerignore
  compose.yaml
  docker/
    entrypoint.sh
    wait-for-db.mjs
  package.json
  package-lock.json
  prisma.config.ts                 # tanlangan Prisma versiyasi talab etsa
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    app/
      layout.tsx
      page.tsx                    # / — qarzdorlar ekrani
      globals.css
      error.tsx
      not-found.tsx
      students/
        page.tsx
        [id]/page.tsx             # ma’lumot, tahrirlash, tarix
      payments/new/page.tsx
      api/
        students/route.ts
        students/[id]/route.ts
        students/[id]/payments/route.ts
        payments/route.ts
      debtors/route.ts            # aynan GET /debtors
    components/
      app-shell.tsx
      student-form.tsx
      student-list.tsx
      delete-student-dialog.tsx
      payment-form.tsx
      payment-list.tsx
      debtors-list.tsx
      month-picker.tsx
      ui-state.tsx
    lib/
      prisma.ts
      env.ts
      api-client.ts
      api-response.ts
      errors.ts
      money.ts
      dates.ts
      validation.ts
    services/
      students.ts
      payments.ts
      debtors.ts
  tests/
    unit/
    integration/
    e2e/
    helpers/
  vitest.config.ts
  playwright.config.ts
  docs/
    work-log.md
    ai-report.md
    submission.md
```

Qolgan Next.js, TypeScript, lint va Tailwind konfiguratsiya fayllari tanlangan versiyaga mos standart setup orqali hosil qilinadi. Keraksiz repository/DI qatlamlari kiritilmaydi.

### Ma’lumotlar bazasi va Prisma sxemasi

| Model | Maydon | Tur va cheklov |
|---|---|---|
| Student | id | UUID, PK, avtomatik |
| Student | name | varchar(100), majburiy |
| Student | phone | varchar(20), majburiy, unique emas |
| Student | groupName | varchar(100), majburiy |
| Student | monthlyFee | Decimal(14,2), majburiy, CHECK > 0 |
| Student | createdAt, updatedAt | avtomatik audit timestamp’lari |
| Payment | id | UUID, PK, avtomatik |
| Payment | studentId | Student.id FK, majburiy, onDelete Cascade |
| Payment | amount | Decimal(14,2), majburiy, CHECK > 0 |
| Payment | paidOn | Prisma DateTime / PostgreSQL date, majburiy |
| Payment | createdAt | avtomatik timestamp |

Bog‘lanish: `Student 1 → N Payment`; `Student.payments` va `Payment.student`. Indekslar: `Payment(studentId, paidOn)` tarix uchun va `Payment(paidOn)` oy bo‘yicha agregatsiya uchun. Musbat summa CHECK cheklovlari Prisma deklaratsiyasi yetarli bo‘lmasa SQL migratsiyada yoziladi. DB aniqlikni ta’minlaydi, ikki xonadan ortiq kasrni rad etish esa API chegarasida bajariladi.

### API shartnomasi

| Metod | URL | Kirish | Muvaffaqiyat natijasi |
|---|---|---|---|
| POST | `/api/students` | name, phone, groupName, monthlyFee | 201, yangi o‘quvchi |
| GET | `/api/students` | yo‘q | 200, o‘quvchilar massivi |
| GET | `/api/students/:id` | UUID | 200, o‘quvchi |
| PATCH | `/api/students/:id` | kamida bitta tahrirlanadigan maydon | 200, yangilangan o‘quvchi |
| DELETE | `/api/students/:id` | UUID | 204, tanasiz javob |
| POST | `/api/payments` | studentId, amount, paidOn | 201, yaratilgan to‘lov |
| GET | `/api/students/:id/payments` | UUID | 200, barcha to‘lovlar |
| GET | `/debtors?month=YYYY-MM` | majburiy haqiqiy oy | 200, oy va qarzdorlar massivi |

Qarzdorlar manziliga `/api` prefiksi qo‘shilmaydi: `TASK.md` bilan aynan mos qoladi. UI bosh sahifada bo‘lgani sababli `/debtors` uchun page/route to‘qnashuvi bo‘lmaydi.

Javoblar: muvaffaqiyatda `{ data: ... }`, xatoda `{ error: { code, message, fields? } }`. Qarzdorlar `data`si `{ month, debtors: [...] }`; elementda `studentId`, `name`, `phone`, `groupName`, `monthlyFee`, `paidTotal`, `debt`. Pul maydonlari doim ikki kasr xonali satr. Sanalar `YYYY-MM-DD`; texnik timestamp’lar ISO 8601. O‘quvchilar ism va id, tarix paidOn kamayish tartibi va id, qarzdorlar ism va id bo‘yicha saralanadi.

Xatolar: noto‘g‘ri JSON/query/UUID/maydon — 400; mavjud bo‘lmagan o‘quvchi — 404; parallel yozishdagi mos konflikt — 409; DB ulanishi yo‘q — 503; kutilmagan xato — 500. Qo‘llanmaydigan metod — 405. Stack trace va DB rekvizitlari mijozga qaytmaydi. Mavjud o‘quvchining bo‘sh tarixi 200 va `[]`, mavjud bo‘lmagan o‘quvchining tarixi 404. Bo‘sh qarzdorlar ro‘yxati ham 200.

### Validatsiya, biznes mantiq va qatlamlar

- Ism/guruh trim’dan keyin 1–100 belgi. Majburiy satrlar null yoki bo‘sh bo‘lmaydi. PATCH’da bo‘sh obyekt, noma’lum maydon, id/timestamp’ni tahrirlash rad etiladi. UI va API bir xil asosiy sxemalarga tayanadi; server qayta tekshirishi shart.
- Pul uchun faqat oddiy musbat o‘nlik satr: eksponent, NaN, Infinity, vergul, manfiy, nol, ortiqcha aniqlik va diapazondan tashqari qiymat rad etiladi. `"500"` qabul qilinib javobda `"500.00"` bo‘ladi.
- Oy qat’iy `YYYY-MM`, yil 0001–9999, oy 01–12; sana haqiqiy kalendar kuni. Yuqori chegaradagi 9999-12 oyi keyingi yil sanasini yasamasdan shu oyning oxirgi kunigacha inkluziv filtr bilan ishlanadi va testlanadi.
- Odatdagi oy uchun `paidOn >= oy boshi AND paidOn < keyingi oy boshi`. 9999-12 uchun yuqoridagi maxsus chegara qo‘llanadi. SQL agregatsiya `SUM(amount)`ni o‘quvchi bo‘yicha hisoblaydi; to‘lov yo‘qligida summa Decimal nol.
- Barcha o‘quvchilar va oy agregatsiyasi bitta izchil snapshot’da olinadi: Prisma qisqa read transaction, RepeatableRead. Har o‘quvchiga alohida query bajarilmaydi; ikki ommaviy query va xotirada id bo‘yicha birlashtirish yetarli.
- `debt = monthlyFee − paidTotal`. Faqat `debt > 0` elementlar qaytariladi. To‘liq va ortiqcha to‘lov qilganlar chiqarilmaydi; qarz sifatida manfiy qiymat ko‘rsatilmaydi. Natija alohida jadvalda saqlanmaydi.
- React forma/ro‘yxat → umumiy fetch client → Route Handler → validatsiya/service → Prisma → PostgreSQL. Javobda Decimal va date aniq serializatsiya qilinadi. Prisma va server modullari brauzer bundle’iga kiritilmaydi.
- Mutatsiyadan keyin tegishli ro‘yxat qayta olinadi; ma’lumotlar uchun eski Next.js cache natijasi qaytmasligi aniq sozlanadi. Oy tez almashtirilganda oldingi so‘rov bekor qilinadi yoki uning natijasi e’tiborsiz qoldiriladi.

### Frontend sahifalari

| Sahifa | Komponentlar va xatti-harakat |
|---|---|
| `/` | MonthPicker + DebtorsList; standart joriy oy, qarz/to‘langan/tarif, to‘lov kiritishga havola |
| `/students` | StudentList + StudentForm; yaratish, tafsilotga o‘tish |
| `/students/[id]` | StudentForm + DeleteStudentDialog + PaymentList; tahrirlash, o‘chirish, tarix, oldindan tanlangan o‘quvchiga to‘lov |
| `/payments/new` | PaymentForm; o‘quvchi tanlash, summa va sana, natija/xato |

AppShell navigatsiyani birlashtiradi; UIState yuklanish, bo‘sh holat va qayta urinishni bir xil ko‘rsatadi. Kichik ekranda jadval kartalar yoki sig‘adigan ustunlarga o‘tadi; 360 px’da gorizontal sahifa scroll’i bo‘lmaydi. Label, klaviatura fokusi, xato bilan input bog‘lanishi va status e’loni mavjud bo‘ladi.

### Environment va lokal ishga tushirish

- `.env.example`: maxfiy bo‘lmagan namuna `DATABASE_URL` va alohida DB’ga yo‘naltirilgan `TEST_DATABASE_URL`. Ulanish URL’lari `NEXT_PUBLIC_*` orqali ochilmaydi. `NODE_ENV` framework tomonidan boshqariladi; ilova vaqt zonasi `Asia/Tashkent` doimiy qiymati bilan hujjatlashtiriladi.
- README ketma-ketligi: talab etilgan Node.js/npm va PostgreSQL → repository clone → `.env.example`ni `.env`ga nusxalash → lokal app/test DB yaratish → URL’larni sozlash → `npm ci` → `npx prisma generate` → `npx prisma migrate deploy` → ixtiyoriy `npm run db:seed` → `npm run dev` → lokal URL’ni ochish.
- Ishlab chiqishda yangi migratsiya uchun `npx prisma migrate dev`; tayyor loyihani tekshiruvchiga ishga tushirishda mavjud migratsiyalarni qo‘llash yetarli. Build tekshiruvi: `npm run build`, so‘ng `npm run start`.
- Test skriptlari: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`. E2E’dan oldin Playwright brauzerini o‘rnatish buyrug‘i README’da beriladi. Test serveri ham faqat test DB’dan foydalanadi.

### Konteynerlashtirish arxitekturasi

**Ikkita doimiy servis:** `app` — bitta Next.js Node.js jarayoni, React, REST API va Prisma; `db` — bitta PostgreSQL instance. Alohida migratsiya servisi, reverse proxy, Redis, worker yoki backend konteyneri qo‘shilmaydi. Testlar uchun yangi doimiy servis talab qilinmaydi.

| Qism | Rejalashtirilgan yechim |
|---|---|
| App porti | Konteynerda `0.0.0.0:3000`; host mapping `127.0.0.1:3000:3000`; foydalanuvchi `http://localhost:3000`ni ochadi |
| DB porti | `compose.yaml`da `db.ports` yo‘q; app ichki tarmoqda `db:5432` orqali ulanadi |
| Tarmoq | Ikkala servis uchun bitta Compose boshqaradigan xususiy bridge tarmoq; host network va statik IP yo‘q. Bu servislararo tarmoq; `internal: true` talab qilinmaydi |
| Saqlash | PostgreSQL data katalogiga `postgres_data` named volume; mount yo‘li tanlangan PostgreSQL major image’iga mos tekshiriladi |
| Instance soni | Standart Compose ishga tushirishida app=1, db=1; scale, replicas va process cluster qo‘llanmaydi |
| DB healthcheck | Image ichidagi `pg_isready`, belgilangan user/database, interval/timeout/retries/start_period; Compose va konteyner env interpolation’i ajratiladi |
| Startup | `depends_on: condition: service_healthy` va app ichida chegaralangan haqiqiy DB ulanish tekshiruvi |

Compose healthcheck’ni kutishi uchun `service_healthy` sharti ishlatiladi. [Docker startup tartibi](https://docs.docker.com/compose/how-tos/startup-order/). Podman uchun ayni YAML va standart build/network/volume/healthcheck imkoniyatlari tanlanadi; Docker’ga xos socket, privileged rejim, bind mount va BuildKit-only imkoniyatlar kiritilmaydi. `podman compose` tashqi provayderga tayanadi, shuning uchun engine va provayder versiyasi yoziladi va amalda tekshiriladi. [Podman Compose hujjati](https://docs.podman.io/en/latest/markdown/podman-compose.1.html).

**Multi-stage image:** dependencies → builder → runner. Bir xil mos Node.js Debian slim oilasi, npm lockfile orqali `npm ci`, builder’da Prisma generate va Next.js build. Soddalik uchun runner’da `.next`, zarur public fayllar, package metadata, runtime dependencies, generatsiya qilingan Prisma client, schema, migratsiyalar va kerakli Prisma konfiguratsiyasi bo‘ladi; Next.js production serveri ishga tushiriladi. Standalone optimizatsiyasi majburiy emas. Prisma CLI va uning konfiguratsiyasi import qiladigan paketlar runner’da aniq mavjud bo‘ladi; startup vaqtida internetdan `npx` orqali paket yuklanmaydi. App non-root user bilan ishlaydi; zarur cache kataloglari yoziladigan bo‘ladi. Build DB ulanishisiz o‘tadi; haqiqiy URL/parol image ARG/ENV yoki qatlamlariga yozilmaydi.

**Migratsiya hayot sikli:** app entrypoint → DB’ga cheklangan muddatli ulanish tekshiruvi (masalan, jami 60 soniya) → oldindan yozilgan migratsiyalarni `prisma migrate deploy` bilan qo‘llash → muvaffaqiyatdan keyin `exec` orqali bitta Next.js serverini ishga tushirish. Kutish skripti serverdagi Prisma client/driver bilan `SELECT 1` tekshiradi va ulanishni yopadi; parol/URL’ni log qilmaydi. DB tayyor bo‘lmasa yoki migratsiya muvaffaqiyatsiz bo‘lsa nonzero exit; app trafik qabul qilmaydi. Migratsiya xatosi avtomatik reset yoki cheksiz retry bilan yashirilmaydi; standart restart siyosati avtomatik qayta urinishsiz bo‘ladi. Tuzatishdan keyin app qo‘lda qayta ishga tushiriladi.

Mavjud rejaning schema/migrations va `migrate deploy` oqimini saqlash uchun TASK-004’da shu buyruqlarni qo‘llaydigan Prisma ORM 7.x’ning mos patch versiyasi client bilan bir xil pinlanadi. Yangi major’ga yashirin o‘tish qilinmaydi: joriy Prisma hujjati keyingi major’da buyruqlar o‘zgarganini ko‘rsatadi. [Prisma migratsiya hujjati](https://www.prisma.io/docs/orm/migrations/applying-a-migration). Amalga oshirishda tanlangan versiya hujjati bilan CLI, adapter va Node.js mosligi qayta tekshiriladi.

Migratsiya har app start’da tekshiriladi; avval qo‘llanganlari takroran qo‘llanmaydi. Avtomatik seed, `migrate dev`, `db push`, `migrate reset`, volume o‘chirish yoki buzilgan migratsiyani avtomatik resolve qilish yo‘q. Bitta app instance migratsiya raqobatini soddalashtiradi. Bu ixtiyoriy SQL’ni zararsiz qilmaydi: migratsiya diff’i ko‘rib chiqiladi, mavjud ma’lumotga ta’sir qiluvchi o‘zgarishdan oldin backup olinadi; xatoda operator sababni tekshiradi.

### Environment va ikki ish rejimi

`.env.example` faqat soxta namunalarni saqlaydi: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `COMPOSE_DATABASE_URL`, `DATABASE_URL`, `TEST_DATABASE_URL`. `COMPOSE_DATABASE_URL` hosti `db`, lokal `DATABASE_URL` hosti `localhost`; Compose app ichida birinchisi `DATABASE_URL` sifatida aniq uzatiladi. DB user/parol/nom ikkala Compose qiymatida mos bo‘lishi kerak; URL’dagi maxsus belgilar percent-encode qilinishi tushuntiriladi. Majburiy qiymat yetishmasa Compose konfiguratsiyasi ishga tushmasdan xato beradi. Faqat kerakli env qiymatlar servisga uzatiladi; butun `.env` app’ga ko‘chirilmaydi.

`.env`, `.env.*` (namunadan tashqari), credential fayllari va dump’lar Git’dan ham, build context’dan ham chiqariladi. `.dockerignore` shuningdek `.git`, `node_modules`, `.next`, test report/coverage va lokal log’larni chiqaradi; schema, migratsiya va build fayllari qoladi. `.env.example` Git’da qolishi ataylab ruxsat etilgan, haqiqiy qiymatlar esa yo‘q. Compose konfiguratsiyasining interpolatsiya qilingan chiqishi maxfiy bo‘lishi mumkin; uni jurnal/GitHub’ga yozmaslik rejalashtiriladi.

1. **Docker Compose:** `.env`ni namunadan tayyorlash → `docker compose config --quiet` → `docker compose up --build -d` → `docker compose ps` va `docker compose logs app` → `http://localhost:3000`. DB tayyorligi va migratsiya startup oqimida bajariladi. Keyingi start: `docker compose up -d`; kod/dependency o‘zgargan production image uchun rebuild.
2. **Podman Compose:** engine va tanlangan Compose provayderi o‘rnatilganini tekshirish → ayni `.env` va `compose.yaml` bilan `podman compose up --build -d` → `podman compose ps`/`logs app`. `podman-compose` to‘g‘ridan-to‘g‘ri ishlatilsa ham ayni YAML. Qo‘llab-quvvatlash faqat amalda sinalgan engine/provayder/OS uchun qayd etiladi; mavjud bo‘lmagan muhit uchun sinov natijasi to‘qilmaydi.
3. **Docker’siz development:** hostdagi PostgreSQL + hostdagi Node.js, yuqoridagi lokal `DATABASE_URL` va alohida test DB → `npm ci` → Prisma generate/migrate → `npm run dev`. Hot reload ishlaydi; image rebuild kerak emas. Bu rejim Docker/Podman o‘rnatilishini talab qilmaydi. Compose app va lokal Next.js bir paytda 3000 portni egallamasligi uchun rejim almashtirishda oldingisi to‘xtatiladi. Standart yopiq Compose DB porti lokal development uchun ochilmaydi; host PostgreSQL alohida development bazasidir.

Oddiy `docker compose down` yoki `podman compose down` named volume’ni saqlashi kerak; keyingi up’da yozuvlar qaytadi. `down -v` ma’lumotni o‘chirishi README’da aniq ko‘rsatiladi va odatiy ko‘rsatmaga kiritilmaydi. Bir xil project nomi/katalogdan foydalanish tushuntiriladi; boshqa nom boshqa volume yaratishi mumkin. Docker va Podman alohida storage ishlatadi — bir engine’da yozilgan ma’lumot ikkinchisiga avtomatik ko‘chmaydi. Mavjud volume’da `.env`dagi PostgreSQL parolini o‘zgartirish DB parolini avtomatik o‘zgartirmaydi.

## C. Ish bosqichlari

| Bosqich | Vazifalar | Yakuniy natija |
|---|---|---|
| 1. Project Setup | 001–003 | Ishlaydigan loyiha asosi, ish jurnali, env shartnomasi |
| 2. Database Design | 004–005 | Modellar, FK, indeks va cheklovlar |
| 3. Prisma Integration | 006–007 | Server client va takrorlanuvchi demo ma’lumotlar |
| 4. Backend API | 008–014 | O‘quvchi CRUD va to‘lov API’si |
| 5. Business Logic | 015–018 | Aniq pul/sana hisoblash va qarzdorlar endpointi |
| 6. Frontend UI | 019–024 | Barcha asosiy ekranlar |
| 7. API Integration | 025–026 | API’ga ulangan foydalanuvchi oqimlari |
| 8. Validation & Error Handling | 027–028 | UI/server cheklovlari, nosozlik holatlari |
| 9. Testing | 029–032 | Unit, real DB integration, mobil E2E |
| 10. Documentation | 033–035 | README, takliflar, faktlarga asoslangan AI hisoboti |
| 12. Konteynerlashtirish (tartib F bo‘limda) | 039–046 | Multi-stage image, ikki servis, xavfsiz startup, Docker/Podman va npm dev tekshiruvi |
| 11. Final Verification | 036–038 | Toza muhit tekshiruvi, GitHub va topshirish |

Validatsiya backend bosqichidan boshlanadi; 8-bosqich uning frontend bilan yakuniy uyg‘unligini tekshiradi. Testlar uchun kutilgan misollar implementatsiya bilan birga tayyorlanadi, umumiy test to‘plami 9-bosqichda yakunlanadi.

## D. Atomar vazifalar

Har bir band faqat o‘z bajarish mezonlari va tekshiruvi muvaffaqiyatli tugagach belgilanadi. Quyidagi fayllar kelajakdagi yaratiladigan/o‘zgartiriladigan fayllardir.

### 1. Project Setup

- [ ] TASK-001 — Next.js asosini tayyorlash
  - Tavsif: App Router, TypeScript strict, Tailwind va npm bilan bitta loyiha yaratish; mos versiyalar va lint/typecheck skriptlarini belgilash.
  - Bog‘liq: rejaning foydalanuvchi tomonidan tasdiqlanishi.
  - Fayllar: `package.json`, `package-lock.json`, `tsconfig.json`, Next.js/lint/Tailwind konfiguratsiyalari, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.gitignore`.
  - Mezon: boshlang‘ich sahifa ochiladi, lockfile mavjud, `.env` va build fayllari ignore qilinadi, `TASK.md` saqlanadi.
  - Tekshirish: dev sahifani ochish; lint va typecheck.

- [ ] TASK-002 — Haqiqiy ish va AI foydalanish jurnalini boshlash
  - Tavsif: vaqt, ishlatilgan vosita/prompt, natija, aniqlangan xato/tuzatish va inson/AI hissasi uchun jurnal ochish; keyingi ish davomida to‘ldirish.
  - Bog‘liq: TASK-001.
  - Fayllar: `docs/work-log.md`.
  - Mezon: dastlabki haqiqiy yozuv mavjud; vaqtni hisoblash qoidasi belgilangan, oldindan xato yoki mustaqil yozilgan kod haqida da’vo yo‘q.
  - Tekshirish: jurnalni amaldagi ish bilan solishtirish; keyingi har bosqich yakunida yangilash.

- [ ] TASK-003 — Environment shartnomasi
  - Tavsif: app va test DB sozlamalarini ajratish, serverda kerakli sozlamalarni tekshirish.
  - Bog‘liq: TASK-001.
  - Fayllar: `.env.example`, `src/lib/env.ts`, `.gitignore`.
  - Mezon: namuna maxfiy emas, noto‘g‘ri/yo‘q URL tushunarli xato beradi, URL brauzerga chiqmaydi.
  - Tekshirish: mavjud va yo‘q sozlama holatlarini tekshirish.

### 2. Database Design

- [ ] TASK-004 — Prisma modellarini belgilash
  - Tavsif: B bo‘limdagi Student va Payment maydonlari, date/decimal turlari, FK va indekslarni ifodalash.
  - Bog‘liq: TASK-003.
  - Fayllar: `prisma/schema.prisma`, zarur bo‘lsa `prisma.config.ts`, `package.json`, `package-lock.json`.
  - Mezon: 1:N bog‘lanish, Cascade, Decimal(14,2), date va indekslar sxemaga mos.
  - Tekshirish: Prisma format va validate buyruqlari.

- [ ] TASK-005 — Dastlabki migratsiya
  - Tavsif: sxemani migratsiyaga aylantirish, musbat summalar CHECK’larini qo‘shish.
  - Bog‘liq: TASK-004.
  - Fayllar: `prisma/migrations/`.
  - Mezon: bo‘sh PostgreSQL’da migratsiya o‘tadi; FK va CHECK ishlaydi; qayta deploy yangi o‘zgarish talab qilmaydi.
  - Tekshirish: alohida lokal DB’da deploy, noto‘g‘ri summa/FK yozuvini rad etish va indekslarni tekshirish.

### 3. Prisma Integration

- [ ] TASK-006 — Server Prisma client
  - Tavsif: development hot reload’da ulanishlar ko‘paymasligi uchun yagona client yaratish, server-only chegarani belgilash.
  - Bog‘liq: TASK-005.
  - Fayllar: `src/lib/prisma.ts`, kerak bo‘lsa `package.json`, `package-lock.json`.
  - Mezon: server DB’ni o‘qiydi, client bundle Prisma’ni import qilmaydi.
  - Tekshirish: ulanish smoke tekshiruvi va typecheck.

- [ ] TASK-007 — Demo seed
  - Tavsif: Ali, Vali, Sardor misolini bitta hujjatlashtirilgan oyga yaratish; qayta seed dublikat qo‘shmasin.
  - Bog‘liq: TASK-006.
  - Fayllar: `prisma/seed.ts`, `package.json`, kerak bo‘lsa `prisma.config.ts`.
  - Mezon: 500000/300000, 600000/600000, 450000/0 holatlari bor; faqat sintetik ma’lumot; mavjud begona yozuvlar o‘chirilmaydi.
  - Tekshirish: seed’ni ikki marta bajarish va natijalarni solishtirish.

### 4. Backend API

- [ ] TASK-008 — Umumiy API javoblari va xatolari
  - Tavsif: JSON envelope, Decimal/date serializatsiyasi va xavfsiz xato xaritalashni tayyorlash.
  - Bog‘liq: TASK-006.
  - Fayllar: `src/lib/api-response.ts`, `src/lib/errors.ts`.
  - Mezon: 400/404/409/500/503 javoblari bir xil formatda; maxfiy ma’lumot oshkor qilinmaydi; 204 tanasiz.
  - Tekshirish: javob namunalarini va serializatsiyani tekshirish.

- [ ] TASK-009 — Kirish validatsiyasi sxemalari
  - Tavsif: student, PATCH, payment, UUID va month/sana validatsiyasini umumiy modulda belgilash.
  - Bog‘liq: TASK-008.
  - Fayllar: `src/lib/validation.ts`, `package.json`, `package-lock.json`.
  - Mezon: B bo‘limdagi format/chegaralar, noma’lum maydonlar va bo‘sh PATCH qoidalari bajariladi; maydon xatolari ajratiladi.
  - Tekshirish: to‘g‘ri/noto‘g‘ri payload namunalarini sxema orqali o‘tkazish.

- [ ] TASK-010 — O‘quvchi yaratish va ro‘yxat
  - Tavsif: POST va GET `/api/students`ni service bilan yozish.
  - Bog‘liq: TASK-009.
  - Fayllar: `src/services/students.ts`, `src/app/api/students/route.ts`.
  - Mezon: to‘rtta biznes maydoni saqlanadi; 201/200 va deterministik ro‘yxat; bo‘sh bazada `[]`.
  - Tekshirish: HTTP orqali yaratish, qayta o‘qish va invalid body yuborish.

- [ ] TASK-011 — O‘quvchini olish va tahrirlash
  - Tavsif: GET/PATCH `/api/students/:id`; berilmagan maydonlar saqlanadi.
  - Bog‘liq: TASK-010.
  - Fayllar: `src/services/students.ts`, `src/app/api/students/[id]/route.ts`.
  - Mezon: bitta maydonni o‘zgartirish boshqalarini buzmaydi; yo‘q id 404; noto‘g‘ri id 400.
  - Tekshirish: yaratish → qisman PATCH → GET; bo‘sh PATCH va yo‘q id.

- [ ] TASK-012 — O‘quvchini o‘chirish
  - Tavsif: DELETE va bog‘liq to‘lovlarning atomar kaskad o‘chirilishini amalga oshirish.
  - Bog‘liq: TASK-011.
  - Fayllar: `src/services/students.ts`, `src/app/api/students/[id]/route.ts`.
  - Mezon: mavjud id 204, takroriy DELETE 404; yetim to‘lov qolmaydi.
  - Tekshirish: bog‘liq to‘lovli DB fixture’ni o‘chirish va ikki jadvalni tekshirish.

- [ ] TASK-013 — To‘lov qo‘shish
  - Tavsif: POST `/api/payments`; mavjud o‘quvchiga valid summa va sana yozish.
  - Bog‘liq: TASK-010, TASK-009.
  - Fayllar: `src/services/payments.ts`, `src/app/api/payments/route.ts`.
  - Mezon: 201, aniq Decimal va sana; yo‘q o‘quvchi 404; FK race boshqariladi; mutatsiya GET’da bajarilmaydi.
  - Tekshirish: HTTP orqali valid, invalid va yo‘q o‘quvchili to‘lovlar.

- [ ] TASK-014 — O‘quvchining barcha to‘lovlari
  - Tavsif: GET `/api/students/:id/payments`, sana bo‘yicha barqaror tartib.
  - Bog‘liq: TASK-013.
  - Fayllar: `src/services/payments.ts`, `src/app/api/students/[id]/payments/route.ts`.
  - Mezon: faqat tanlangan o‘quvchining barcha oylardagi to‘lovlari; bo‘sh tarix va yo‘q o‘quvchi ajratiladi.
  - Tekshirish: ikki o‘quvchi va ikki oy fixture’i bilan ro‘yxatni tekshirish.

### 5. Business Logic

- [ ] TASK-015 — Pul hisoblash yordamchilari
  - Tavsif: Decimal summalash/ayirish va ikki xonali API satriga aylantirishni markazlashtirish.
  - Bog‘liq: TASK-009.
  - Fayllar: `src/lib/money.ts`.
  - Mezon: 0.10 + 0.20 = 0.30; manfiy qarz qarzdor sifatida olinmaydi; yig‘indi ustun maksimumidan oshsa ham hisoblash buzilmaydi.
  - Tekshirish: kasr, maksimum va ko‘p to‘lov yig‘indisi misollari.

- [ ] TASK-016 — Sana va oy chegaralari
  - Tavsif: qat’iy kalendar parsing, oy diapazoni va Toshkent bo‘yicha joriy oy/kun standartlarini tayyorlash.
  - Bog‘liq: TASK-009.
  - Fayllar: `src/lib/dates.ts`, `src/lib/validation.ts`.
  - Mezon: kabisa, dekabr–yanvar, 9999-12 va timezone chegaralari to‘g‘ri; 2026-02-30 rad etiladi.
  - Tekshirish: chegara sanalar, belgilangan clock va turli process timezone’lari bilan natijani solishtirish.

- [ ] TASK-017 — Qarzdorlik service’i
  - Tavsif: o‘quvchilar va oylik agregatsiyani izchil snapshot’da olish, Decimal bilan qarzni hisoblash.
  - Bog‘liq: TASK-014, TASK-015, TASK-016.
  - Fayllar: `src/services/debtors.ts`.
  - Mezon: nol to‘lovli o‘quvchi ham chiqadi; to‘liq/ortiqcha to‘lovli chiqmaydi; N+1 yo‘q; boshqa oy to‘lovi aralashmaydi.
  - Tekshirish: TASK.md misoli, bir nechta qisman to‘lov va qo‘shni oylar bilan solishtirish.

- [ ] TASK-018 — Talabdagi qarzdorlar endpointi
  - Tavsif: GET `/debtors?month=YYYY-MM`ni service’ga ulash; month majburiy.
  - Bog‘liq: TASK-017, TASK-008.
  - Fayllar: `src/app/debtors/route.ts`.
  - Mezon: aniq URL 200 beradi, yo‘q/noto‘g‘ri month 400; natijada har bir qolgan qarz bor; eski cache ishlatilmaydi.
  - Tekshirish: HTTP so‘rovi, to‘lov qo‘shilgandan keyin ayni oyga takroriy so‘rov.

### 6. Frontend UI

- [ ] TASK-019 — Mobil layout va umumiy holatlar
  - Tavsif: navigatsiya, asosiy konteyner, yuklanish/bo‘sh/xato komponentlarini yaratish.
  - Bog‘liq: TASK-001.
  - Fayllar: `src/app/layout.tsx`, `src/app/globals.css`, `src/components/app-shell.tsx`, `src/components/ui-state.tsx`.
  - Mezon: 360 px va desktop’da navigatsiya ishlaydi, sahifa sig‘adi, klaviatura fokusi ko‘rinadi.
  - Tekshirish: responsive preview va klaviatura orqali yurish.

- [ ] TASK-020 — O‘quvchilar ro‘yxati va yaratish formasi
  - Tavsif: to‘rtta maydonli forma, o‘quvchi ro‘yxati va tafsilot havolalarini qurish.
  - Bog‘liq: TASK-019, TASK-009.
  - Fayllar: `src/app/students/page.tsx`, `src/components/student-form.tsx`, `src/components/student-list.tsx`.
  - Mezon: barcha maydonlar label bilan, bo‘sh ro‘yxat tushunarli; UI API ulanishiga tayyor.
  - Tekshirish: demo props bilan mobil forma va ro‘yxatni ko‘rish.

- [ ] TASK-021 — Tafsilot, tahrirlash va o‘chirish UI’si
  - Tavsif: o‘quvchi sahifasi, qayta ishlatiladigan forma, tarix o‘chishi haqidagi tasdiq oynasini yaratish.
  - Bog‘liq: TASK-020.
  - Fayllar: `src/app/students/[id]/page.tsx`, `src/components/student-form.tsx`, `src/components/delete-student-dialog.tsx`.
  - Mezon: bekor qilish ma’lumot o‘chirmaydi; tarif o‘zgarishining eski oylarga ta’siri ko‘rinadi; id sahifaga uzatiladi.
  - Tekshirish: modal fokus/bekor qilish va formani tekshirish.

- [ ] TASK-022 — To‘lov kiritish formasi
  - Tavsif: o‘quvchi tanlash, summa, sana va yuborish holatini qurish.
  - Bog‘liq: TASK-019, TASK-009, TASK-016.
  - Fayllar: `src/app/payments/new/page.tsx`, `src/components/payment-form.tsx`.
  - Mezon: oldindan tanlangan o‘quvchi qo‘llanadi; standart sana Toshkent bo‘yicha; o‘quvchi yo‘qligida yaratishga yo‘l ko‘rsatiladi.
  - Tekshirish: mobil klaviatura, sana va bo‘sh o‘quvchilar holati.

- [ ] TASK-023 — To‘lov tarixi komponenti
  - Tavsif: sana va summalarni aniq ko‘rsatuvchi tarix ro‘yxati.
  - Bog‘liq: TASK-021.
  - Fayllar: `src/components/payment-list.tsx`, `src/app/students/[id]/page.tsx`.
  - Mezon: bo‘sh va uzun tarix sig‘adi, sanalar siljimaydi, kasrli pul formatlanadi.
  - Tekshirish: turli oy/summa misollarini mobil preview’da ko‘rish.

- [ ] TASK-024 — Qarzdorlar ekrani
  - Tavsif: oy tanlash va ism/guruh/tarif/to‘langan/qarz ro‘yxatini yaratish.
  - Bog‘liq: TASK-019, TASK-016.
  - Fayllar: `src/app/page.tsx`, `src/components/month-picker.tsx`, `src/components/debtors-list.tsx`.
  - Mezon: joriy oy standart, qarz aniq ko‘rinadi, qarzdor yo‘q holati va to‘lov havolasi mavjud.
  - Tekshirish: TASK.md misolini kichik va katta ekranlarda ko‘rish.

### 7. API Integration

- [ ] TASK-025 — Umumiy fetch client va o‘quvchi oqimi
  - Tavsif: typed DTO, xato parsing, talab paytida qayta olish orqali o‘quvchi ekranlarini haqiqiy API’ga ulash.
  - Bog‘liq: TASK-012, TASK-020, TASK-021.
  - Fayllar: `src/lib/api-client.ts`, o‘quvchi sahifalari va komponentlari.
  - Mezon: UI orqali yaratish/tahrirlash/o‘chirishdan keyin yangi holat ko‘rinadi; 204 parsing xatosi yo‘q.
  - Tekshirish: browser’dan CRUD oqimini bajarib DB natijasini tekshirish.

- [ ] TASK-026 — To‘lov, tarix va qarzdorlarni ulash
  - Tavsif: qolgan ekranlarga API integratsiyasi; muvaffaqiyatli to‘lovdan keyin tarix/qarzdorlikni yangilash.
  - Bog‘liq: TASK-014, TASK-018, TASK-022, TASK-023, TASK-024, TASK-025.
  - Fayllar: `src/lib/api-client.ts`, to‘lov va qarzdorlar sahifalari/komponentlari.
  - Mezon: eski oy javobi yangi oy natijasini bosmaydi; yuborish davomida takroriy click bloklanadi; POST avtomatik retry qilinmaydi.
  - Tekshirish: to‘lov → tarix → kamaygan qarz; tez oy almashtirish va sekin tarmoq holati.

### 8. Validation & Error Handling

- [ ] TASK-027 — Formadagi maydon xatolari
  - Tavsif: server validatsiyasini inputlar bilan bog‘lash, noto‘g‘ri ma’lumotni foydalanuvchi yo‘qotmasligini ta’minlash.
  - Bog‘liq: TASK-026, TASK-009.
  - Fayllar: `src/components/student-form.tsx`, `src/components/payment-form.tsx`, `src/components/month-picker.tsx`.
  - Mezon: field error tegishli label bilan, xatodan keyin qiymatlar saqlanadi, tuzatib qayta yuborish mumkin.
  - Tekshirish: bo‘sh maydon, manfiy summa, 3 kasr xonasi va server 400 holati.

- [ ] TASK-028 — Tizim va tarmoq xatolari
  - Tavsif: 404, tarmoq uzilishi, DB nosozligi, kutilmagan xatolar uchun tushunarli UI va server javoblari.
  - Bog‘liq: TASK-027, TASK-008.
  - Fayllar: `src/app/error.tsx`, `src/app/not-found.tsx`, `src/components/ui-state.tsx`, `src/lib/errors.ts`, `src/lib/api-client.ts`.
  - Mezon: UI qotib qolmaydi, GET uchun retry bor, xatolarda maxfiy ma’lumot yo‘q; noma’lum natijali POST’da tarixni tekshirish taklif etiladi.
  - Tekshirish: offline browser, yo‘q id va vaqtincha DB uzilishi.

### 9. Testing

- [ ] TASK-029 — Unit test to‘plami
  - Tavsif: pul, kalendar, validatsiya va qarz chegaralariga takrorlanuvchi testlar yozish.
  - Bog‘liq: TASK-015, TASK-016, TASK-017.
  - Fayllar: `tests/unit/`, `vitest.config.ts`, `package.json`, `package-lock.json`.
  - Mezon: E bo‘limidagi unit holatlar qamrab olingan, vaqtga bog‘liq testlarda clock boshqariladi.
  - Tekshirish: `npm run test:unit`.

- [ ] TASK-030 — Haqiqiy PostgreSQL bilan API/DB testlari
  - Tavsif: izolyatsiyalangan test DB, fixture va tozalash bilan HTTP integratsiya to‘plamini yaratish.
  - Bog‘liq: TASK-005, TASK-012, TASK-014, TASK-018, TASK-028, TASK-029.
  - Fayllar: `tests/integration/`, `tests/helpers/`, `vitest.config.ts`, `package.json`.
  - Mezon: E bo‘limidagi API/DB holatlar o‘tadi; test DB app DB’dan boshqa ekani va maxsus test nomi tekshirilmasdan cleanup ishlamaydi; SQLite bilan almashtirilmaydi.
  - Tekshirish: alohida DB’da `npm run test:integration`; xavfli URL berilganda suite yozishdan oldin to‘xtaydi.

- [ ] TASK-031 — Mobil va desktop E2E
  - Tavsif: haqiqiy UI orqali CRUD, to‘lov, tarix va qarzdorlar oqimini tekshirish.
  - Bog‘liq: TASK-028, TASK-030.
  - Fayllar: `tests/e2e/`, `playwright.config.ts`, `package.json`, `package-lock.json`.
  - Mezon: 360×800 va 1280×800’da asosiy oqimlar o‘tadi; gorizontal overflow yo‘q; label/fokus, bo‘sh/xato holatlari tekshirilgan.
  - Tekshirish: `npm run test:e2e` va telefon o‘lchamida qo‘lda smoke tekshiruvi.

- [ ] TASK-032 — Regressiya va build tekshiruvi
  - Tavsif: topilgan xatolarni tuzatish, mos regressiya testi qo‘shish va yakuniy texnik gate’dan o‘tish.
  - Bog‘liq: TASK-029, TASK-030, TASK-031.
  - Fayllar: faqat aniqlangan muammoga tegishli manba/test fayllari, `docs/work-log.md`.
  - Mezon: lint, typecheck, uch test to‘plami va build o‘tadi; hal qilinmagan cheklovlar yashirilmaydi.
  - Tekshirish: belgilangan npm skriptlari va build natijalarini jurnalga yozish.

### 10. Documentation

- [ ] TASK-033 — Ishga tushirish va API README’si
  - Tavsif: B bo‘limdagi lokal ketma-ketlik, PostgreSQL DB/user yaratish buyruqlari, env, migratsiya, seed, test, build/start va API namunalarini yozish.
  - Bog‘liq: TASK-032.
  - Fayllar: `README.md`, `.env.example`.
  - Mezon: noldan clone qilgan dasturchiga barcha buyruqlar bor; aniq `/debtors` URL, pul/sana formati, barcha taxminlar va delete oqibati tushuntirilgan.
  - Tekshirish: buyruqlarni mavjud skriptlar va endpointlar bilan solishtirish.

- [ ] TASK-034 — Kelajakdagi 3–5 taklif
  - Tavsif: yana bir hafta berilsa bajariladigan yaxshilanishlarni sabab va foydasi bilan yozish.
  - Bog‘liq: TASK-033.
  - Fayllar: `README.md`.
  - Mezon: 3–5 aniq taklif; masalan kirish nazorati, tarif/qabul tarixi, arxivlash, xizmat oyi bo‘yicha taqsimlash; bajarilgan deb ko‘rsatilmaydi.
  - Tekshirish: takliflar soni va amaldagi funksiyalardan ajratilganini ko‘rish.

- [ ] TASK-035 — Faktlarga asoslangan AI hisoboti
  - Tavsif: ish jurnalidan foydalangan holda 5–8 gap yozish; vositalar, samarali promptlar, xatolar, topish/tuzatish usuli va inson/AI hissasini ko‘rsatish.
  - Bog‘liq: TASK-002, TASK-032, TASK-034.
  - Fayllar: `docs/ai-report.md`, `docs/work-log.md`.
  - Mezon: TASK.md’dagi 6 savolning har biri qoplangan; xato yoki mustaqil kod bo‘lmasa shu holat ochiq aytilgan; taxminiy voqealar yo‘q.
  - Tekshirish: gaplarni sanash, har da’voni jurnal/diff bilan solishtirish; final fix bo‘lsa yangilash.

### 11. Final Verification

- [ ] TASK-036 — Toza muhitda qabul tekshiruvi
  - Tavsif: alohida checkout va bo‘sh DB’da faqat README asosida ishga tushirish; TASK.md 1–3-qismlarini kod/UI/hujjat bilan solishtirish.
  - Bog‘liq: TASK-033, TASK-034, TASK-035, TASK-046.
  - Fayllar: `README.md` (zarur tuzatishlar), `docs/submission.md`, `docs/work-log.md`.
  - Mezon: Docker Compose va Docker’siz npm dev yo‘riqnomalari, migratsiya, saqlanish, test, build/start va mobil asosiy oqim ishlaydi; Podman tekshiruvi yoki aniq muhit cheklovi qayd etilgan; bajarilmagan talab bo‘lsa ochiq ro‘yxatga olingan va imkon qadar tuzatilgan.
  - Tekshirish: toza muhit natijalari, A bo‘lim talablar jadvali va TASK.md misolini qo‘lda tasdiqlash.

- [ ] TASK-037 — GitHub repository’ni tayyorlash
  - Tavsif: topshiriladigan diffni ko‘rish, secret/build/node_modules yo‘qligini tekshirish, commit/push va reviewer kirishini ta’minlash.
  - Bog‘liq: TASK-036.
  - Fayllar: `.gitignore` (zarur bo‘lsa), `docs/submission.md`, Git tarixi/remote.
  - Mezon: GitHub havolasi haqiqiy, ochiq yoki tekshiruvchiga kirish berilgan; lockfile/migratsiya/README mavjud; `TASK.md` o‘zgarmagan.
  - Tekshirish: remote’dan qayta clone, repository ko‘rinishi va topshiriladigan commitni tekshirish. Hisob/repository ma’lumoti bo‘lmasa tashqi qadam bloklangan deb qayd etiladi, muvaffaqiyat o‘ylab topilmaydi.

- [ ] TASK-038 — Yakuniy topshirish paketi va yuborish
  - Tavsif: GitHub havolasi, yakuniy 5–8 gaplik AI hisoboti va jami sarflangan soatni bitta Telegram xabariga tayyorlash; `@code_debugger007`ga topshirish.
  - Bog‘liq: TASK-037, TASK-035.
  - Fayllar: `docs/submission.md`, `docs/ai-report.md`, `docs/work-log.md`, `PLAN.md`.
  - Mezon: uch majburiy ma’lumot va mavjud cheklovlar kiritilgan; vaqt haqiqiy jurnal asosida; yuborilganlik tasdiqlangan.
  - Tekshirish: xabarni manba bilan solishtirish va yuborish natijasini qayd etish. Agent xabar yuborishi uchun alohida aniq ko‘rsatma kerak; aks holda tayyor matn foydalanuvchiga beriladi, foydalanuvchi yuborganini tasdiqlamaguncha bu band ochiq qoladi.

### 12. Konteynerlashtirish

Mavjud TASK-001–038 saqlanadi. Yangi ID’lar bajarilish vaqti emas; haqiqiy tartib F bo‘limda.

- [ ] TASK-039 — Konteyner va lokal environment shartnomasi
  - Tavsif: B bo‘limdagi ikki URL rejimi, PostgreSQL env qiymatlari va maxfiy fayllar qoidalarini joriy qilish.
  - Bog‘liq: TASK-003.
  - Fayllar: `.env.example`, `.gitignore`, `src/lib/env.ts`.
  - Mezon: Compose uchun `db`, npm dev uchun `localhost`; namunalarda secret yo‘q; haqiqiy env/dump Git’dan chiqarilgan; browser env’da URL yo‘q.
  - Tekshirish: namuna va ignore qoidalarini ko‘rish, yo‘q env xatosini tekshirish; haqiqiy qiymatlarni chiqarmaslik.

- [ ] TASK-040 — Multi-stage Dockerfile va build context
  - Tavsif: dependencies/builder/runner bosqichlarini, runtime Prisma CLI/client va non-root app’ni tayyorlash.
  - Bog‘liq: TASK-006, TASK-039.
  - Fayllar: `Dockerfile`, `.dockerignore`, `package.json`, `package-lock.json`, zarur bo‘lsa Next.js konfiguratsiyasi.
  - Mezon: DB’siz build o‘tadi; migration/schema/config va CLI runner’da bor; startup paket yuklamaydi; Node.js va Prisma versiyalari mos; secret build qatlamida yo‘q.
  - Tekshirish: image build, runtime fayl/CLI va user tekshiruvi, build context va image metadata’ni maxfiy ma’lumotni oshkor qilmasdan ko‘rish.

- [ ] TASK-041 — App ichidagi avtomatik migratsiya startup’i
  - Tavsif: chegaralangan DB kutish, deploy migratsiya va muvaffaqiyatdan keyin serverni exec qilish oqimini yaratish.
  - Bog‘liq: TASK-005, TASK-040.
  - Fayllar: `docker/entrypoint.sh`, `docker/wait-for-db.mjs`, `Dockerfile`, zarur bo‘lsa `package.json`.
  - Mezon: DB kutiladi; migratsiya tugamaguncha server ochilmaydi; xatoda nonzero exit; avtomatik seed/reset/cheksiz retry yo‘q; signal Next.js jarayoniga yetadi.
  - Tekshirish: izolyatsiyalangan test DB’da yangi/takroriy migratsiya, kechikkan DB va ataylab xato migratsiya; yakuniy Compose sinovi TASK-043’da.

- [ ] TASK-042 — Ikki servisli Compose
  - Tavsif: app/db, xususiy tarmoq, named volume, DB healthcheck va startup bog‘liqligini yozish.
  - Bog‘liq: TASK-039, TASK-041.
  - Fayllar: `compose.yaml`.
  - Mezon: faqat app va db; bittadan instance; app faqat host loopback 3000’da; DB host portisiz; `db` DNS bilan ulanish; volume yo‘li tanlangan PostgreSQL image’iga mos.
  - Tekshirish: Compose config validatsiyasi (secret chiqarmasdan), servislar/port/network/volume va healthcheck konfiguratsiyasini tekshirish.

- [ ] TASK-043 — Docker ishga tushirish, migratsiya va persistence tekshiruvi
  - Tavsif: tayyor ilovani Docker Compose’da yangi volume bilan ishga tushirish, yozuv yaratish va qayta ishga tushirishlarda saqlanishini tekshirish.
  - Bog‘liq: TASK-032, TASK-042.
  - Fayllar: `docs/work-log.md`, aniqlangan xatoga tegishli container fayllari.
  - Mezon: localhost:3000’da UI/API ishlaydi; ikkita servis running; schema avtomatik hosil bo‘ladi; restart, down/up va app rebuild’dan keyin o‘quvchi/to‘lov/qarz o‘zgarmaydi; DB host portiga publish qilinmagan; migratsiya xatosida server yopiq.
  - Tekshirish: alohida test project nomi va disposable volume’da create → restart → down (volumesiz) → up → rebuild → read oqimi; sekin DB va noto‘g‘ri migratsiya holati; migratsiya holati/loglarini tekshirish.

- [ ] TASK-044 — Podman Compose mosligi
  - Tavsif: ayni YAML va Dockerfile’ni Podman’da, imkon bo‘lsa rootless rejimda tekshirish; engine/provayder/OS’ni qayd etish.
  - Bog‘liq: TASK-043.
  - Fayllar: `docs/work-log.md`, zarur bo‘lsa `compose.yaml`, `Dockerfile`, startup skriptlari.
  - Mezon: alohida uchinchi servis yoki Podman YAML fork’i yo‘q; build/up, healthcheck, DNS, migratsiya, localhost va volume persistence sinalgan; signal/permission xatolari yo‘q.
  - Tekshirish: Docker app’ni to‘xtatib Podman’da TASK-043 smoke oqimini takrorlash. Muhit mavjud bo‘lmasa tekshirilmagan imkoniyat va sababni yozish, moslikni tasdiqlangan deb belgilamaslik; bu vazifa ochiq qoladi. Umumiy fayl o‘zgarsa Docker tekshiruvi takrorlanadi.

- [ ] TASK-045 — Docker’siz npm dev oqimini saqlash
  - Tavsif: host PostgreSQL va lokal env bilan development/test oqimini konteynerlardan mustaqil tekshirish.
  - Bog‘liq: TASK-032, TASK-039.
  - Fayllar: `docs/work-log.md`, zarur bo‘lsa `package.json`, `src/lib/env.ts`.
  - Mezon: container engine o‘chiq holatda npm dev va CRUD/to‘lov/qarz ishlaydi; source o‘zgarishi hot reload’da ko‘rinadi; build yoki Docker buyrug‘i talab qilinmaydi; test DB ajratilgan.
  - Tekshirish: konteyner app’ni to‘xtatish, lokal migratsiya va `npm run dev`, vaqtinchalik UI o‘zgarishini tekshirib qaytarish; lokal test skriptlari.

- [ ] TASK-046 — Docker, Podman va npm yo‘riqnomalarini yakunlash
  - Tavsif: mavjud README’ga uch ish rejimi, env, avtomatik migratsiya, log/stop/restart/rebuild va volume qoidalarini qo‘shish.
  - Bog‘liq: TASK-033, TASK-043, TASK-044, TASK-045.
  - Fayllar: `README.md`, `.env.example`, `docs/work-log.md`.
  - Mezon: har yo‘l uchun noldan bajariladigan buyruqlar; Podman provider talabi; DB porti yopiq ekani; `.env` Git’da yo‘qligi; `down -v` oqibati; migratsiya xatosini ma’lumotni o‘chirmasdan tekshirish; port to‘qnashuvi va alohida engine volume’lari tushuntirilgan.
  - Tekshirish: buyruqlarni bajarilgan tekshiruvlar bilan solishtirish; TASK-036’da toza checkout’dan qayta tekshirish. Podman muhit cheklovi qolsa bu band va yakuniy to‘liq bajarilish da’vosi ochiq qoladi; tayyor Docker/npm yo‘riqnomasi baribir yoziladi.

## E. Test strategiyasi

Testlar asosiy xavflarga yo‘naltiriladi; trivial komponentlarning implementatsiyasini takrorlovchi testlar shart emas. PostgreSQL xususiyatlari real PostgreSQL’da tekshiriladi. Test fixture’lari ilova seed’iga va joriy real sanaga bog‘liq bo‘lmaydi.

| Holat | Daraja | Kutilgan natija |
|---|---|---|
| O‘quvchi yaratish va ro‘yxat | API + E2E | 201, barcha maydonlar GET/UI’da bir xil |
| Qisman tahrirlash | API + E2E | Faqat berilgan maydonlar o‘zgaradi |
| Tarifni o‘zgartirish | API | Oldingi oy qarzi ham yangi tarifga mos hisoblanadi |
| To‘lovsiz/to‘lovli o‘quvchini o‘chirish | DB + API + E2E | 204, FK yetim yozuv qoldirmaydi; UI cancel hech narsa o‘chirmaydi |
| Yangi to‘lov | API + E2E | Summa va sana aniq saqlanadi; tarix va qarz yangilanadi |
| Bitta o‘quvchi tarixi | API | Boshqa o‘quvchi to‘lovi aralashmaydi; barcha oylar olinadi |
| TASK.md misoli | Unit + API | Ali 200000.00, Sardor 450000.00; Vali ro‘yxatda yo‘q |
| Qisman to‘lovlar | Unit + API | 500000 − (100000 + 200000) = 200000 |
| To‘liq va ortiqcha to‘lov | Unit + API | Qarzdor emas; keyingi oyga kredit o‘tmaydi |
| To‘lov yo‘q | API | Tarifning to‘liq miqdori qarz |
| Kasr va katta summa | Unit + DB/API | 0.10 + 0.20 aniq; 3 kasr xonasi, nol/manfiy va overflow rad etiladi |
| Turli oylar | Unit + API | Birinchi kun kiritiladi, keyingi oyning birinchi kuni kiritilmaydi |
| Kalendar chegaralari | Unit + API | 2024-02-29 valid, 2026-02-29 invalid; dekabr/yanvar va 9999-12 to‘g‘ri |
| Vaqt zonalari | Unit + E2E | To‘lov kalendar kuni o‘zgarmaydi; joriy oy Toshkent bo‘yicha |
| Bo‘sh DB | API + E2E | Ro‘yxatlar `[]`; UI tushunarli; to‘lov uchun o‘quvchi yaratishga havola |
| Noto‘g‘ri JSON/UUID/oy/maydon | API | 400; yozuv yaratilmaydi/o‘zgarmaydi |
| Yo‘q o‘quvchi va bo‘sh tarix | API | Mos ravishda 404 va 200 `[]` |
| FK va CHECK | DB | Yetim Payment, nol/manfiy summalar rad etiladi |
| O‘chirish va to‘lov parallel kelishi | API/DB | Yetim yozuv yo‘q, xato boshqariladi, qisman operatsiya yo‘q |
| Tez oy almashtirish | E2E | Ekrandagi oyga tegishli natija qoladi |
| Ikki marta click | E2E | Pending davrda bitta POST; avtomatik qayta yuborish yo‘q |
| DB/tarmoq xatosi | API + E2E | Xavfsiz xabar, qayta urinish, maxfiy ma’lumot yo‘q |
| Telefon ekrani va klaviatura | E2E + qo‘lda | 360 px’da oqimlar bajariladi; fokus/label ishlaydi; overflow yo‘q |
| Docker cold start | Container qabul | Ikki servis, DB healthy, avtomatik migratsiya, localhost:3000 |
| Migratsiya qayta start/xatosi | Container + DB | Qayta start dublikat qilmaydi; xatoda app ochilmaydi; reset yo‘q |
| Named volume | Container qabul | Restart, down/up, app rebuild’dan keyin yozuvlar saqlanadi |
| Tarmoq va env | Konfiguratsiya + qabul | DB hostga publish qilinmagan; app loopback’da; secret image/Git’da yo‘q |
| Podman ayni YAML | Moslik | Engine/provayder qayd etilgan, Docker’dagi asosiy oqimlar o‘tadi |
| Docker’siz development | Lokal qabul | Engine o‘chiq, host DB, npm dev hot reload va asosiy API ishlaydi |
| Toza o‘rnatish va build | Qabul | README buyruqlari bilan mustaqil ishga tushadi |

Integratsiya/E2E testlari alohida DB’da ketma-ket yoki izolyatsiyalangan fixture’lar bilan bajariladi. Cleanup faqat tekshirilgan test bazasida. Tashqi GitHub/Telegram amallari avtomatik testlardan bajarilmaydi.

## F. Bajarilish tartibi

ID’lar saqlangan, lekin endi faqat raqam bo‘yicha bajarish to‘g‘ri emas. Texnik bog‘liqliklarga mos asosiy tartib:

**TASK-001–003 → TASK-039 → TASK-004–018 → TASK-040–042 → TASK-019–032 → TASK-043 → TASK-044 → TASK-045 → TASK-033 → TASK-046 → TASK-034–038.**

TASK-044 muhit sabab bloklansa, undan mustaqil TASK-045 va TASK-033 davom ettiriladi; TASK-046 hujjat loyihasi tayyorlanadi, biroq uning barcha mezonlari bajarilmaguncha belgilanmaydi. Mavjud 38 vazifa olib tashlanmagan yoki qayta raqamlanmagan; TASK-036 yangi konteyner hujjatlari/tekshiruvlariga bog‘langan. Parallel agentlar talab qilinmaydi.

Keyingi AI agent uchun tartib:

1. Foydalanuvchining amalga oshirishga tasdig‘i mavjudligini tekshirish; TASK.md va ushbu rejani o‘qish.
2. Yuqoridagi bajarilish tartibidan navbatdagi ochiq vazifani tanlash, uning barcha bog‘liqliklari bajarilganini tekshirish.
3. Faqat shu vazifa natijasini yaratish; tegishli tekshiruvni bajarish.
4. Muvaffaqiyat bo‘lsa checkbox’ni belgilash, ish jurnaliga haqiqiy natija/vaqtni yozish, G bo‘limni yangilash.
5. Tekshiruv o‘tmasa vazifani ochiq qoldirish, sabab va keyingi qadamni yozish; soxta muvaffaqiyat qayd etmaslik.
6. Talab/taxmin o‘zgarsa tegishli arxitektura, test va bog‘liqliklarni birga yangilash; TASK.md’ni o‘zgartirmaslik.
7. Yakuniy paket tayyor bo‘lgach tashqi topshirish uchun zarur hisob/kirish va yuborish ko‘rsatmasini aniqlash; ularni mavjud deb taxmin qilmaslik.

## G. Progress Tracking

| Ko‘rsatkich | Hozirgi qiymat |
|---|---|
| Jami vazifalar | 46 |
| Bajarilgan | 0 |
| Qolgan | 46 |
| Bajarilish foizi | 0% |
| Hozirgi bosqich | Reja tayyor; foydalanuvchi tasdig‘i kutilmoqda |
| Keyingi vazifa | Tasdiqdan keyin TASK-001 |

Hisoblash: `bajarilgan = [x] bandlar soni`, `qolgan = jami − bajarilgan`, `foiz = bajarilgan / jami × 100` (bir kasr xonasigacha). Reja yozilgani implementatsiya vazifasi bajarildi degani emas. Har vazifa yakunida tekshiruv dalili va vaqt `docs/work-log.md`da, umumiy sonlar bu jadvalda yangilanadi. Yangi vazifa qo‘shilsa ID’lar takrorlanmaydi, jami va bajarilish tartibi yangilanadi.

## H. 3 kunlik reja

Bir ishlab chiquvchi uchun taxminan **24 ish soati**, har kuni 8 soat. Bu baho, yakuniy hisobotdagi sarflangan vaqt emas. Asosiy funksiyalar birinchi o‘rinda; vaqt tig‘iz bo‘lsa vizual bezak qisqartiriladi, majburiy talablar va hisoblash testlari saqlanadi.

| Kun | Ishlar | Vaqt taqsimoti | Kun yakuni |
|---|---|---|---|
| 1-kun | TASK-001–003, 039, 004–018, 040–042 | Setup/env/jurnal 0.75 soat; DB/Prisma 1; API 2.25; pul/sana/qarz 1.5; image/startup/Compose 2; zaxira 0.5 | API misoli ishlaydi; konteyner build va startup asosi tayyor |
| 2-kun | TASK-019–032 | Sodda mobil UI 2.5 soat; integratsiya 1.5; validatsiya/xatolar 0.75; unit/API/DB testlar 1.5; E2E/build/fix 1.25; zaxira 0.5 | UI oqimlari, testlar va production build ishlaydi |
| 3-kun | TASK-043–045, 033, 046, 034–038 | Docker migratsiya/persistence 1 soat; Podman 0.75; npm dev 0.5; README/uch yo‘riqnoma/taklif/AI hisobot 1.5; toza muhit 1; GitHub/topshirish 0.5; zaxira/fix 2.75 | Docker/npm oqimlari tasdiqlangan; Podman natijasi qayd etilgan; saqlanish va topshirish tekshirilgan |

24 soatlik baho kichik UI, tayyor lokal PostgreSQL hamda Docker/Podman va provider mavjudligini nazarda tutadi. Engine o‘rnatish yoki platforma muammolari zaxiradan oshsa muddat qayta baholanadi; test natijasi yoki Podman mosligi taxmin bilan yopilmaydi. Konteynerlashtirish uchun qo‘shilgan vaqt UI bezaklarini qisqartirish va zaxirani qayta taqsimlash orqali ajratilgan.

Ish jurnali barcha kunlarda yuritiladi; 3-kuni faqat faktlar asosida yakunlanadi. GitHub/Telegram hisobiga kirish kechiksa, tayyor lokal natija saqlanadi va tashqi qadam ochiq belgilanadi. Majburiy talablar muddatga sig‘masligi ma’lum bo‘lsa, TASK.md’dagi imkoniyatga muvofiq buyurtmachiga qo‘shimcha vaqt so‘rash uchun aniq sabab va qolgan ishlar tayyorlanadi; foydalanuvchi ko‘rsatmasisiz xabar yuborilmaydi.

### Tasdiqlashda aniqlashtiriladigan masalalar

- To‘lov sanasi xizmat oyini ham belgilashi, ortiqcha to‘lov boshqa oyga o‘tmasligi qabul qilinadimi?
- Tarif o‘zgarishining tarixiy qarzlarga ta’siri va barcha o‘quvchilarni barcha oylar uchun hisoblash taxmini mosmi?
- O‘quvchini o‘chirishda uning to‘lov tarixini ham o‘chirish test loyihasi uchun maqbulmi?
- Topshirish paytida GitHub repository/hisob va tekshiruvchi kirishi qanday ta’minlanadi; Telegram xabarini foydalanuvchi yuboradimi?

Bu masalalar uchun ishchi taxminlar yuqorida berilgan. Hozir faqat reja yaratilgan; tasdiq kelmaguncha vazifalar bajarilmaydi.
