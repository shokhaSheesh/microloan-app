# Design

## Brands

|                        | Fortuna Biznes                                    | Vodiy Taraqqiyot |
| ---------------------- | ------------------------------------------------- | ---------------- |
| Actions (`primary`)    | red `#ED1B24` (site's buttons)                    | to do            |
| Accent (`accent-500`)  | blue `#00A3E8` (site's headings, the mark's bars) | to do            |
| Links, icons (`brand`) | deeper blue `#0081BD`, readable on white          | to do            |
| Ink, dark tiles        | `#18191D`                                         | to do            |
| Font                   | Rubik (the site's)                                | to do            |

Fortuna's mark (three blue bars and a red "B") is drawn in `BrandMark.tsx`; its products and
limits on the welcome card come from fortunabiznes.uz: Rivoj up to 50 mln, Tezkor up to
40 mln, Ishonch up to 20 mln.

## Sign-in

One entry, no separate sign-up: the phone number decides.

- **Welcome** (first open): logo and language, a dark card with the brand's products and their
  largest sums, the headline "50 000 000 soʻmgacha mikroqarz", three plain promises, "Boshlash".
- **Phone** (step 1 of 4): number, consent to the offer and privacy policy, "Kod olish".
- **SMS code** (2/4). A registered number (sample: 90 123 45 67) goes straight to the PIN.
- **Passport and birth date** (3/4): series and number, date from our calendar, 18+ only.
- **MyID** (4/4): front camera with an oval, three tips, "Rasmga olish" → "MyID tekshirmoqda"
  → "Bu sizmi?" with the name, birth date, document and address from MyID. "Yoʻq, bu men emas"
  explains what to do.
- **PIN**: four digits, then the same again; a mismatch starts over.
- **Tezkor kirish**: Face ID or fingerprint as two cards, or "Keyinroq".
- **Hisobingiz tayyor** with the full name, then home.
- **Lock** on later opens: the mark, "Salom, {name}", the PIN pad with the Face ID or fingerprint
  key; the chosen one starts by itself. "PIN-kodni unutdim" and five wrong tries sign out and
  start again from the phone.

## Intro slides

After "Hisobingiz tayyor", once per phone: full-screen slides swiped sideways, with dots, "Oʻtkazib
yuborish" and "Keyingisi" / "Boshladik". Each slide is data from the admin panel
(`entities/onboarding/slides.ts`): an uploaded image, or the drawn art in the brand's colours
(`SlideArt`), plus a title and a line in both languages. Four by default: calculator, online
decision, money to the card, repayments.

## Tab bar

Asosiy (house) · Qarzlarim (document) · **Qarz olish** (a plus on the raised red middle button) ·
Toʻlovlar (card) · Profil. The
glass bar floats over the screen; the active tab is a red tint with red text.

## Asosiy

- Header: initials, "Salom, {name}", the brand name, and a bell with a red dot.
- **With a running loan:** a dark card with the product and contract number, "Qolgan qarz"
  (principal left, large) and the total with interest under it, a progress bar "5 / 18 toʻlov",
  and the next payment with date and a red "Toʻlash". A red line above it when a payment is late.
  Then four quick actions (Jadval, Muddatidan oldin, Kartalar, Yordam) and "Yana qarz kerakmi?"
  with the products.
- **Without one:** a dark offer card with the largest sum and "Qarz olish", the products
  (name, kind, who it is for, and chips for the sum, yearly rate and longest term, from the
  brand's site), and "Qanday olinadi" in four numbered steps.
- Support at the bottom: the brand's phone and "Yozish".
- Sample data: 90 123 45 67 has a running Tezkor loan and a closed Ishonch; anyone new has none.
  Payments are equal monthly sums (annuity) worked out in `entities/loans`.

## Qarz olish

1. **Calculator** (on the tab bar, `/apply`, `?product=` preselects): the three products as
   chips, the sum (field + slider, 1 mln to the product's max, step 500 000), the term as chips up
   to the product's longest. A dark card shows the monthly payment, yearly rate (the product's
   lower rate up to 12 months, its higher one beyond), interest and total, and opens the full
   schedule in a sheet. "Ariza berish".
2. **Ariza** (`/apply/new`, full screen): the chosen terms with "Oʻzgartirish", purpose, monthly
   income, workplace, the card for the money (a saved one or a new one), consent to the credit
   check.
3. **Review**: "Ariza koʻrib chiqilmoqda", three checks tick off (MyID, credit history, income
   and debt load).
4. **Decision**: approved; or a counter-offer when the payment is over half the income (the
   largest sum that fits); or declined below 1 mln. "Taklif 3 kun amal qiladi".
5. **Shartnoma**: all terms, borrower, pay day (the 5th), first payment, card, the offer (PDF) and
   the schedule; tick "tanishdim", then **SMS-kod bilan imzolash**.
6. **Payout**: "Pul oʻtkazilmoqda" → "Kartangizga oʻtkazildi" with the sum, the card and the first
   payment. The new loan appears on Asosiy.
