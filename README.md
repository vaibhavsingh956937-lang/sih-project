# AYUSH OPD CMS (AYUSH-OPD-CMS)

> **Complete, Self-Hosted, Aadhar-Based Patient Case-Taking Software**

AYUSH-OPD-CMS is a production-ready medical case management web application designed for digitising Out-Patient Departments (OPDs) across all 5 official AYUSH systems: **Ayurveda**, **Yoga & Naturopathy**, **Unani**, **Siddha**, and **Homeopathy**.

---

## 🌟 Key Features

- **Aadhar-Based Patient Identification**: Uses unique 12-digit Aadhar numbers as primary identifiers (stored securely with front-end masking `XXXX-XXXX-1234`).
- **Supports All 5 AYUSH Systems**: Tailored diagnosis, examination (Nadi/Naadi/Nabz), treatment plans, Chikitsa Sutra, and formulation prescription.
- **Continuity of Care Timeline**: Doctors can review past visits, diagnoses, and prescriptions issued by any attending physician across the network.
- **Real-time Analytics Dashboard**: Tracks total patient volume, daily cases, and specialty system distribution.
- **Secure Authentication**: JWT-based session tokens with 24-hour expiration and bcryptjs password hashing.
- **Vercel & Neon Ready**: Seamlessly deploys on Vercel Serverless with PostgreSQL on Neon DB or runs completely standalone locally.

---

## 📂 Repository Structure

```
.
├── backend/
│   ├── config/
│   │   ├── database.js     # PostgreSQL pool & auto-table migration
│   │   └── vercel.json     # Serverless config
│   ├── routes/
│   │   ├── auth.js         # Register & Login endpoints
│   │   ├── doctors.js      # Doctor profile
│   │   ├── patients.js     # Patient registration & search by Aadhar
│   │   ├── cases.js        # AYUSH case sheet creation & timeline
│   │   └── analytics.js    # OPD statistics dashboard
│   ├── middleware/
│   │   └── auth.js         # JWT verification middleware
│   ├── models/
│   │   ├── Doctor.js       # Doctor data access object
│   │   ├── Patient.js      # Patient data access object
│   │   └── CaseSheet.js    # CaseSheet data access object
│   ├── server.js           # Express application server
│   ├── seed.js             # Demo data population script
│   ├── package.json
│   ├── .env.example
│   └── api/                # Vercel serverless entry point
│       └── index.js
├── frontend/
│   ├── public/
│   │   ├── index.html          # Doctor Login
│   │   ├── register.html       # Doctor Signup
│   │   ├── dashboard.html      # Main OPD Dashboard & Search
│   │   ├── patient-new.html    # Patient Registration
│   │   ├── case-new.html       # AYUSH Case Sheet Form
│   │   └── patient-history.html# Medical Timeline Profile
│   ├── css/
│   │   └── style.css       # AYUSH Design System (Teal Theme)
│   ├── js/
│   │   ├── api.js          # Centralized API fetch service
│   │   └── app.js          # App state, toasts & UI utilities
│   └── vercel.json
├── package.json            # Monorepo scripts
├── vercel.json             # Root Vercel deployment config
└── README.md
```

---

## 🗄️ Database Schema (PostgreSQL / Neon)

### 1. `doctors`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Doctor ID |
| `name` | `VARCHAR(120)` | `NOT NULL` | Full Name |
| `email` | `VARCHAR(160)` | `NOT NULL, UNIQUE` | Login Email |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | bcrypt hash |
| `ayush_system` | `VARCHAR(50)` | `DEFAULT 'Ayurveda'` | System ('Ayurveda', 'Yoga & Naturopathy', 'Unani', 'Siddha', 'Homeopathy') |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Registration timestamp |

### 2. `patients`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Internal ID |
| `aadhar_number` | `VARCHAR(12)` | `NOT NULL, UNIQUE` | **Primary 12-Digit Medical ID** |
| `full_name` | `VARCHAR(120)` | `NOT NULL` | Patient Name |
| `date_of_birth` | `DATE` | `NULL` | DOB for age calculation |
| `gender` | `VARCHAR(10)` | `NULL` | Gender |
| `phone` | `VARCHAR(10)` | `NULL` | 10-digit Phone |
| `address` | `TEXT` | `NULL` | Address |
| `village` | `VARCHAR(100)` | `NULL` | Village / Town |
| `district` | `VARCHAR(100)` | `NULL` | District |
| `state` | `VARCHAR(50)` | `NULL` | State |
| `created_by` | `INTEGER` | `REFERENCES doctors(id)` | Attending doctor |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Record timestamp |

### 3. `case_sheets`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `SERIAL` | `PRIMARY KEY` | Case Sheet ID |
| `patient_aadhar` | `VARCHAR(12)` | `REFERENCES patients(aadhar_number)` | Foreign Key Aadhar |
| `doctor_id` | `INTEGER` | `REFERENCES doctors(id)` | Prescribing Doctor |
| `ayush_system` | `VARCHAR(50)` | `NOT NULL` | System used |
| `visit_date` | `TIMESTAMP` | `DEFAULT NOW()` | Visit timestamp |
| `chief_complaint` | `VARCHAR(500)` | `NOT NULL` | Chief Complaint |
| `symptoms` | `TEXT` | `NULL` | Clinical history |
| `examination_findings` | `TEXT` | `NULL` | Nadi/Naadi/Nabz findings |
| `diagnosis` | `TEXT` | `NULL` | AYUSH Diagnosis |
| `treatment_plan` | `TEXT` | `NULL` | Chikitsa Sutra / Therapies |
| `medicines_prescribed` | `TEXT` | `NULL` | Formulations |
| `dosage_instructions` | `TEXT` | `NULL` | Pathya-Apathya & Dosage |
| `follow_up_date` | `DATE` | `NULL` | Follow-up Date |
| `notes` | `TEXT` | `NULL` | Additional Notes |

---

## ⚡ Quick Start (Local Setup)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create `.env` inside `backend/`:
```env
PORT=3000
DATABASE_URL=postgresql://neondb_owner:password@ep-sample.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=ayush_opd_secret_key_2026_secure
NODE_ENV=development
```
*(Note: If `DATABASE_URL` is omitted, the application automatically operates in high-performance in-memory mode for instant offline testing!)*

### 3. Populate Demo Seed Data
```bash
npm run seed
```

This populates:
- **Doctor 1**: `doctor1@ayush.gov.in` / `doctor1234` (Dr. Asha Sharma - Ayurveda)
- **Doctor 2**: `doctor2@ayush.gov.in` / `doctor1234` (Dr. Raj Patel - Yoga & Naturopathy)
- **5 Registered Patients** with Aadhar IDs (`123456789012`, `234567890123`, etc.)
- **15 Detailed Case Sheets** across AYUSH specialties.

### 4. Run Application
```bash
npm start
```
Open your browser and navigate to: `http://localhost:3000`

---

## 🌐 Vercel Deployment Instructions

1. **Push Repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - AYUSH OPD CMS"
   git remote add origin https://github.com/your-username/ayush-case-system.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com).
   - Import `ayush-case-system` from GitHub.
   - Configure Environment Variables:
     - `DATABASE_URL`: Connection string from Neon PostgreSQL.
     - `JWT_SECRET`: Random secure string.
     - `NODE_ENV`: `production`

3. **Automatic Deployment**:
   - Every push to `main` branch will build and deploy serverless endpoints under `/api/*` and serve static assets under `/`.

---

## 🔒 Security & Privacy Features

- 12-digit Aadhar strings validated strictly via regex (`^\d{12}$`).
- First 8 digits of Aadhar masked in UI (`XXXX-XXXX-1234`).
- JWT tokens expire after 24 hours.
- Passwords hashed with 10 salt rounds of `bcryptjs`.
- All database parameters sanitized against SQL Injection attacks.

---

## 📄 License
MIT License - Built for AYUSH OPD Digitisation.
