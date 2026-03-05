# 🏠 Smart Home Management System — Backend

A comprehensive home management REST API built with **Node.js, Express, TypeScript, Prisma, MongoDB, and Redis**.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| ORM | Prisma |
| Database | MongoDB (Atlas) |
| Cache / Queue | Redis + BullMQ |
| Auth | JWT + bcrypt |
| File Upload | Cloudinary |
| Payment | Stripe |
| Email | Nodemailer / SendGrid |
| Push Notification | Firebase (FCM) |
| Task Scheduler | node-cron / BullMQ |
| Validation | Zod |
| Logging | Winston |
| API Docs | Swagger (OpenAPI) |

---

## 📁 Folder Structure

```
src/
├── config/
│   ├── db.ts               # Prisma client
│   ├── redis.ts            # Redis client
│   ├── bullmq.ts           # Queue setup
│   ├── cloudinary.ts       # File upload config
│   ├── firebase.ts         # FCM config
│   └── swagger.ts          # API docs config
│
├── modules/
│   ├── auth/
│   ├── user/
│   ├── child/
│   ├── familyMember/
│   ├── feed/
│   ├── event/
│   ├── reminder/
│   ├── notification/
│   ├── medicine/
│   ├── meal/
│   ├── houseroom/
│   ├── device/
│   ├── finance/
│   ├── inventory/
│   ├── memory/
│   ├── chat/
│   ├── subscription/
│   └── payment/
│
├── common/
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   └── error.middleware.ts
│   ├── guards/
│   │   └── roles.guard.ts
│   ├── utils/
│   │   ├── response.ts       # standard API response helper
│   │   ├── pagination.ts
│   │   ├── jwt.ts
│   │   └── otp.ts
│   └── types/
│       └── express.d.ts      # req.user type extension
│
├── jobs/                     # cron jobs & queue workers
│   ├── doseLog.job.ts
│   ├── medicineReminder.job.ts
│   ├── eventReminder.job.ts
│   └── customReminder.job.ts
│
├── app.ts
└── server.ts
```

---

## 📦 Modules Overview

### 🔐 Auth
- Register, Login, Logout
- Email verification (OTP via Redis TTL)
- Forgot password / Reset password
- JWT access token + refresh token
- JWT blacklist on logout (Redis)

### 👤 User
- Get profile, Update profile
- Upload avatar (Cloudinary)
- Change password
- Delete account (soft delete)

### 👨‍👩‍👧 Family Member
- CRUD for family members
- Relations: Father, Mother, Spouse, Son, Daughter, etc.
- Status: Active, Inactive, Deceased, Estranged

### 👶 Child
- CRUD for children
- Health info: allergies, blood group, medical conditions
- School info, interests, weight/height tracking

### 👷 Caregiver
- Admin creates caregiver (self-relation on User)
- Assign caregiver to meal days, feed responses

### 📢 Support Feed
- User creates feed post (Bug, Question, Complaint, etc.)
- Admin assigns moderator
- Comments, nested replies, reactions
- Status history audit trail (Open → InProgress → Resolved)
- Feed pinning, locking by admin

### 📅 Event
- Create events with category (SchoolDropOff, Medical, etc.)
- Assign to self / family member / child / caregiver
- Reminder scheduling via BullMQ (X minutes before)
- Recurrence support

### ⏰ Custom Reminder
- User creates reminder for themselves
- Admin creates reminder for specific user or broadcast to all
- Delivery tracking per user for broadcasts

### 🔔 Notification
- In-app notifications for all major actions
- FCM push notifications
- Mark as read / mark all as read
- Unread count cached in Redis

### 💊 Medicine
- Prescription management (with file upload)
- Medicine schedule (Daily/Weekly/Monthly/Custom)
- Dose log — cron job marks missed doses every night
- Medicine reminders via BullMQ queue
- Refill alert when doses running low

### 🍽 Meal Plan
- Weekly meal plan (auto-generates next week when current completes)
- 7-day plan with Breakfast/Lunch/Dinner/Snack slots
- Assign specific days to caregiver
- Link meals from recipe library or quick custom entry

### 🏠 House Room
- 6 default rooms auto-created on user registration
- User can add max 2 custom rooms (total 8)
- Each room holds: CCTV cameras, AC units, smart devices

### 📷 CCTV Camera
- Store stream URL (RTSP/HLS) — no recording
- View live stream from browser via HLS.js / WebRTC
- Credentials encrypted at rest

### ❄️ Air Conditioner
- Store AC state (on/off, temperature, mode, fan speed)
- Smart control via Home Assistant / Tuya / SwitchBot API
- State cached in Redis for real-time UI updates

### 💡 Smart Devices
- Generic device model (TV, Lamp, Heater, Fridge, Router, etc.)
- Toggle on/off, power usage tracking
- Smart control config (controlType + controlId + controlMeta)

### 💰 Finance
- Monthly financial profile (income, expense, saving, investment)
- Salary breakdown (basic, allowances, deductions)
- Transaction CRUD with categories
- Budget per category with alert at threshold %
- Financial goals with progress tracking
- Weekly/Monthly/Yearly snapshot reports

### 📦 Inventory
- Track household supplies by room/location
- Categories: Supplies, Cleaning, Maintenance, Food

### 📸 Shared Memory
- Create memories (photos/notes) for self, child, or family member
- Share with specific users

### 💬 Chat
- Real-time 1-to-1 chat (Socket.io)
- Room-based messaging
- File/image sharing

### 💳 Subscription & Payment
- Free and Paid plans
- Stripe checkout session
- Webhook for payment confirmation
- UserSubscription with start/end date

---

## 🔑 Authentication & Authorization

```
Roles: USER | ADMIN | CAREGIVER | FAMILYMEMBER
```

| Route Type | Guard |
|-----------|-------|
| Public | No guard |
| Logged in user | `authMiddleware` |
| Admin only | `authMiddleware` + `roleGuard(ADMIN)` |
| Admin or Moderator | `authMiddleware` + `roleGuard(ADMIN, MODERATOR)` |

---

## 🗄 Redis Usage

| Feature | Usage |
|---------|-------|
| OTP | Store with 5 min TTL, deleted after verify |
| JWT Blacklist | Invalidate token on logout |
| Notification unread count | Cache per user |
| Smart device state | AC / device on-off state |
| BullMQ | Medicine reminders, event reminders, custom reminders, dose log cron |
| UserSubscription | Active plan cache |
| FinancialSnapshot | Monthly summary cache |

---

## 🔄 Background Jobs (BullMQ + node-cron)

| Job | Schedule | Description |
|-----|----------|-------------|
| `doseLog.job` | Every night 11:59 PM | Mark all unlogged doses as Missed |
| `medicineReminder.job` | Every minute | Check upcoming doses, send FCM |
| `eventReminder.job` | Every minute | Check events by reminderMinutes, send FCM |
| `customReminder.job` | Every minute | Trigger pending reminders, update status |
| `weeklyMealPlan.job` | Every Sunday night | Auto-generate next week plan if current Completed |

---

## 🌐 API Response Format

```json
{
  "success": true,
  "message": "Fetched successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

## ⚙️ Environment Variables

```env
# App
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb+srv://...

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run in development
npm run dev

# Build
npm run build

# Run production
npm start
```

---

## 📅 1-Month Development Plan

| Week | Focus |
|------|-------|
| Week 1 | Project setup, Auth, User, Family Member, Child |
| Week 2 | Feed, Event, Reminder, Notification |
| Week 3 | Medicine, Meal Plan, House Room, Devices |
| Week 4 | Finance, Inventory, Memory, Payment, Deploy |

---

## 📌 Module File Structure (per module)

```
modules/auth/
├── auth.routes.ts
├── auth.controller.ts
├── auth.service.ts
├── auth.dto.ts        # Zod schemas
└── auth.types.ts
```

---

## 🏗 Built With

- **Prisma + MongoDB** — flexible document storage with type-safe queries
- **Redis + BullMQ** — fast caching and reliable job queues
- **Modular architecture** — each feature is fully self-contained
- **Zod validation** — runtime type-safe request validation
- **Winston logging** — structured logs for production debugging

---

> Built for a Smart Home Management System covering family care, health, finance, home automation, and daily planning.
