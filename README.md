# Wizardify ✨

**Magical moving picture frames, inspired by the wizarding world.**

Wizardify turns your photos into a living portrait — a digital picture frame that moves, reacts and speaks, just like the enchanted portraits on the walls of a certain castle.

## How it works

1. **Upload your photos** on the Wizardify website.
2. **Answer a few questions** to personalize your portrait, for example:
   - Which house do you belong to?
   - Do you play Skyball (and which position)?
   - …and other details that shape your portrait's theme and personality.
3. **We craft your portrait.** Our team turns your photos and answers into custom animated videos, themed to your house and story.
4. **We ship it to you.** Your frame arrives pre-loaded with your videos.
5. **Plug it in.** The picture keeps moving — and comes alive when you're near.

## The frame

- 🖼️ **Digital moving display** that loops your personalized animated portraits
- 👋 **Motion sensor** — the portrait reacts when someone walks by
- 🔊 **Sound sensor** — the portrait responds to voices and sounds nearby
- 🔌 **Plug and play** — no setup or app required

## This repository

This repo contains the Wizardify website, where customers:

- upload their photos
- complete the house / Skyball / personalization questionnaire
- place their order

The site is deployed on [Vercel](https://vercel.com).

## Getting started

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Then open http://localhost:3000.

### Environment variables

Copy your environment variables into a `.env.local` file (never commit it). If the project is linked to Vercel, you can pull them with:

```bash
npx vercel link
npx vercel env pull .env.local
```

`.env.example` lists every variable and what it's for.

### Backend

The backend runs inside this Next.js app: Server Actions in `app/reserve/actions.ts` and route handlers such as `app/reserve/continue/route.ts`.

- **Database and photo storage:** Supabase, in the Mumbai region. The schema is in `supabase/migrations/`. Apply new migrations with `npx supabase db push --db-url "$POSTGRES_URL_NON_POOLING"`.
- **Email:** Resend. The templates are React components in `emails/`.
- **Bot check:** Cloudflare Turnstile on the drop form.

All server-only code lives in `lib/server/`.

### Managing members

The Supabase dashboard is the admin (supabase.com/dashboard, then the Wizardify project).

- **See members:** open Table Editor, then `reservations`. Each row is one member. `number` is their reservation number, so `1` is WZ-0001.
- **Find someone:** use Filter on `email` or `number`.
- **Photos:** open Storage, then `reservation-photos`. Each member's photos are in a folder named after their number, e.g. `WZ-0001`.
- **Export the list:** in Table Editor, choose Export, then CSV. It opens in Excel and includes each member's shipping pin code (`pincode`) and approximate location (`approx_city`, `approx_region` and `approx_country`), worked out from their connection when they reserved.
- **Delete a member on request:** delete their row in Table Editor. Their photos are removed automatically the next morning.
- **Stop someone's alerts:** set `alerts_email` or `alerts_whatsapp` to false. Members can also do this themselves from the unsubscribe link in any email.

### The daily check

Every morning at 9:00 IST, Vercel runs `app/api/cron/daily`, which:

1. Checks the database is up. It also keeps the free Supabase plan from pausing.
2. Emails and messages the team if the database is down or a free-plan limit passes 70%.
3. Sends the photo reminders that are due.
4. Removes the photos of deleted members.
5. Posts a summary on Telegram.

The team also gets a Telegram message for each new reservation, each time a member adds photos, and whenever a member hits an error. These messages never include members' names, emails or phone numbers.

## Deployment

Pushes to the main branch deploy to production on Vercel; other branches get preview deployments once the GitHub repo is connected to the Vercel project.

---

*Wizardify is an independent product and is not affiliated with or endorsed by Warner Bros. or J.K. Rowling.*
