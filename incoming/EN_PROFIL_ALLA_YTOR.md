# EN PROFIL, ALLA YTOR — runda 7

*Från Design, 8 augusti 2026. Svar på användaraudit 2026-08-08, fynd 4–5. Textversion av sektionen "Runda 7" (överst i `foreningsguiden-huvudprocessen.html`). Ändrar inte systemet.*

Mobil 390 px · WCAG AA.

---

## Problemet

Tre mekanismer besvarar "vad är ni för förening" utan att känna av varandra: tratten (sparar till profil), station 1:s kategoripills (sparar inget, men säger "Sparat till ert underlag" — osant), och den fullständiga listan (ogrupperad). Lösningen är inte att förbättra någon av dem, utan att göra dem till **en profil med tre vyer**.

**Fast förutsättning:** profilen bor i webbläsarens lokala lagring. Följer inte med mellan enheter, överlever inte en rensning. Inget nedan förutsätter annat. Kontobunden profil (H29) är ett bygge, inte en design — utanför denna runda.

Profilens tre fält: kommun, verksamhet, sökt förut. Inget mer finns att personalisera på.

---

## F3 — station 1 skriver till profilen (7a) · ta först

**Beslut: station 1 ÄR profilens verksamhetsfält, inte ett separat filter.** Väljer hon kategori här, sparas den, och tratten vet det sedan.

Det osanna "Sparat till ert underlag" ersätts av **"Sparat i den här webbläsaren. Nästa gång — här eller i tratten — minns vi det."** Sant på exakt det sätt localStorage fungerar; lovar aldrig ett kontos beständighet. Samma ärlighet som olast-tillståndet.

Kan gå oberoende av 7b/7c — raden är osann live i dag och står på egna ben.

---

## F1 + F5 — kommunsidan med och utan profil (7b)

**F1 (har profil, egen kommun):** tunn igenkänningsrad överst i accent-soft — "Ordnat för en idrottsförening. Sidan visar det som passar er först." Med **Ändra** och **Visa allt ändå**. Sidan ordnas i de två grupperna.

**F5 (ingen profil):** lika tunn inbjudan i sunken — "Säg vad ni är för förening, så ordnar vi sidan efter er. Tre frågor →". Default under den är **kommunens fulla register**, ogrupperat — inte en tom vy.

Bägge är en rad, aldrig en banner eller vägg. Igenkänningen sorterar, filtrerar inte — "Visa allt ändå" finns alltid.

---

## F2 — fel kommun (7c)

Profil för Gislaved, hon landar på Täby. **Verksamheten följer med** (kategori är kommonoberoende); **kommunen gör det inte**. Rad i accent-soft: "Ni är en idrottsförening — det tar vi med. Men er profil gäller Gislaved, och det här är Täby." Två klick: *Ordna Täby för oss* / *Till Gislaved i stället*.

Bara sökt-förut-fältet är kommunspecifikt och frågas om vid kommunbyte.

---

## F4 — listans grupper (7c)

**Beslut: listan bär de två grupperna när profil finns, kommunens ogrupperade register när den saknas.**

Med profil → "Passar er verksamhet · N" och "Kan gälla er ändå · N", samma två rubriker som överallt annars → produkten blir konsekvent. Utan profil → fullständig, ogrupperad lista, precis som i dag → listans värde som komplett kommunregister bevaras.

---

## Fasta förutsättningar (rita inte runt dem)

- **Sortera, aldrig filtrera.** Föreningstyp finns i 25 av 290 kommuner.
- **Grupperna heter "Passar er verksamhet" / "Kan gälla er ändå".** Aldrig match mot icke-match.
- **Profilen: tre fält.** Kommun, verksamhet, sökt förut.
- **localStorage.** Följer inte med mellan enheter, överlever inte rensning.
- **Markörsystemet, olast, oxblodsregeln** oförändrade.

---

## Vad Code behöver veta

1. **Station 1 och tratten skriver till samma profilobjekt** (foreningsprofil v2), fältet `verksamhet`. Station 1 är inte längre ett sidlokalt filter.
2. **Minnesraden får aldrig lova mer än localStorage ger.** "Sparat i den här webbläsaren", inte "till ert underlag".
3. **Igenkänningsraden sorterar, spärrar inte.** "Visa allt ändå" alltid närvarande.
4. **Kommunmatchning:** profil.kommun ≠ sidans kommun → F2-raden. Verksamheten behålls, sökt-förut frågas om.
5. **Listan:** grupperad vid profil, ogrupperad annars. Samma två rubriker som tratten och kommunsidan.
6. **Ingen profil = kommunens fulla register som default**, aldrig tom vy.

---

*Systemet oförändrat: Föreningsguidens eget tokensystem, "civil klarhet med skav", oxblod reserverad för granskningsstämpeln, urgens-modellen, markörsystemet, WCAG AA-golv, 16 px brödtext.*
