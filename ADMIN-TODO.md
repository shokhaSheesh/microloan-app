# For the admin panel (after the microloan apps)

The user decided (2026-10-18) that every number the microloan apps use must be managed in the
Birzum admin panel, per brand (Fortuna Biznes, Vodiy Taraqqiyot). Today they are hard-coded
samples. Build these admin pages once the apps are done.

## Products (per brand) — built 2026-10-18 in the admin at /{brand}/products
Today the app still reads `src/shared/config/brand.ts`; switch to the API when it exists.
- Name, kind (UZ/RU), who it is for (UZ/RU), on/off, order
- Smallest and largest sum, sum step (now 1 000 000 / product max / 500 000)
- Terms offered (now 3, 6, 9, 12, 18, 24, 36 up to the product's longest)
- Yearly rate: built in the admin as a table — one rate, by term, by sum bands, or both — with
  the exact rate per case. The app's `rateFor` (lower up to 12 months, higher beyond) should be
  replaced by that table's `rateOf(product, amount, term)` once the API serves it.

## Decision rules (per brand) — built 2026-10-18 in the admin at /{brand}/decision
Today in `src/features/apply/api/mockApply.ts` — assumptions, not from the brand.
- Largest monthly payment as a share of income (now 50%)
- Counter-offer on/off, smallest sum worth offering (now 1 000 000)
- How long an offer stays valid (now 3 days)
- Scoring hand-off: same idea as Birzum's Tekshiruv rules (score lines, penalties)

## Contract and payments (per brand) — built 2026-10-18 in the admin at /{brand}/contract
- Payment day of the month (now the 5th) and how the first one is chosen
- Late-payment penalty (peni): not built — user removed the section from Shartnoma va toʻlov (2026-10-18)
- Early repayment rules: allowed after N days, partial minimum, fee if any
- Offer (oferta) PDF per language — like Hujjatlar
- Cards accepted (Uzcard, Humo)

## Content
- Intro slides — done in Tanishtiruv (Fortuna / Vodiy tabs)
- Support phone, FAQ, chat replies, contacts per brand (Yordam chati and Tayyor javoblar built in the admin per brand, 2026-10-18)
