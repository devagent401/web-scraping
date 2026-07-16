# বাংলাদেশ গ্যাজেট সার্চ API - বাংলা ডকুমেন্টেশন

**ভাষা**: বাংলা | **প্রজেক্ট**: বাংলাদেশ গ্যাজেট সার্চ এবং মূল্য তুলনা প্ল্যাটফর্ম

---

## 📖 ওভারভিউ

এটি একটি **প্রোডাকশন-রেডি NestJS API** যা বাংলাদেশের গ্যাজেট স্টোর থেকে পণ্য খোঁজে এবং দাম তুলনা করে।

### প্রধান বৈশিষ্ট্য:
- 🔍 **মাল্টি-স্টোর সার্চ** - একসাথে অনেক দোকান থেকে খোঁজ
- 💰 **দাম তুলনা** - সর্বনিম্ন দাম খুঁজুন
- ⚡ **দ্রুত কর্মক্ষমতা** - Redis ক্যাশিং সহ
- 🔄 **ব্যাকগ্রাউন্ড জব** - BullMQ এর সাথে
- 📊 **সম্পূর্ণ সার্চ** - Meilisearch এর সাথে
- 🔐 **সম্পূর্ণ নিরাপদ** - JWT এবং Helmet সহ
- 📚 **ডকুমেন্টেড API** - Swagger সহ

---

## 🚀 দ্রুত শুরু

### এক কমান্ডে সবকিছু শুরু করুন:

```bash
# ১. প্রজেক্টে যান
cd /Users/pylot/Downloads/Self/scrapping/api

# २. ডিপেন্ডেন্সি ইনস্টল করুন
pnpm install

# ३. Docker সার্ভিসেস চালু করুন
docker-compose up -d

# ४. ডাটাবেস শুরু করুন
pnpm prisma:migrate

# ५. API চালু করুন
pnpm start:dev
```

এখন এখানে ভিজিট করুন: **http://localhost:5000/api/docs**

---

## 📚 ডকুমেন্টেশন

### বাংলায় গাইডস:
- 📖 [**শুরু_করুন.md**](./শুরু_করুন.md) - দ্রুত শুরু গাইড
- 📖 [**সেটআপ_গাইড.md**](./সেটআপ_গাইড.md) - বিস্তারিত সেটআপ
- 📖 [**ফেজ_१_সারসংক্ষেপ.md**](./ফেজ_१_সারসংক্ষেপ.md) - যা তৈরি হয়েছে

### ইংরেজিতে গাইডস:
- 📖 [**QUICK_START.md**](./QUICK_START.md) - দ্রুত রেফারেন্স
- 📖 [**INSTALLATION_GUIDE.md**](./INSTALLATION_GUIDE.md) - সম্পূর্ণ সেটআপ
- 📖 [**SETUP_VERIFICATION.md**](./SETUP_VERIFICATION.md) - চেকলিস্ট
- 📖 [**PHASE_1_SUMMARY.md**](./PHASE_1_SUMMARY.md) - সম্পূর্ণ বিবরণ

---

## 🛠️ কাজে লাগানোর কমান্ডস

### ডেভেলপমেন্ট
```bash
pnpm start:dev          # সার্ভার হট-রিলোড সহ চালু করুন
pnpm start:debug        # ডিবাগ মোডে চালু করুন
```

### টেস্টিং
```bash
pnpm test               # সব টেস্ট চালান
pnpm test:watch        # ওয়াচ মোডে টেস্ট চালান
pnpm test:cov          # কভারেজ রিপোর্ট
```

### কোড ফরম্যাটিং
```bash
pnpm lint               # কোড লিন্টিং চেক করুন
pnpm format             # স্বয়ংক্রিয়ভাবে ফরম্যাট করুন
```

### ডাটাবেস
```bash
pnpm prisma:studio     # ডাটাবেস GUI খুলুন
pnpm prisma:migrate    # নতুন মাইগ্রেশন চালান
```

### Docker
```bash
docker-compose up -d    # সব সার্ভিস চালু করুন
docker-compose down     # সব সার্ভিস বন্ধ করুন
docker-compose logs -f  # সব লগ দেখুন
```

---

## 📁 প্রজেক্ট স্ট্রাকচার

```
api/
├── src/
│   ├── main.ts                  # এন্ট্রি পয়েন্ট
│   ├── app.module.ts            # মূল মডিউল
│   ├── config/                  # কনফিগারেশন
│   ├── database/                # ডাটাবেস
│   ├── modules/                 # ফিচার মডিউলস
│   │   ├── auth/                # প্রমাণীকরণ
│   │   ├── users/               # ব্যবহারকারীরা
│   │   ├── scraping/            # স্ক্র্যাপিং
│   │   ├── health/              # স্বাস্থ্য চেক
│   │   └── webhooks/            # ওয়েবহুক
│   ├── common/                  # শেয়ারড কোড
│   │   ├── filters/             # এক্সেপশন ফিল্টার
│   │   ├── guards/              # অথ গার্ড
│   │   ├── interceptors/        # রেসপন্স ইন্টারসেপ্টর
│   │   ├── dto/                 # ডেটা ভ্যালিডেশন
│   │   └── pipes/               # কাস্টম পাইপস
│   ├── services/                # বেস সার্ভিস
│   └── utils/                   # হেল্পার ফাংশন
├── prisma/
│   └── schema.prisma            # ডাটাবেস স্কিমা
├── test/                        # E2E টেস্টস
├── docker-compose.yml           # Docker সার্ভিসেস
├── Dockerfile                   # প্রোডাকশন বিল্ড
├── package.json                 # ডিপেন্ডেন্সিস
└── tsconfig.json               # TypeScript কনফিগ
```

---

## 🗄️ ডাটাবেস

### সার্ভিসেস:

| সার্ভিস | পোর্ট | উদ্দেশ্য |
|---------|-------|---------|
| **PostgreSQL** | ५४३२ | মূল ডাটাবেস |
| **Redis** | ६३७९ | ক্যাশিং এবং কিউস |
| **Meilisearch** | ७७०० | ফুল-টেক্সট সার্চ |

### মডেলস:
- **User** - ব্যবহারকারী এবং প্রমাণীকরণ
- **ApiKey** - API কী ম্যানেজমেন্ট
- **ScrapeJob** - স্ক্র্যাপিং জবস
- **ScrapeResult** - স্ক্র্যাপিং রেজাল্টস
- **Webhook** - ওয়েবহুক কনফিগারেশনস

---

## 🔐 নিরাপত্তা

✅ **JWT Token-based** প্রমাণীকরণ  
✅ **bcrypt** পাসওয়ার্ড এনক্রিপশন  
✅ **Helmet** HTTP হেডার সুরক্ষা  
✅ **CORS** কনফিগারেশন  
✅ **Input Validation** সব এন্ডপয়েন্টে  
✅ **Rate Limiting** প্রস্তুত  

---

## 🌐 API এন্ডপয়েন্টস

| রুট | উদ্দেশ্য |
|-----|---------|
| `GET /api/v1/health` | স্বাস্থ্য চেক |
| `GET /api/docs` | Swagger ডকুমেন্টেশন |
| **Auth** (শীঘ্রই) | যোগাযোগ সাইন-আপ/লগইন |
| **Products** (শীঘ্রই) | পণ্য সার্চ এবং বিস্তারিত |
| **Search** (শীঘ্রই) | মাল্টি-স্টোর সার্চ |

---

## 🧪 টেস্টিং

```bash
# ইউনিট টেস্টস
pnpm test

# E2E টেস্টস
pnpm test:e2e

# কভারেজ রিপোর্ট
pnpm test:cov
```

---

## 🐳 Docker

### সার্ভিস চালু করুন:
```bash
docker-compose up -d
```

### লগ দেখুন:
```bash
docker-compose logs -f              # সব লগ
docker-compose logs -f postgres      # শুধু DB
docker-compose logs -f api          # শুধু API
```

### সব বন্ধ করুন:
```bash
docker-compose down -v    # ডেটা সহ বন্ধ
```

---

## 📊 টেকনোলজি স্ট্যাক

### ব্যাকএন্ড:
- **NestJS** - প্রোডাকশন-রেডি ফ্রেমওয়ার্ক
- **TypeScript** - টাইপ সেফটি
- **Prisma ORM** - ডাটাবেস ম্যানেজমেন্ট
- **PostgreSQL** - মূল ডাটাবেস
- **Redis** - ক্যাশিং এবং কিউস
- **Meilisearch** - সার্চ ইঞ্জিন

### অটোমেশন:
- **BullMQ** - জব কিউ
- **Docker** - কন্টেইনারাইজেশন
- **Jest** - টেস্টিং

### সার্চ এবং স্ক্র্যাপিং:
- **Cheerio** - HTML পার্সিং
- **Playwright** - ব্রাউজার অটোমেশন
- **Axios** - HTTP ক্লায়েন্ট

---

## 🚦 স্থিতি

### ফেজ १ - সেটআপ
✅ সম্পূর্ণ!

### পরবর্তী:
- ⏳ মডিউল १ - Auth (প্রমাণীকরণ)
- ⏳ মডিউল २ - Products (পণ্য ম্যানেজমেন্ট)
- ⏳ মডিউল ३ - Search (মাল্টি-স্টোর সার্চ)
- ⏳ এবং আরও অনেক কিছু...

---

## 📞 সহায়তা

### সমস্যা সমাধান:

**পোর্ট ব্যবহারে আছে:**
```bash
lsof -i :5000 && kill -9 <PID>
```

**ডাটাবেস সংযোগ সমস্যা:**
```bash
docker-compose logs postgres
cat .env | grep DATABASE_URL
```

**সার্ভিস লগ:**
```bash
docker-compose logs -f
```

**সম্পূর্ণ রিসেট (ডেভেলপমেন্টে শুধু):**
```bash
docker-compose down -v
rm -rf node_modules pnpm-lock.yaml
pnpm install
docker-compose up -d
pnpm prisma:migrate
```

---

## 📝 নোটস

- সব কনফিগারেশন `.env` ফাইলে
- ডাটাবেস স্কিমা `prisma/schema.prisma` এ
- API ডকুমেন্টেশন Swagger এ (`/api/docs`)
- প্রোডাকশন-রেডি Docker সেটআপ অন্তর্ভুক্ত

---

## 📅 আপডেটস

**তৈরির তারিখ**: २०२६-०७-१६  
**সর্বশেষ আপডেট**: २०२६-०७-१६  
**স্থিতি**: ✅ প্রস্তুত  

---

## 👨‍💻 শুরু করার জন্য সাহায্য পান

### দ্রুত কমান্ড:
```bash
# সবকিছু সেটআপ করুন
pnpm install && docker-compose up -d && pnpm prisma:migrate && pnpm start:dev

# ব্রাউজার খুলুন
http://localhost:5000/api/docs
```

### বাংলা নির্দেশনা পড়ুন:
1. 📖 [শুরু_করুন.md](./শুরু_করুন.md) - দ্রুত শুরু
2. 📖 [সেটআপ_গাইড.md](./সেটআপ_গাইড.md) - বিস্তারিত
3. 📖 [ফেজ_१_সারসংক্ষেপ.md](./ফেজ_१_সারসংক্ষেপ.md) - সম্পূর্ণ তথ্য

---

**প্রস্তুত? চলুন শুরু করি!** 🚀

```bash
cd /Users/pylot/Downloads/Self/scrapping/api
pnpm install
docker-compose up -d
pnpm prisma:migrate
pnpm start:dev
```

এখন খোলে: http://localhost:5000/api/docs ✅
