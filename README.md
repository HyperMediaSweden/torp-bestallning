# Beställningsformulär Torp Köpcentrum

Digitalt beställningsformulär som ersätter den gamla PDF:en (skriv ut, fyll i, scanna).
Torp (Fredrik Wändel) kryssar i vad som ska tas fram, fyller i datum och skickar.

**Länk till kund:** https://hypermediasweden.github.io/torp-bestallning/

## Hur beställningarna kommer fram

1. Kunden fyller i formuläret och trycker **Skicka beställningen**.
2. Ett färdigifyllt mejl öppnas i kundens e-postprogram, adresserat till
   **emanda.andersson@stampen.com** med kopia till **frida.baldvinsdottir@stampen.com**.
   Ämne: `Beställning Torp: <kampanjnamn> – leverans <datum>`.
3. Kunden skickar mejlet. Hela beställningen ligger som text i mejlet och kan vidarebefordras
   rakt av till Anton (produktion). Samma text kopieras också till kundens urklipp,
   ifall e-postprogrammet inte öppnas.

Inget sparas på någon server. Formuläret sparar kundens pågående utkast i den egna webbläsaren
tills det skickats.

**Lägga till Anton som mottagare:** öppna `app.js`, lägg till adressen i `KONFIG.kopia` (eller `KONFIG.till`)
och publicera om (se nedan).

**Ta emot i ett system senare:** sätt `KONFIG.endpoint` i `app.js` till en URL som tar emot JSON (POST).
Formuläret skickar då beställningen dit också, e-posten är kvar som huvudväg.

## Hämta material (fliken)

Fliken "Hämta material" listar filer från `material.json`. Lägg filerna i `material/<kampanj>/`
och fyll i:

```json
{
  "uppdaterad": "2026-11-20",
  "kampanjer": [
    { "namn": "Julhandel 2026", "beskrivning": "Levererat 2026-11-13", "filer": [
      { "namn": "Webheader 1920×694", "fil": "material/julhandel-2026/webheader.jpg", "format": "JPG", "storlek": "1,1 MB", "datum": "2026-11-13" }
    ]}
  ]
}
```

Repot är publikt, så lägg inte Thon-material eller något känsligt där. Stora filer (film) hör
hemma på en delningslänk i stället, `fil` kan vara en full URL.

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
