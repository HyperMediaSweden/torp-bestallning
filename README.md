# Beställningsformulär Torp Köpcentrum

Digitalt beställningsformulär som ersätter den gamla PDF:en (skriv ut, fyll i, scanna).
Torp (Fredrik Wändel) kryssar i vad som ska tas fram, fyller i datum och skickar.

**Länk till kund:** https://hypermediasweden.github.io/torp-bestallning/

## Hur beställningarna kommer fram

1. Kunden fyller i formuläret och trycker **Skicka beställningen**.
2. Beställningen skickas som JSON till Stampens beställningssystem (`KONFIG.endpoint` i `app.js`,
   repo `HyperMediaSweden/stampen-bestallningar`, Payload CMS på Coolify). Där sparas den med status,
   och ett mejl går till kundens aviseringsmottagare (annonsproduktion@stampen.com, Frida) med hela texten och
   en länk till beställningen i admin. Kunden ser "Beställningen är mottagen" med beställningsnummer.
3. **Reservväg:** går systemet inte att nå öppnas i stället ett färdigifyllt mejl i kundens
   e-postprogram, adresserat till **annonsproduktion@stampen.com** med kopia till
   **annonsproduktion@stampen.com** och **frida.baldvinsdottir@stampen.com** (`KONFIG.till`/`KONFIG.kopia`). Texten kopieras också till urklipp.

Är `KONFIG.endpoint` tom används bara mejlvägen. Instruktion till produktionen: `INSTRUKTION.md`.

## Hämta material (fliken)

Fliken "Hämta material" läser listan från beställningssystemet (`KONFIG.materialUrl`, endpointen
`/api/material-lista/torp-kopcentrum`): filer som Stampen laddat upp under **Material** i admin och
markerat som synliga för kunden, grupperade per kampanj. Filerna ligger i systemet, inte i det här
(publika) repot.

Är `KONFIG.materialUrl` tom används `material.json` i repot i stället (samma format: `kampanjer[]`
med `filer[]` som har `namn`, `fil`, `format`, `storlek`, `datum`). Lägg aldrig Thon-material eller
något känsligt i repot, det är publikt.

## Publicera ändringar

Mappen är ett git-repo kopplat till `HyperMediaSweden/torp-bestallning` (GitHub Pages från `main`).

```bash
cd "kampanjer/torp-kopcentrum/bestallning" && git add -A && git commit -m "Uppdatering" && git push
```

Sidan uppdateras inom någon minut.

## Formatavvikelser mot den gamla PDF:en

Jämfört med Stampens aktuella displayformat (datablocket i `../forhandsvisning/index.html`):

| I PDF:en | Hos Stampen | I formuläret |
|---|---|---|
| HTML5 320×320 | Mobil Panorama | Finns, med Stampens namn |
| HTML5 320×480 | Mobil Mega | Finns |
| HTML5 300×250 | Insider | Finns |
| HTML5 250×600 | Outsider | Finns |
| HTML5 980×240 | Panorama | Finns |
| HTML5 980×600 | Panorama Mega | Finns |
| HTML5 320×400 | Finns inte | Kvar, märkt "ej Stampen-standard" |
| HTML5 980×300 | Finns inte | Kvar, märkt "ej Stampen-standard" |
| HTML5 300×600 | Finns inte (Stampen har 250×600 Outsider) | Kvar, märkt "ej Stampen-standard" |
| HTML5 640×360 | Finns inte (Stampen har 640×320 Modul) | Kvar, märkt "ej Stampen-standard" |
| Norge 580×400 | Finns inte | Kvar, märkt "ej Stampen-standard" |
| (saknas i PDF:en) 640×320 Modul | Finns | Tillagd under HTML5-annonser |
| Facebook/Instagram film 12 s | Stampens Meta-filmer är max 10 s | Formuläret säger max 10 s |
| Facebook/Instagram film 1080×1080 | Stampen bygger 4:5 (1080×1350) som flödesformat, 1:1 som stillbild | 1080×1080 kvar, 4:5 nämns som alternativ |
| Instagram Stories 1080×1920 | Finns (Meta Stories/Reels 9:16, max 10 s) | Finns |
| Digitala skärmar 1080×1920, 5/10 s, max 12 s | 1080×1920 finns; Stampens filmer är max 10 s | Oförändrat (Ocean Outdoors spec) |
| Kartskärmar 1920×1080 | Finns (16:9) | Oförändrat, leverantör saknas i PDF:en |
| Affischer och golvdekaler | Tryck, inte display | Oförändrat (Arkitektkopias spec) |

Hemsidans mått (1920×694, 1500×1000) kommer från Torps egen webb och går inte att kontrollera
mot Stampens listor. Stampens sociala format TikTok, Snapchat, YouTube och Adnami take-over
finns inte i formuläret eftersom de ingår i Stampens mediaplan, inte i kundens egna kanaler.
De kan läggas till som en grupp i `GRUPPER` i `app.js` om Torp vill beställa dem separat.
