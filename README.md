# batihanozdemir.com

Personal site of Batıhan Özdemir. Next.js App Router, React, Tailwind CSS 4 and TypeScript, deployed on Vercel.

## Develop

```sh
pnpm install
pnpm dev
pnpm check   # lint, typecheck and the dash check
pnpm build
```

The contact form needs `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `CAPTCHA_SECRET_KEY` and `GOOGLE_APP_PASSWORD`; without them the form renders but cannot send.

## Layout

- `src/data/`: all site content (identity and links, roles, projects, skills). Change copy here.
- `src/components/ui/`: the receipt and ticket primitives, buttons, sections and chips.
- `src/components/home/`: the hero receipt printer, the ticket sheet and the devlog panel.
- `src/lib/`: date formatting, the YouTube feed reader and the printer store.
- `src/app/`: routes. The game privacy pages under `/games/*/privacy` and `/gameprivacy` are linked from Google Play and must keep their URLs.
- `scripts/check-dashes.mjs`: the site uses no em or en dashes; `pnpm check` fails when one appears.
