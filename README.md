# Habit Tracker

A personal habit tracking dashboard built as a portfolio project. The idea was simple: something that actually works day-to-day, not just a CRUD app dressed up as one. You can track habits as either binary (did it or didn't) or as a progress percentage — because logging 45 minutes at the gym when your goal was an hour still deserves credit.

Live: https://habittracker-0610.web.app

---

## Features

**Authentication** — email/password sign up and sign in via Supabase Auth. Sessions persist across refreshes. Each user only sees their own data, enforced at the database level with Row Level Security.

**Two habit types** — when you add a habit you choose how it's tracked:
- *Binary* — a simple checkbox. You did it or you didn't.
- *Progress* — a 0–100% input with a progress bar. Useful for things like workouts, reading goals, or anything where partial effort still counts.

**Daily logging** — the Today view shows all your habits for the current day. Check off binary habits, or save a progress value for percentage-based ones. Completed habits turn green and strike through.

**Streaks** — consecutive day streaks are calculated per habit and shown inline. A streak only counts if you logged the habit today or yesterday, so missing a day resets it.

**Insights** — two views of your last 7 days:
- An overall bar chart showing daily completion rate. The rate is calculated using actual values (a binary habit done = 100%, a progress habit at 60% = 60%), not just whether something was logged.
- A per-habit dot grid showing which days each habit was completed, with dimmer dots for lower progress values.

**Dark mode** — toggle between light and dark with a single button. Preference is saved to localStorage.

**Sections** — the page is split into Today, Insights, and Habits. The nav links scroll to each section smoothly.

---

## Stack

- **React + Vite** — frontend
- **Supabase** — Postgres database + auth + Row Level Security
- **Recharts** — bar chart in the Insights section
- **React Router** — route guarding between login and dashboard
- **Firebase Hosting** — deployment

---

## Database

Two tables:

```sql
habits (
  id, user_id, name, description, type ('binary' | 'progress'),
  color, archived, created_at
)

habit_logs (
  id, habit_id, user_id, logged_date, value (0–100), created_at
  unique(habit_id, logged_date)
)
```

RLS policies ensure users can only read and write their own rows.

---

## How it was built

This was the first in a series of small portfolio projects — the goal was to get comfortable with the full stack (React, Supabase, Firebase) before tackling something more complex. It was built incrementally: auth first, then routing, then CRUD, then logging, then streaks, then charts, then the design pass.

A few things that came up along the way worth noting:

The streak logic was the most interesting part to get right. A streak only counts if the habit was logged today or yesterday — otherwise leaving the app for a week and logging yesterday would still show a streak. The function walks backwards day by day and breaks the moment there's a gap.

The completion rate in the chart originally just counted whether a habit was logged (any log = 100%). That was wrong. For progress habits especially, logging 10% shouldn't count the same as 100%. The fix was summing the actual logged values and dividing by `(habitCount × 100)`.

The real-time update problem: the chart and streak hooks only fetched on mount, so checking off a habit wouldn't update the stats until you refreshed. Solved this with a `refreshKey` counter in the Dashboard that increments on every log toggle, passed as a dependency to the stats hooks so they re-fetch automatically.
