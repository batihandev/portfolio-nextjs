# batihanozdemir.com

Personal site of Batıhan Özdemir. Next.js App Router, React, Tailwind CSS 4 and TypeScript, deployed on Vercel.

## Develop

Use Node 22 or later and pnpm 10.

```sh
pnpm install
pnpm dev --port 3020 # stop it before pnpm test:e2e, which serves its own builds on 3020 to 3022
pnpm check          # lint, typecheck, the dash check and the unit tests
pnpm build
pnpm format         # Prettier; pnpm format:check only reports
pnpm test           # unit tests (Vitest)
pnpm test:e2e       # browser tests (Playwright), see below
```

Settings go in `.env`; `.env.example` lists them.

- `NEXT_PUBLIC_DEMO_API_URL`: the payment demo API, such as `http://localhost:3010`. It is read on the server and in the browser, and is fixed at build time. When it is unset, the band and the details page show "The demo is resting" and make no calls.
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `CAPTCHA_SECRET_KEY` and `GOOGLE_APP_PASSWORD`: the contact form. Without them the form renders but cannot send.

## Payment demo

The home page has a band for the [payment demo](https://github.com/batihandev/payment-pipeline-demo), a small payment system with a test card rail and a test network rail. A visitor sends a test purchase and watches it print as a receipt, beside a live list of other test purchases and a few figures for the day. `/payments-demo` explains the two rails, the stages a payment goes through and what keeps it reliable. It has its own printer, where a test purchase prints as a timeline of its steps with their times, beside the demo's latest receipts and settle times.

- The first paint comes from a server snapshot cached with ISR (`revalidate` 10 s, a 2.5 s timeout). If the API is down when the snapshot is due, the last good page keeps showing.
- The browser adds the live stream and the purchase keys on top. When the stream drops, the list stays and a "Live updates paused" note shows until it reconnects.
- A build that cannot reach the API starts with the resting band.

The code is in `src/components/home/PaymentsBand/`, `src/components/payments-demo/` and `src/lib/payments-demo/`.

## Browser tests

`pnpm test:e2e` builds the site three times (against the demo API, through a switchable proxy, and against a closed port), serves the builds on ports 3020 to 3022, and checks the band, the details page, page fit, keyboard access and accessibility in a desktop and a phone viewport.

It needs the demo API running on `http://localhost:3010`. Start it from the payment demo repository with `API_PORT=3010` and with `http://localhost:3020` in its `WEB_ORIGIN`, and run its buyer and tracker too, since the purchase test waits for a settled payment. Ports 3020 to 3022, 3031 and 3032 must be free, and 3039 must stay closed. `E2E_DEMO_API` points the tests at another demo API, and `E2E_SCREENSHOTS=<dir>` saves the screenshots there.

## CI

`.github/workflows/ci.yml` runs `pnpm check`, `pnpm build` and `pnpm format:check` on pull requests and on pushes to `main`. The browser tests run only when started by hand (`workflow_dispatch`), against the demo API URL given as input; that API's `WEB_ORIGIN` must include `http://localhost:3020`.

## Layout

- `src/data/`: all site content (identity and links, roles, projects, skills). Change copy here.
- `src/components/ui/`: the receipt and ticket primitives, buttons, sections and chips.
- `src/components/home/`: the hero receipt printer, the payment demo band and the devlog panel.
- `src/lib/`: date formatting, the YouTube feed reader, page metadata, the printer store and the payment demo client.
- `src/app/`: routes. The game privacy pages under `/games/*/privacy` and `/gameprivacy` are linked from Google Play and must keep their URLs.
- `e2e/`: the Playwright tests and their servers and proxy.
- `scripts/check-dashes.mjs`: the site uses no em or en dashes; `pnpm check` fails when one appears.
