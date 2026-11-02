# HER — The Forbidden Chapter

A private-feeling, interactive birthday story for **Shalu Mishra**, by **misstake**, for **24 November 2026**. Built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and Lucide React. It is a static website and needs no backend or API keys.

## Run locally

Use a current Node.js LTS release with npm, then run these commands from this directory:

```sh
npm install
npm run dev
```

Open the local address printed by Vite. To check the production build:

```sh
npm run build
npm run preview
```

Run the automated checks with:

```sh
npm test
```

## Personalise the story

Edit `src/story.ts` for the recipient, author, opening dialogue, quiz, six chapters, and final letter. The complete letter is in the `letter` object, with one paragraph per entry. Replace any wording that does not sound like you. Add only memories, details, and promises that are actually yours.

The birthday is stored as `2026-11-24T00:00:00+05:30`: midnight on 24 November in Asia/Kolkata. Keep the explicit `+05:30` offset when changing it. The countdown stops at zero when the date arrives; the story can be read before the birthday.

Typography uses locally bundled font packages. Visual styling lives in the app's CSS; the parchment, wax seal, book, and chapter decorations are made from CSS and vector shapes rather than generated portraits.

## Photographs

Four supplied photographs were selected for different moments in the story. They are served directly from `public/photos/`:

| File | Supplied original | Role |
| --- | --- | --- |
| `burgundy-portrait.jpeg` | `Unknown-5.jpeg` | The principal portrait: burgundy clothing and an antique doorway echo the book's palette. |
| `floral-portrait.jpeg` | `Unknown-6.jpeg` | A softer, candid-feeling portrait for the sincere turn in the story. |
| `sari-portrait.jpeg` | `Unknown-7.jpeg` | The warm final chapter reveal. |
| `birthday-wish.jpeg` | `Unknown-12.jpeg` | The candlelit birthday moment. |

To replace a photograph, put the new file in the same location with the same name, or update its source in the component. Check portrait crops on both phone and desktop, particularly around the face. Images have fallback treatments if a file cannot load. No shared memories are inferred from these photographs, and no synthetic photographs are used.

Use only images you intend to include in the gift: deploying the site also deploys these photographs. The story's locks are narrative progression, not access control.

## Story progression and accessibility

The experience proceeds from the book to the invitation, the three-question dossier, the six chapters, the seventh chapter, and finally the sealed letter. Completing all six chapter interactions unlocks the final chapter. Direct navigation cannot skip required story steps through the normal interface.

Progress is saved in this browser only; it does not sync between devices or accounts. Browser storage can be changed or cleared by the visitor, so the locks do not provide authentication or secrecy. Restart the story using the in-app restart control or clear this site's browser storage to begin again.

Audio is optional, synthesised in the browser, and starts only after a deliberate user action. It is off by default. There is no external music download or audio tracking service.

Keyboard focus, static alternatives for the teasing No button, and reduced-motion preferences are supported. The No option becomes stationary after its brief joke and remains a real choice. The letter is readable and scrollable on small screens.

## Deploy on Vercel

1. Put this project in a Git repository and import it as a Vercel project.
2. Use the Vite framework preset. If this folder sits inside a larger repository, set the project root to `her-forbidden-chapter`.
3. Use `npm run build` as the build command and `dist` as the output directory. No environment variables are required.
4. Deploy, then open the resulting URL on a phone and desktop. Walk through the entire story, including a fresh browser session and the final letter, before sharing it.

Navigation is contained in a single static application. Chapter URLs or browser-state changes are checked against local progress; they are not a substitute for private hosting. If you need the gift to be inaccessible to anyone except its recipient, add access protection through your hosting setup.

## Before gifting

Read the letter aloud once, verify the spelling of both names and the birthday, and check all four photo crops. Exercise the full journey with audio off and on, keyboard navigation, a narrow viewport, reduced motion, and a temporarily missing photo. Keep the final letter as the last reveal.
