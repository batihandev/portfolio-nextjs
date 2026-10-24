<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfolio: agent rules

Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, pnpm 10. Unit tests run on Vitest with Testing Library; browser tests on Playwright. The README covers setup, the payment demo and the browser tests.

## Checks

Run before calling work done:

- `pnpm check`: ESLint, `tsc --noEmit`, the dash check and the unit tests.
- `pnpm format:check`: Prettier.
- `pnpm build`: the home, experience, contact and payment demo pages set `export const dynamic = "error"`, so if one turns dynamic the build fails instead of the page quietly losing its static render. Give a new page with data the same guard.
- `pnpm test:e2e` when a change touches layout, the payment demo or its calm states. It builds the site three times and serves the builds on ports 3020 to 3022, so stop any dev server on 3020 first. It needs the payment demo API on `http://localhost:3010`.

## Copy

- Site copy lives in `src/data/` and in the payment demo's `src/lib/payments-demo/copy.ts`.
- No em or en dashes in `src/` or `public/`; `scripts/check-dashes.mjs` fails on them. Write "to" or a comma instead.
- Plain and exact, with no hype.

## Layout and motion

- Every page fits at 360 px with no sideways scroll, and every button is at least 44 px tall (`e2e/fit.spec.ts`). A small visible control keeps a 44 px target around it, as the printer keys in `PayKeys.tsx` do.
- Colours are tokens in `src/app/globals.css`, defined for both themes; text tokens keep at least 4.5:1 on the paper and the canvas, as the comments there record.
- Animations run only under `motion-safe:` or `@media (prefers-reduced-motion: no-preference)`.

## Payment demo

The home band (`src/components/home/PaymentsBand/`) and the details page (`src/app/payments-demo/`, `src/components/payments-demo/`) show a live, separately hosted payment demo through `src/lib/payments-demo/`. The rule that shapes all of it: **the site never looks broken**, whatever the demo API does.

- The first paint is a server snapshot cached with ISR (`snapshot.ts`: 10 s revalidation, 2.5 s deadline). A failed read throws at runtime so Next keeps the last good page, and gives `null` only at build time so the page starts resting (`load.ts`).
- Every browser read has a deadline, and every failure shows a calm line or the resting state, never an error. The e2e suite checks the band with the API stopped, slow, and with the stream cut, and the details page with the API stopped.
- Incoming data passes the guards in `parse.ts`; a payment with a stage or provider the site does not know is refused.
- One event stream per page: `useLivePayments` owns it, and the band and the details page feed their purchase from it. A second stream from the same tab spends the browser's per-host connection limit and the API's per-client stream limit.
- The purchase flow is `usePurchase` and the printer's feed and shred phases are `usePrinter`; the band and the details page both use them rather than keeping their own copies.
- The confirmation target comes from the API's `/health` (`snapshot.confirmations`, then `usePurchase`); never write a number of confirmations into code or copy.
- External links come from `paymentLink` in `format.ts`: the block explorer for a transfer, Stripe's receipt for a card, and only `https://` links.
