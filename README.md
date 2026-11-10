# Beställningsformulär Torp Köpcentrum

Digitalt beställningsformulär för material som Torp beställer själva utanför kampanjproduktionen,
till exempel golvdekaler, öppettider-affischer och material till skärmarna. Det ersätter den gamla
PDF:en (skriv ut, fyll i, scanna). Beställare hos Torp är Fredrik Wändel och Anki, som också hämtar
färdigt material under fliken Hämta material.

Stampen producerar filerna. Torp beställer trycket själva, utan faktura via Stampen. Därför står
"Tryck beställs av er hos:" på Golvdekaler och Öppettider-affischer, och "Filen lämnas av er till:" på
Digitala skärmar, Kartskärmar och Bussreklam. Etiketterna ligger i `leverantorEtikett` i `GRUPPER`. Datafältet
`leverantor` till beställningssystemet är oförändrat.

Kampanjkanalerna (sociala medier, display, Adnami och tidning) är dolda sedan 2026-11-10 på Fridas
begäran. Grupperna med `kampanj: true` finns kvar i `ALLA_GRUPPER` i `app.js`, och blocket kommer
tillbaka med `KONFIG.visaKampanjkanaler: true`.

Boosta inlägg på Meta (`meta-boost`) är en egen rad bland det övriga materialet. Sådana beställningar
ska till performance@stampen.com. I beställningssystemet styrs det av grupp-id, i reservmejlet av
`KONFIG.boostTill`, som i testläge pekar på Frida.

Varje materialgrupp är en ihopfällbar rad med gruppens namn till vänster och antal valda till höger.
Raderna är stängda från början. En grupp med något ikryssat, eller Övrigt med text, öppnas av sig själv
och stängs aldrig automatiskt. Trycker kunden Skicka utan att ha valt något öppnas första gruppen.

**Länk till kund:** https://torp.k2.nu/

Sajten körs i Coolify (app `torp-bestallning`, Static från detta repo, branch `main`). GitHub Pages på
https://hypermediasweden.github.io/torp-bestallning/ finns kvar tills Frida stänger det. En GitHub-webhook i repot
(Settings → Webhooks) driftsätter automatiskt i Coolify vid push till `main`; går den sönder: tryck Redeploy i Coolify.

**Bokning av filmtid till julkalendern:** https://torp.k2.nu/julkalender/ (mappen `julkalender/`, deployas med resten av repot).
Butikerna bokar en filmtid 18–20 november. Vilka tider som finns styrs helt av beställningssystemet
(`/api/filmbokning`), sidan har inga tider inskrivna. Lokalt pratar sidan med en mock på port 8777. Instruktion till Emanda: `INSTRUKTION.md`.

**Formatspec:** https://torp.k2.nu/spec/ (`spec/index.html` och `spec/spec.css`, med `stil.css` som grund). Innehållet kommer från
`../guider/formatspec-torp.k2.nu.html`. Sidan nås via fliken Specs, knappen ovanför materialgrupperna och sidfoten. Ändras formaten: uppdatera båda HTML-filerna.

## Hur beställningarna kommer fram

1. Kunden fyller i formuläret och trycker **Skicka beställningen**.
2. Beställningen skickas som JSON till Stampens beställningssystem (`KONFIG.endpoint` i `app.js`,
   repo `HyperMediaSweden/stampen-bestallningar`, Payload CMS på Coolify). Där sparas den med status,
   och ett mejl går till kundens aviseringsmottagare (annonsproduktion@stampen.com, Frida) med hela texten och
   en länk till beställningen i admin. Kunden ser "Beställningen är mottagen" med beställningsnummer.
3. **Reservväg:** går systemet inte att nå öppnas i stället ett färdigifyllt mejl i kundens
   e-postprogram, adresserat till **annonsproduktion@stampen.com** med kopia till
   **frida.baldvinsdottir@stampen.com** (`KONFIG.till`/`KONFIG.kopia`). Texten kopieras också till urklipp.

Är `KONFIG.endpoint` tom används bara mejlvägen. Instruktion till produktionen: `INSTRUKTION.md`.

## Hämta material (fliken)

Fliken "Hämta material" kräver en hämtkod, som sätts per kund i admin under Kunder. Koden skickas med POST och sparas bara på besökarens enhet, och fillänkarna gäller en timme. Fliken läser listan från beställningssystemet (`KONFIG.materialUrl`, endpointen
`/api/material-lista/torp-kopcentrum`): filer som Stampen laddat upp under **Material** i admin och
markerat som synliga för kunden, grupperade per kampanj. Filerna ligger i systemet, inte i det här
(publika) repot.

Är `KONFIG.materialUrl` tom används `material.json` i repot i stället (samma format: `kampanjer[]`
med `filer[]` som har `namn`, `fil`, `format`, `storlek`, `datum`). Lägg aldrig Thon-material eller
något känsligt i repot, det är publikt.

## Publicera ändringar

**Viktigt:** När `app.js` eller `stil.css` ändras, räkna upp `?v=` på raderna som laddar dem i
`index.html` (t.ex. `?v=2026-11-07a` → `?v=2026-11-07b`). Servern skickar inga cache-regler, så
annars kan besökare få en gammal `app.js` ihop med en ny `index.html`.

Mappen är ett git-repo kopplat till `HyperMediaSweden/torp-bestallning` (GitHub Pages från `main`).

```bash
cd "kampanjer/torp-kopcentrum/bestallning" && git add -A && git commit -m "Uppdatering" && git push
```

Sidan uppdateras inom någon minut.

## Formaten i formuläret

Sociala kanaler, display, Adnami och tidning följer Stampens formatlista (datablocket `format` i
`../forhandsvisning/index.html`). Ändras Stampens utbud: uppdatera `GRUPPER` i `app.js`.

| Grupp | Format |
|---|---|
| Facebook och Instagram | Flöde 4:5 1080×1350 (bild, film), flöde 1:1 1080×1080 (bild, film), Stories 9:16 och Reels 9:16 1080×1920, omslagsbild Facebook 1920×694. Film max 10 s |
| TikTok | Film 9:16 1080×1920, max 10 s |
| Snapchat | Film 9:16 1080×1920, max 10 s |
| YouTube | Film 16:9 1920×1080 och Shorts 9:16 1080×1920, max 10 s |
| Displayannonser | Panorama 980×240, Panorama Mega 980×600, Modul 640×320, Insider 300×250, Outsider 250×600, Mobil Panorama 320×320, Mobil Mega 320×480 |
| Annonser med stor yta (Adnami) | Take-over mobil 320×480 och 1080×1920, take-over desktop 1920×1080, top-scroll mobil 1080×1920, top-scroll desktop 2560×1440 |
| Tidningsannons | Modul 23 80×133 mm, Modul 34 122×170 mm, helsida 248×372 mm |
| Bussreklam | Streetliner Filler 3050×650 och 1700×745 mm, Hop On Filler 1375×680 och 1395×495 mm, Backside Filler 1395×495 mm. Fanns inte i PDF:en. Mottagare saknas tills vidare, kunden skriver den i noteringen. Mallar med utfall och synlig yta finns hos annonsproduktion |

## Avvikelser mot den gamla PDF:en

| I PDF:en | I formuläret nu |
|---|---|
| HTML5 320×400, 980×300, 300×600, 640×360 (Sverige) | Borttagna, finns inte i Stampens utbud |
| HTML5 Norge, alla storlekar | Kvar som egen grupp; 320×400, 580×400, 980×300 och 300×600 märkta "ej Stampen-standard" |
| Leverantör Delta via FRC Media för HTML5 | Borttagen |
| Facebook och Instagram som separata grupper, film 12 s, 1080×1080 | En Meta-grupp med Stampens flödes-, Stories- och Reels-format, film max 10 s |
| Digitala skärmar 1080×1920, 5/10 s, max 12 s | Oförändrat (Ocean Outdoors spec) |
| Kartskärmar 1920×1080 | Oförändrat, mottagare saknas i PDF:en och kunden skriver den i noteringen |
| Affischer och golvdekaler | Oförändrat (Arkitektkopias spec) |

Hemsidans mått (1920×694, 1500×1000) kommer från Torps egen webb och går inte att kontrollera
mot Stampens listor.
