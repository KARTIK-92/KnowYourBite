# KnowYourBite 🍎🔍

**KnowYourBite** is a futuristic, AI-powered nutrition assistant that transforms your device into a smart health lens. By combining computer vision (**Google Gemini 2.5 Flash**) with cloud persistence (**Supabase**), it allows users to scan food, analyze ingredients instantly, and track their nutritional goals with holographic precision.

![Status](https://img.shields.io/badge/Status-Live-emerald)
![AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-blue)
![Database](https://img.shields.io/badge/DB-Supabase-green)
![Framework](https://img.shields.io/badge/Frontend-React%2019-61dafb)

## ✨ Features

- **📸 AI Food Scanning**: Instantly analyze food via camera or image upload. The AI identifies the product, estimates nutrition (calories, macros), and detects hidden additives.
- **🧠 Intelligent Health Scoring**:
  - Classifies ingredients as **Good**, **Bad**, or **Neutral** with detailed reasoning.
  - Provides a "Health Verdict" explaining *why* a product is healthy or unhealthy.
  - Suggests 3 healthier alternatives for unhealthy items.
- **🍽️ Natural Language Meal Logging**: Log complex meals by simply describing them (e.g., *"I had 2 eggs and toast"*). The AI breaks it down into nutrients automatically.
- **📊 Dynamic Diet Planner**: 
  - Set personalized daily goals (Calories, Protein, Carbs, Fats, Sugar, Salt).
  - Visual circular progress rings.
  - Timeline view of your daily intake.
- **🔐 Cloud Sync & Auth**:
  - Secure Email/Password authentication via **Supabase**.
  - Guest Mode for quick trials.
  - Data persistence: History, Diet Plan, and Goals are saved to the cloud.
- **🎨 Holographic UI**: Glassmorphism design, dark/light mode, and fluid framer-motion animations.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 2.5 Flash (via `@google/genai`)
- **Backend/Auth**: Supabase (PostgreSQL, Row Level Security)
- **Icons**: Lucide React
- **Animation**: Framer Motion

## 🚀 Getting Started

### 1. Prerequisites
- A **Google Cloud Project** with the Gemini API enabled.
- A **Supabase** project.

### 2. Database Setup (Supabase)
To enable user accounts and data saving, run this SQL in your Supabase **SQL Editor**:

```sql
-- Create a table to store user profiles and data
create table profiles (
  id uuid references auth.users on delete cascade,
  email text,
  full_name text,
  daily_goals jsonb,
  history jsonb,
  diet_plan jsonb,
  stats jsonb,
  primary key (id)
);

-- Enable Security
alter table profiles enable row level security;

-- Create Access Policies
create policy "Users can view own profile" on profiles for select using ( auth.uid() = id );
create policy "Users can insert own profile" on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile" on profiles for update using ( auth.uid() = id );
```

### 3. Authentication Configuration
1. Go to Supabase Dashboard -> **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your deployed URL (e.g., `https://your-app.vercel.app`).
3. Add your domain to **Redirect URLs**.

### 4. Environment Variables
Ensure your application has access to the API Keys.

| Variable | Description |
| :--- | :--- |
| `API_KEY` | Your Google Gemini API Key |
| `SUPABASE_URL` | Your Supabase Project URL (configured in `services/supabase.ts`) |
| `SUPABASE_KEY` | Your Supabase Anon Key (configured in `services/supabase.ts`) |

*Note: In the current codebase, Supabase keys are initialized in `services/supabase.ts`. For production, consider using environment variables.*

### 5. Running Locally
Clone the repository and run using a local development server (e.g., Vite):

```bash
npm install
npm run dev
```

*(Note: This project uses ES Modules and can also be run directly in modern browsers if served correctly, but a build step is recommended for production optimization).*

## 📄 License

This project is licensed under the MIT License.
