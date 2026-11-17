/* Ledtider för Torps beställningsformulär och formatspecen. ÄNDRA SIFFRORNA HÄR, på ett ställe.
   dagar   = arbetsdagar från komplett beställning (texter, bilder, godkänt budskap) till levererad fil.
   val     = egen ledtid för en rad, går före gruppens (t.ex. film). namn används i varningen.
   tillagg = det som tillkommer efter filen, visas i gruppen och på specsidan. Räknas inte in i datumet.
   text    = grupper utan fast ledtid (tidningen). De räknas inte in i tidigaste leverans.
   Lördag och söndag hoppas över. Svenska helgdagar räknas inte bort.
   Förslag 2026-11-17, inte bekräftade mot Nellies ledtidsdokument. */
'use strict';

const LEDTIDER = {
  'golvdekaler':    { namn: 'Golvdekaler', dagar: 5, tillagg: 'Räkna med ytterligare ca 5 arbetsdagar för tryck och montering hos Arkitektkopia.' },
  'affischer':      { namn: 'Öppettider-affischer', dagar: 3, tillagg: 'Plus trycktid hos Arkitektkopia.' },
  'skarmar':        { namn: 'Digitala skärmar', dagar: 7 },
  'kartskarmar':    { namn: 'Kartskärmar', dagar: 3 },
  'bussreklam':     { namn: 'Bussreklam', dagar: 5, tillagg: 'Plus tryck och montering hos bussbolaget, räkna med ca 10 arbetsdagar.' },
  'hemsidan':       { namn: 'Hemsidan', dagar: 3, val: { 'webheader-mp4': { namn: 'Film till hemsidan', dagar: 5 } } },
  'sociala-medier': { namn: 'Sociala medier', dagar: 3, val: { 'sociala-film': { namn: 'Film till sociala medier', dagar: 5 } } },
  'ovrigt':         { namn: 'Övrigt', dagar: 5, tillagg: 'Bekräftas när vi sett beställningen.' },
  // Kampanjkanaler (dolda i formuläret sedan 2026-11-10)
  'meta':           { namn: 'Facebook och Instagram', dagar: 7, kampanj: true },
  'tiktok':         { namn: 'TikTok', dagar: 7, kampanj: true },
  'snapchat':       { namn: 'Snapchat', dagar: 7, kampanj: true },
  'youtube':        { namn: 'YouTube', dagar: 7, kampanj: true },
  'html5':          { namn: 'Displayannonser', dagar: 7, kampanj: true },
  'html5-norge':    { namn: 'Displayannonser Norge', dagar: 7, kampanj: true },
  'adnami':         { namn: 'Annonser med stor yta', dagar: 5, kampanj: true },
  'tidning':        { namn: 'Tidningsannons', text: 'Materialdag enligt tidningens utgivningsplan', kampanj: true }
};

/* "ca 5 arbetsdagar" */
function ledtidDagarText(n) { return 'ca ' + n + (n === 1 ? ' arbetsdag' : ' arbetsdagar'); }

/* Kort text för gruppens rad, t.ex. "Ledtid ca 3 arbetsdagar, film ca 5". */
function ledtidKort(id) {
  const l = LEDTIDER[id];
  if (!l) return '';
  if (l.text) return l.text;
  let t = 'Ledtid ' + ledtidDagarText(l.dagar);
  const egna = Object.values(l.val || {});
  if (egna.length) t += ', ' + egna.map(v => (/film/i.test(v.namn) ? 'film' : v.namn.toLowerCase()) + ' ca ' + v.dagar).join(', ');
  return t;
}

/* Lägger till n arbetsdagar (mån–fre) till ett datum. */
function laggTillArbetsdagar(fran, n) {
  const d = new Date(fran.getFullYear(), fran.getMonth(), fran.getDate());
  while (n > 0) {
    d.setDate(d.getDate() + 1);
    const v = d.getDay();
    if (v !== 0 && v !== 6) n--;
  }
  return d;
}
function isoDatum(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
