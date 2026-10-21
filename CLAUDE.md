# Microloan apps (Fortuna Biznes, Vodiy Taraqqiyot)

One React + Vite + Tailwind v4 codebase, two branded apps. The URL picks the brand:
http://localhost:5175/fortuna/... or /vodiy/... (router `basename`); a bare `/` goes to the brand
last used, else `VITE_BRAND` (`npm run dev:fortuna` on :5175, `npm run dev:vodiy` on :5176).

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
- Asosiy (client's notes): an ariza still in play shows first (being checked, or "Taklif tayyor: imzolang"); then the loan card or the offer; four quick actions in both cases, both with Kreditlar (`/credits`, every product): with a loan Jadval, Toʻlov, Kreditlar, Yordam; without one Kreditlar, Arizalarim, Kartalar, Yordam; then the banners (one per product for now, at most six, until the brand admin manages them); "Qanday olinadi" only before the first loan. Fortuna's `tile` is deep blue, not black (client); on it "Toʻlash" is a white button with the action colour as text.
- Arizalar (`entities/applications`): every ariza and its status, as in the admin (review, approved, counter, signed, paidOut, declined, expired). The application flow records each step. Qarzlarim has three tabs, Faol, Arizalar, Yopilgan (`?tab=applications`); an offer there has "Imzolash", which reopens the application at the decision (`/apply/new?ariza=<id>`). Each card has one line on what happens next (result in minutes, offer valid until, money on its way, offer ended); a declined one shows the reason (payment too big for the income, late payments in the history, no history, age) and the day a new ariza is accepted. The samples hold one ariza in every status.
- Ariza form: no purpose (client); income, work, the card, and at least two contacts from Kontaktlarim (Profil → Hisob; add one right in the form). The brand's phones and branches are Profil → Yordam → "Biz bilan aloqa". An offer can be turned down ("Rad etish" on the decision screen and on its Arizalar card): a sheet of reason templates, "Boshqa sabab" asks for text; the ariza becomes `refused` and the admin sees the reason.
