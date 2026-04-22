# Organizer

A personal PWA for managing tasks, notes, and calendar — dark theme, offline-capable, installable on iOS.

## Features

- **Tasks** — Create, complete, and delete tasks with priority levels (high/medium/low), due dates, and project tags
- **Notes** — Create and edit notes organized by project
- **Calendar** — Monthly calendar view with Google Calendar integration and task due dates
- **Offline** — Tasks and notes cached in localStorage, with service worker caching for API responses
- **PWA** — Installable on iOS (16.4+) and Android, runs standalone with no browser chrome
- **Notifications** — Browser notifications for upcoming task due dates
- **Auth** — Email/password authentication via Supabase with row-level security

## Stack

- React 18 + Vite
- Tailwind CSS
- Supabase (auth + Postgres)
- Google Calendar API (read-only)
- vite-plugin-pwa (service worker + manifest)

## Setup

### 1. Supabase

Create a project at [supabase.com](https://supabase.com) and run this SQL in the SQL Editor:

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

### 2. Google Calendar API

1. Enable the **Google Calendar API** in [Google Cloud Console](https://console.cloud.google.com)
2. Create an API key and restrict it to Google Calendar API
3. Make your calendar public in Google Calendar settings, or use OAuth2 for private calendars

### 3. Environment Variables

```bash
cp .env.example .env
```

Fill in your Supabase URL, anon key, Google API key, and calendar ID.

### 4. Install & Run

```bash
npm install
npm run dev
```

## Deploy

Push to GitHub and import at [vercel.com/new](https://vercel.com/new). Add the four environment variables from `.env.example` in project settings.

## iOS Install

Open the deployed URL in Safari on iOS 16.4+ → Share → Add to Home Screen.
