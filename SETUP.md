# Helios Barber Web — Google Calendar booking

## Setup

1. Go to https://console.cloud.google.com/ → create a project (or use existing)
2. Enable the Google Calendar API
3. Create a service account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Download the JSON key
4. For each barber's Google Calendar **and the owner's**:
   - Open the calendar settings → Share with specific people
   - Add the service account email (from the JSON key)
   - Permission: "Make changes to events"
   - (Every booking is created on the barber's calendar and mirrored onto the owner's, so the
     owner sees all barbers' schedules in one place — this requires his calendar to be shared too.)
5. For booking confirmation emails, use a Gmail account (e.g. the studio's):
   - Turn on 2-Step Verification: https://myaccount.google.com/security
   - Create an App Password: https://myaccount.google.com/apppasswords
   - (Service accounts can't send Calendar invites to personal Gmail addresses without
     Domain-Wide Delegation, which only applies to Google Workspace — this sidesteps that.)

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

# Gmail account + App Password used to send booking confirmation emails
GMAIL_USER=studio@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

## Run

```bash
npm run dev
```
