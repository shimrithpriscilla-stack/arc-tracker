# Arc — Winter Arc Fitness Tracker 🦝

Personal fitness tracker for Shimrith's winter arc journey (92kg → 80kg).

**Stack:** Next.js 14 · Supabase · Vercel · Tailwind CSS · No paid APIs

---

## Setup Guide (30 minutes, no code needed)

### Step 1: Create a Supabase project (free)

1. Go to [app.supabase.com](https://app.supabase.com) → Sign up (free tier is fine)
2. Click **New Project** → choose a name (e.g. `arc-tracker`) → set a database password → pick a region → **Create project**
3. Wait ~2 minutes for it to spin up
4. Go to **SQL Editor** (left sidebar) → **New Query**
5. Copy-paste the entire contents of `supabase-schema.sql` into the editor → Click **Run**
6. Go to **Settings → API** (left sidebar)
7. Copy:
   - **Project URL** → starts with `https://...supabase.co`
   - **anon / public** key (under "Project API Keys")

### Step 2: Set up environment variables

1. In the project folder, copy `.env.example` to `.env.local`:
   ```
   cp .env.example .env.local
   ```
2. Open `.env.local` and paste your Supabase values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 3: Push to GitHub

1. Create a new repository on [github.com](https://github.com) → **New Repository** → Name it `arc-tracker` → **Create repository**
2. In your terminal, navigate to the project folder:
   ```bash
   cd arc-app
   git init
   git add .
   git commit -m "Initial Arc app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/arc-tracker.git
   git push -u origin main
   ```

### Step 4: Deploy to Vercel (free)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New → Project**
3. Import your `arc-tracker` repository
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy** → wait ~2 minutes
6. Your app is live at `your-project-name.vercel.app` 🎉

### Step 5: Add to iPhone home screen (PWA)

1. Open your Vercel URL in Safari on iPhone
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **Add to Home Screen**
4. Name it "Arc" → tap **Add**
5. The app now opens full-screen like a native app!

---

## ChatGPT Format Guide

Configure your ChatGPT project with this system prompt:

> When I describe food, respond in exactly this format (no extra text):
> ```
> MEAL:Breakfast
> Food item name|cal:X|prot:Xg|carbs:Xg|fat:Xg|fiber:Xg
> ```
> Meal types: Breakfast, Lunch, Dinner, Snack, Pre_Workout, Post_Workout
> Use SKIP if a field is unknown. Start the WORKOUT section with WORKOUT on its own line.
> ```
> WORKOUT
> Exercise name|sets:X|reps:X|dur:Xmin|burn:X
> TOTAL:burn:X|dur:Xmin
> ```

**Example food output:**
```
MEAL:Breakfast
Masala oats with veggies|cal:310|prot:12|carbs:48|fat:8|fiber:5
Banana|cal:90|prot:1|carbs:23|fat:0|fiber:3

MEAL:Lunch
Dal + 1 cup rice|cal:420|prot:16|carbs:72|fat:6|fiber:4
Cucumber raita|cal:60|prot:3|carbs:8|fat:2|fiber:1
```

**Example workout output:**
```
WORKOUT
Bench press|sets:4|reps:10|burn:120
Pull-ups|sets:3|reps:8|burn:80
Running|dur:20min|burn:180
TOTAL:burn:380|dur:50min
```

---

## App Features

| Feature | Description |
|---------|-------------|
| **Sessions** | A "day" = wake → sleep. Start session in the morning, end with Sleep button |
| **Food Log** | Paste ChatGPT output → auto-parsed → logged instantly |
| **Workout Log** | Same paste flow for workouts |
| **Water Log** | Tap buttons (150ml, 200ml, 250ml... up to 750ml), custom amounts |
| **Weight Log** | Manual entry with +/- controls, shows progress to 80kg goal |
| **Sleep Log** | Log sleep time + quality, closes the day's session |
| **Macro Rings** | SVG donuts for Cal, Protein, Carbs, Fat, Water — turns red when exceeded |
| **Rocky Raccoon** | Mood changes based on daily performance — 5 moods |
| **Macro Challenges** | Real-time coaching on gaps (protein, water, fiber, calorie deficit) |
| **Progress Page** | Weight trend chart, session history |
| **Settings** | Edit all daily targets with sliders |

---

## File Structure

```
arc-app/
├── app/
│   ├── page.tsx              # Home dashboard
│   ├── layout.tsx            # Root layout (PWA config)
│   ├── globals.css           # Dark theme + animations
│   ├── log/
│   │   ├── food/page.tsx     # Food log (paste parser)
│   │   ├── workout/page.tsx  # Workout log (paste parser)
│   │   ├── water/page.tsx    # Water log (tap buttons)
│   │   ├── weight/page.tsx   # Weight log (manual)
│   │   └── sleep/page.tsx    # Sleep log (closes session)
│   ├── progress/page.tsx     # Charts and history
│   └── settings/page.tsx     # Edit targets
├── components/
│   ├── BottomNav.tsx         # 5-tab bottom navigation
│   ├── MacroRing.tsx         # SVG donut ring chart
│   ├── RaccoonMascot.tsx     # Rocky raccoon (5 moods)
│   └── MacroChallenges.tsx   # Coaching engine
├── lib/
│   ├── supabase.ts           # Supabase client + USER_ID
│   ├── queries.ts            # All DB functions
│   ├── utils.ts              # Parsers, raccoon mood, helpers
│   └── database.types.ts     # TypeScript types
├── public/
│   └── manifest.json         # PWA manifest
├── supabase-schema.sql       # Run this in Supabase SQL Editor
├── .env.example              # Copy to .env.local
└── README.md                 # This file
```

---

Built with ❤️ for Shimrith's Winter Arc 🦝 (92kg → 80kg)
