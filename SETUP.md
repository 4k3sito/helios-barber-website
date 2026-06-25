# Helios Barber Web — Google Calendar booking

## Setup

1. Go to https://console.cloud.google.com/ → create a project (or use existing)
2. Enable the Google Calendar API
3. Create a service account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Download the JSON key
4. For each barber's Google Calendar:
   - Open the calendar settings → Share with specific people
   - Add the service account email (from the JSON key)
   - Permission: "Make changes to events"

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
# From the service account JSON key
GCAL_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GCAL_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# One per barber — the calendar ID (from Google Calendar settings → Integrate calendar → Calendar ID)
GCAL_ALEX_ID=alex@group.calendar.google.com
GCAL_MARCO_ID=marco@group.calendar.google.com
GCAL_SARAH_ID=sarah@group.calendar.google.com
```

## Run

```bash
npm run dev
```
