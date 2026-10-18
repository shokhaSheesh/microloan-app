# For the admin panel (after the microloan apps)

The user decided (2026-10-18) that every number the microloan apps use must be managed in the
Birzum admin panel, per brand (Fortuna Biznes, Vodiy Taraqqiyot). Today they are hard-coded
samples. Build these admin pages once the apps are done.

## Products (per brand)
Today in `src/shared/config/brand.ts` (taken from fortunabiznes.uz).
- Name, kind (UZ/RU), who it is for (UZ/RU), on/off, order
- Smallest and largest sum, sum step (now 1 000 000 / product max / 500 000)
- Terms offered (now 3, 6, 9, 12, 18, 24, 36 up to the product's longest)
- Yearly rate per term band (now: lower rate up to 12 months, higher beyond — an assumption;
  the site gives only ranges like 49–54%)

## Decision rules (per brand)
Today in `src/features/apply/api/mockApply.ts` — assumptions, not from the brand.
- Largest monthly payment as a share of income (now 50%)
- Counter-offer on/off, smallest sum worth offering (now 1 000 000)
- How long an offer stays valid (now 3 days)
- Scoring hand-off: same idea as Birzum's Tekshiruv rules (score lines, penalties)

## Contract and payments (per brand)
- Payment day of the month (now the 5th) and how the first one is chosen
- Late-payment penalty (peni) for microloans, if the client wants it
- Early repayment rules: allowed after N days, partial minimum, fee if any
- Offer (oferta) PDF per language — like Hujjatlar
- Cards accepted (Uzcard, Humo)

## Content
- Intro slides — done in Tanishtiruv (Fortuna / Vodiy tabs)
- Support phone, FAQ, chat replies, contacts per brand
