# 🚀 AYUSH OPD CMS - Vercel Deployment Guide

## ✅ Deployment Status: READY FOR PRODUCTION

### 📌 Database Configuration
- **Database**: Neon PostgreSQL
- **Connection**: Successfully configured
- **URL**: `postgresql://neondb_owner:npg_yS2TkjiUrup3@ep-withered-frost-a5inujge-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

### 🔑 Environment Variables Set in Vercel:
```
DATABASE_URL = [Your PostgreSQL Connection String]
JWT_SECRET = ayush_opd_secret_key_2026_secure_vercel
NODE_ENV = production
```

### 📂 Project Structure
```
sih-project/
├── backend/
│   ├── api/index.js          (Vercel Serverless Entry)
│   ├── server.js             (Express Server)
│   ├── config/database.js    (Database Config)
│   ├── routes/               (API Endpoints)
│   ├── models/               (Data Models)
│   ├── middleware/           (Auth Middleware)
│   └── package.json
├── frontend/
│   ├── public/               (Static HTML Pages)
│   ├── js/                   (Client-side JavaScript)
│   ├── css/                  (Styling)
│   └── vercel.json
├── vercel.json               (Root Configuration)
└── README.md
```

### 🌐 Deployment URLs
**Frontend**: `https://sih-project.vercel.app/`
**API Base**: `https://sih-project.vercel.app/api/`

### 📝 Demo Credentials
```
Doctor 1:
- Email: doctor1@ayush.gov.in
- Password: doctor1234
- System: Ayurveda

Doctor 2:
- Email: doctor2@ayush.gov.in
- Password: doctor1234
- System: Yoga & Naturopathy
```

### 🏥 Default Test Patients (Aadhar Numbers)
- 123456789012
- 234567890123
- 345678901234
- 456789012345
- 567890123456

### 🔒 Security Features
✅ JWT Token-based Authentication (24-hour expiration)
✅ bcryptjs Password Hashing (10 rounds)
✅ Aadhar Masking in Frontend (XXXX-XXXX-1234)
✅ CORS Enabled
✅ SQL Injection Prevention
✅ PostgreSQL SSL/TLS Connection

### 📊 Database Tables
1. **doctors** - Doctor profiles & credentials
2. **patients** - Patient demographics (Aadhar-based)
3. **case_sheets** - Medical case records with vitals, diagnosis, treatment

### 🚀 Features Deployed
✅ Doctor Login & Registration
✅ Patient Registration & Search
✅ AYUSH Case Sheet Creation
✅ Medical Timeline View
✅ Follow-up Scheduling
✅ Analytics Dashboard
✅ Bilingual Support (English & Hindi)
✅ Theme Toggle (Light/Dark)
✅ Voice Dictation
✅ Prescription Printing

### 🔄 Auto-Deployment
Every push to `main` branch will automatically deploy to Vercel.

### 📞 Support
For issues, check logs in Vercel Dashboard → Deployments → Logs
