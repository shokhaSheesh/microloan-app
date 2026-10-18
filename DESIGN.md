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

- Header: initials, "Salom, {name}", the brand name, and the bell (Bildirishnomalar).
- **With a running loan:** a dark card with the product and contract number, "Qolgan qarz"
  (principal left, large) and the total with interest under it, a progress bar "5 / 18 toʻlov",
  and the next payment with date and a red "Toʻlash". A red line above it when a payment is late.
  Then four quick actions (Jadval, Muddatidan oldin, Kartalar, Yordam) and "Yana qarz kerakmi?"
  with the products.
- **Without one:** a dark offer card with the largest sum and "Qarz olish", the products
  (name, kind, who it is for, and chips for the sum, yearly rate and longest term, from the
  brand's site), and "Qanday olinadi" in four numbered steps.
- Sample data: 90 123 45 67 has a running Tezkor loan and a closed Ishonch; anyone new has none.
  Payments are equal monthly sums (annuity) worked out in `entities/loans`.

## Qarz olish

1. **Calculator** (the tab bar's middle button, `/apply`, `?product=` preselects; a pushed screen
   with a back arrow and no tab bar): the three products as
   chips, the sum (field + slider, 1 mln to the product's max, step 500 000), the term as chips up
   to the product's longest. A dark card shows the monthly payment, yearly rate (the product's
   lower rate up to 12 months, its higher one beyond), interest and total, and opens the full
   schedule in a sheet. "Ariza berish" stays fixed at the bottom while the rest scrolls.
2. **Ariza** (`/apply/new`, full screen): the chosen terms with "Oʻzgartirish", purpose, monthly
   income, workplace, the card for the money picked from the linked cards ("Karta qoʻshish" links
   one in a sheet and picks it), consent to the credit check.
3. **Review**: "Ariza koʻrib chiqilmoqda", three checks tick off (MyID, credit history, income
   and debt load).
4. **Decision**: approved; or a counter-offer when the payment is over half the income (the
   largest sum that fits); or declined below 1 mln. "Taklif 3 kun amal qiladi".
5. **Shartnoma**: all terms, borrower, pay day (the 5th), first payment, card, the offer (PDF) and
   the schedule; tick "tanishdim", then **SMS-kod bilan imzolash**.
6. **Payout**: "Pul oʻtkazilmoqda" → "Kartangizga oʻtkazildi" with the sum, the card and the first
   payment. The new loan appears on Asosiy.

## Qarzlarim

- **List** (tab): "Faol · n" / "Yopilgan · n". A card per loan: product, number and sum issued,
  then what is left, a progress bar, and the next payment — or "dd.mm.yyyy da yopilgan" in green.
  No running loan: an empty state with "Qarz olish".
- **Loan page** (`/loans/:id`): the dark summary (left to pay, total with interest, progress, next
  payment with "Toʻlash"), "Muddatidan oldin toʻlash", then three tabs:
  - **Jadval**: every month with a round marker — tick when paid (sum struck through), red number
    for the next one, red text when overdue, grey "Muddatidan oldin yopilgan" for months a full
    early repayment cancelled.
  - **Tarix**: payments made, newest first, with the card.
  - **Shartnoma**: the terms and "Shartnomani yuklab olish (PDF)".
- **Early repayment** sheet: "Toʻliq yopish" (principal left plus this month's interest so far)
  or "Qisman" (from 100 000; shows how the monthly payment drops; the end date stays). Taken from
  the loan's card. Full closes the loan.

## Toʻlovlar

- **Toʻlash kerak**: each running loan's next payment (product, "dd.mm gacha", sum) with
  "Toʻlash"; red with an alert icon when overdue. A note says the sum is taken automatically on
  the day. "Toʻlash" on Asosiy and on a loan's page opens the same sheet (`/payments?pay=<id>`).
- **Pay sheet**: the sum, which payment of how many, the due date, and the card to pay from (the
  loan's own card first). The payment is dated the day it is made.
- **Toʻlovlar tarixi**: every payment on every loan, newest first, under month headings. A
  payment opens a sheet: sum, status, date and time (payments not made in the app were taken at
  09:00 on the due day), card, loan and contract number, and for a monthly one how much went to
  principal and to interest. **Fiskal chekni koʻrish** shows the cheque in the same sheet: the
  brand and its STIR, the line paid, cheque number, date, card, VAT, total, fiscal module and
  sign, and a QR and link to ofd.soliq.uz.

## Bildirishnomalar

- From the bell on Asosiy (`/notifications`); the bell's red dot shows only while something is
  unread. The gear at the top right opens the push and SMS settings.
- Chips: Hammasi · Toʻlovlar · Qarzlar · Yangiliklar. "Hammasini oʻqildi deb belgilash" while
  anything is unread.
- Newest first under Bugun / Kecha / date. Each row: a round icon by kind (reminder blue, overdue
  red, paid and issued green, closed grey, news amber), title (bold with a red dot when unread),
  time, and a line of detail. A tap marks it read and opens what it is about (the payment sheet,
  the loan, Toʻlovlar, the calculator for an offer).
- Kinds: payment day coming, payment late, payment received (also added after paying in the app),
  loan issued, loan closed, news and offers. Sample ones are made from the borrower's loans.

## Profil

- A card with initials, full name and phone; it opens Shaxsiy maʼlumotlar: the MyID data (read
  only) and, under "Aloqa", the phone with "Oʻzgartirish": the new number (not the current one, not
  one another account uses), then the SMS code sent to it. Loans and cards are kept by passport,
  so they stay with the new number.
- **Hisob**: Kartalarim (dark tiles; a card a running
  loan uses shows "Qarzga ulangan" and cannot be removed; "Karta qoʻshish": number and expiry,
  then the SMS code sent to the phone the card is tied to; the card is saved once the code fits,
  `000000` is the wrong code in the mock).
- **Sozlamalar**: Xavfsizlik (change PIN: current, new, again; Face ID or fingerprint, one at a
  time, confirmed by the phone), Til. No theme setting (user decision). The notification settings
  open from the gear in Bildirishnomalar.
- **Yordam**: Savol-javoblar (accordion, then a link to the chat), Yordam chati (operator, quick
  topics, input, and photos: up to five at a time, shown as thumbnails before sending, opened full
  screen on tap; sample replies), Kontaktlar (the brand's phones, email, Telegram, Instagram, site,
  head office and hours, and its branches by region — Fortuna's from fortunabiznes.uz).
- **Hujjatlar**: offer and privacy policy. "Chiqish" asks first. The version below.
