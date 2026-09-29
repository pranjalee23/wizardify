# Wizardify ✨

**Magical moving picture frames, inspired by the wizarding world.**

Wizardify turns your photos into a living portrait — a digital picture frame that moves, reacts and speaks, just like the enchanted portraits on the walls of a certain castle.

## How it works

1. **Upload your photos** on the Wizardify website.
2. **Answer a few questions** to personalize your portrait, for example:
   - Which house do you belong to?
   - Are you a Quidditch player (and which position)?
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
- complete the house / Quidditch / personalization questionnaire
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

## Deployment

Pushes to the main branch deploy to production on Vercel; other branches get preview deployments once the GitHub repo is connected to the Vercel project.

---

*Wizardify is an independent product and is not affiliated with or endorsed by Warner Bros. or J.K. Rowling.*
