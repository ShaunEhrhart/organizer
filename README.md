# Organizer

Personal PWA for tasks, notes, and calendar. Dark theme, offline-capable, installable on iOS.

## Stack

- React 18 + Vite
- Tailwind CSS
- Supabase (auth + database)
- Google Calendar API (read-only)
- vite-plugin-pwa (service worker + manifest)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run this SQL in the Supabase SQL Editor:

```sql
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  due_date date,
  priority text check (priority in ('high', 'medium', 'low')) default 'medium',
  project text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

create table notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text default '',
  project text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tasks enable row level security;
alter table notes enable row level security;

create policy "Users manage own tasks" on tasks
  for all using (auth.uid() = user_id);

create policy "Users manage own notes" on notes
  for all using (auth.uid() = user_id);
```

3. Go to Project Settings → API and copy the URL and anon key.

### 2. Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Enable the **Google Calendar API**
4. Go to Credentials → Create Credentials → API Key
5. Restrict the key to Google Calendar API
6. For a public calendar: make the calendar public in Google Calendar settings and use the calendar ID
7. For a private calendar: you'll need OAuth2 (add Google as a Supabase auth provider for seamless access tokens)

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```
cp .env.example .env
```

### 4. Install & Run

```bash
npm install
npm run dev
```

### 5. PWA Icons

Replace `public/icons/icon-192.png` and `public/icons/icon-512.png` with your own icons. The placeholder SVGs are generated at build time.

## Deploy to Vercel

1. Push to a GitHub repo
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Set the root directory to `Projects/Organizer/organizer` (or move the app to its own repo)
4. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_API_KEY`
   - `VITE_GOOGLE_CALENDAR_ID`
5. Deploy

### Custom Domain (optional)

In Vercel project settings → Domains, add your domain and update DNS records as instructed.

## iOS Install

1. Open the deployed URL in Safari on iOS 16.4+
2. Tap Share → Add to Home Screen
3. The app runs standalone with no browser chrome

## Offline

Tasks and notes are cached in localStorage. When offline, the app shows cached data. Changes sync when back online.

## Notifications

On first task creation, the app requests notification permission. Tasks with due dates get a browser notification at 9 AM on the due date (while the app is open or the service worker is active).
