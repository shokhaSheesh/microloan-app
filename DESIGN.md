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
