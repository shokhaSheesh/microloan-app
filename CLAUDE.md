# Microloan apps (Fortuna Biznes, Vodiy Taraqqiyot)

One React + Vite + Tailwind v4 codebase, two branded apps. `VITE_BRAND` picks the brand
(`npm run dev:fortuna` on :5175, `npm run dev:vodiy` on :5176); Fortuna is the default.

- Brand data (name, kind, products, support phone) lives in `src/shared/config/brand.ts`; brand
  colours live in `src/shared/styles/index.css` (Fortuna in `@theme`, others under
  `[data-brand='…']`). Components use role tokens only: `primary`, `brand`, `accent-*`,
  `neutral-*`, `canvas`, `page`, `surface`, `line`, `ink*`. Never a brand's hex value in a component.
- Every text is in Uzbek and Russian (`src/shared/i18n/dictionaries.ts`).
- No browser-default controls: dropdowns, calendars, checkboxes are our own components.
- Light theme: grey `page`, white `canvas` cards with a `line` border. Dark theme: black page,
  `#1c1c1e` cards, neutral greys like iOS.
- Sample data only; APIs are mocks in `features/*/api`.
- Check each screen in headless Chrome, light and dark, before committing.
