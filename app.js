/* Beställningsformulär Torp Köpcentrum – logik.
   Beställningen sammanställs som text och skickas som ett färdigifyllt mejl (mailto) till Stampen.
   Vill man senare ta emot beställningarna i ett system: sätt KONFIG.endpoint till en URL som tar emot JSON (POST). */
'use strict';

const KONFIG = {
  kund: 'Torp Köpcentrum',
  till: ['emanda.andersson@stampen.com'],              // säljare
  kopia: ['frida.baldvinsdottir@stampen.com'],         // Lägg till Anton (produktion) här när adressen är känd.
  endpoint: '',                                        // Tom = bara e-post. Annars POST:as beställningen som JSON hit.
  amnesprefix: 'Beställning Torp',
  sidlank: 'hypermediasweden.github.io/torp-bestallning'
};

/* Fälttyper som kan dyka upp under en grupp när något i gruppen är ikryssat. */
const FALT = {
  kampanjstart: { typ: 'date', etikett: 'Kampanjstart', hjalp: 'Om annan än kampanjens startdatum' },
  kampanjslut:  { typ: 'date', etikett: 'Kampanjslut' },
  uppsattning:  { typ: 'date', etikett: 'Uppsättningsdatum' },
  montering:    { typ: 'date', etikett: 'Monteringsdatum' },
  matt:         { typ: 'text', etikett: 'Mått', platshallare: 't.ex. 2×3 m' },
  notering:     { typ: 'text', etikett: 'Notering', bred: true, platshallare: 'Budskap, bild, annat som gäller just detta' }
};

/* Stampens aktuella displayformat (från stampen-annons/förhandsvisningen). Storlekar i den gamla
   PDF:en som saknas här märks "ej Stampen-standard" i stället för att tas bort. */
const STAMPEN_DISPLAY = {
  '980×240': 'Panorama', '980×600': 'Panorama Mega', '640×320': 'Modul', '300×250': 'Insider',
  '250×600': 'Outsider', '320×320': 'Mobil Panorama', '320×480': 'Mobil Mega'
};
function html5(prefix, storlek) {
  const namn = STAMPEN_DISPLAY[storlek];
  const id = prefix + '-' + storlek.replace('×', 'x');
  return namn
    ? { id: id, namn: namn, matt: storlek + ' px' }
    : { id: id, namn: storlek + ' px', matt: '', tagg: 'ej Stampen-standard', ejStandard: true };
}

const GRUPPER = [
  { id: 'hemsidan', namn: 'Hemsidan', falt: ['kampanjstart', 'notering'], val: [
    { id: 'webheader-jpg', namn: 'Webheader, bild (.jpg)', matt: '1920×694 px' },
    { id: 'webheader-mp4', namn: 'Webheader, film (.mp4)', matt: '1920×694 px', info: 'Max 50 MB' },
    { id: 'kampanjplugg', namn: 'Kampanjplugg (.jpg)', matt: '1500×1000 px' }
  ]},
  { id: 'facebook', namn: 'Facebook', falt: ['kampanjstart', 'notering'], val: [
    { id: 'fb-header', namn: 'Omslagsbild (.jpg)', matt: '1920×694 px' },
    { id: 'fb-film', namn: 'Film i flödet (.mp4)', matt: '1080×1080 px', info: 'Stampen gör filmer på max 10 s. Vill ni ha 4:5 (1080×1350) i stället, skriv det i noteringen.' },
    { id: 'fb-story', namn: 'Story', matt: '1080×1920 px' }
  ]},
  { id: 'instagram', namn: 'Instagram', falt: ['kampanjstart', 'notering'], val: [
    { id: 'ig-square', namn: 'Inlägg, bild', matt: '1080×1080 px' },
    { id: 'ig-film', namn: 'Film i flödet (.mp4)', matt: '1080×1080 px', info: 'Max 10 s. 4:5 (1080×1350) går också bra, skriv det i noteringen.' },
    { id: 'ig-stories', namn: 'Stories / Reels', matt: '1080×1920 px' }
  ]},
  { id: 'skarmar', namn: 'Digitala skärmar', info: 'Film 5 eller 10 s, max 12 s', falt: ['kampanjstart', 'kampanjslut', 'notering'],
    leverantor: 'Ocean Outdoor, ocean-delivery@oceanoutdoor.se', val: [
    { id: 'skarm-1080x1920', namn: 'Stående skärm', matt: '1080×1920 px' }
  ]},
  { id: 'kartskarmar', namn: 'Kartskärmar', falt: ['kampanjstart', 'kampanjslut', 'notering'],
    leverantor: 'Ej angiven i den gamla blanketten – skriv i noteringen vem som ska ha filen', val: [
    { id: 'kartskarm-1920x1080', namn: 'Liggande skärm', matt: '1920×1080 px' }
  ]},
  { id: 'html5', namn: 'HTML5-annonser', info: 'Max 30 s', alla: 'Alla Stampens format', kompakt: true, falt: ['kampanjstart', 'notering'],
    leverantor: 'Delta via FRC Media, Martin Söder', val: [
    html5('se', '980×240'), html5('se', '980×600'), html5('se', '640×320'), html5('se', '300×250'), html5('se', '250×600'), html5('se', '320×320'), html5('se', '320×480'),
    html5('se', '320×400'), html5('se', '980×300'), html5('se', '300×600'), html5('se', '640×360')
  ]},
  { id: 'html5-norge', namn: 'HTML5-annonser Norge', info: 'Max 30 s', alla: 'Alla storlekar', allaInklEjStandard: true, kompakt: true, falt: ['kampanjstart', 'notering'],
    leverantor: 'Delta via FRC Media, Martin Söder', val: [
    html5('no', '320×480'), html5('no', '320×400'), html5('no', '300×250'), html5('no', '320×320'), html5('no', '980×600'), html5('no', '580×400'), html5('no', '980×300'), html5('no', '300×600')
  ]},
  { id: 'affischer', namn: 'Öppettider-affischer', falt: ['uppsattning', 'notering'],
    leverantor: 'Arkitektkopia, henrik.fagerberg@arkitektkopia.se', val: [
    { id: 'affisch-700x1000', namn: 'Affisch', matt: '700×1000 mm' },
    { id: 'affisch-eurosize', namn: 'Eurosize', matt: '1185×1750 mm', info: 'Synlig yta 1155×1710 mm, upplösning 120 dpi' }
  ]},
  { id: 'golvdekaler', namn: 'Golvdekaler', falt: ['matt', 'montering', 'notering'],
    leverantor: 'Arkitektkopia, henrik.fagerberg@arkitektkopia.se', val: [
    { id: 'golvdekal', namn: 'Golvdekal', matt: 'ca 2×3 m', info: 'Ange exakt mått i fältet nedan' }
  ]},
  { id: 'ovrigt', namn: 'Övrigt', fritext: true, platshallare: 'Annat som ska tas fram, t.ex. tryck, skyltar eller annonser i andra kanaler. Skriv mått och var det ska användas.' }
];

const $ = (id) => document.getElementById(id);
const UTKAST_NYCKEL = 'torp-bestallning-utkast';

/* ---------- Bygg materialgrupperna ---------- */
function byggGrupper() {
  const rot = $('grupper');
  for (const g of GRUPPER) {
    const sek = document.createElement('section');
    sek.className = 'grupp' + (g.fritext ? ' grupp-ovrigt' : '');
    sek.id = 'grupp-' + g.id;
    sek.dataset.grupp = g.id;

    const huvud = document.createElement('div');
    huvud.className = 'grupp-huvud';
    huvud.innerHTML = '<h3></h3>' + (g.info ? '<small></small>' : '');
    huvud.querySelector('h3').textContent = g.namn;
    if (g.info) huvud.querySelector('small').textContent = g.info;
    sek.appendChild(huvud);

    if (g.fritext) {
      const f = document.createElement('div');
      f.className = 'falt';
      f.innerHTML = '<label for="ovrigt-text">Beskriv vad ni vill ha</label><textarea id="ovrigt-text" rows="4"></textarea>';
      f.querySelector('textarea').placeholder = g.platshallare || '';
      sek.appendChild(f);
      rot.appendChild(sek);
      continue;
    }

    const lista = document.createElement('div');
    lista.className = 'val-lista';
    if (g.alla) {
      lista.appendChild(valRad({ id: g.id + '-alla', namn: g.alla + ' →' }, g, true));
    }
    for (const v of g.val) lista.appendChild(valRad(v, g, false));
    sek.appendChild(lista);

    const falt = document.createElement('div');
    falt.className = 'grupp-falt';
    falt.hidden = true;
    for (const fid of g.falt) {
      const def = FALT[fid];
      const w = document.createElement('div');
      w.className = 'falt' + (def.bred ? ' falt-bred' : '');
      const inputId = g.id + '-' + fid;
      const label = document.createElement('label');
      label.htmlFor = inputId;
      label.textContent = def.etikett;
      const input = document.createElement('input');
      input.type = def.typ;
      input.id = inputId;
      input.dataset.falt = fid;
      if (def.platshallare) input.placeholder = def.platshallare;
      w.appendChild(label);
      w.appendChild(input);
      if (def.hjalp) { const h = document.createElement('p'); h.className = 'hjalp'; h.textContent = def.hjalp; w.appendChild(h); }
      falt.appendChild(w);
    }
    sek.appendChild(falt);

    if (g.leverantor) {
      const l = document.createElement('p');
      l.className = 'leverantor';
      l.innerHTML = '<b>Leverantör:</b> ';
      l.appendChild(document.createTextNode(g.leverantor));
      sek.appendChild(l);
    }
    rot.appendChild(sek);
  }
}

function valRad(v, g, arAlla) {
  const label = document.createElement('label');
  label.className = 'val-rad' + (arAlla ? ' val-alla' : '');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = 'val-' + v.id;
  input.dataset.grupp = g.id;
  if (arAlla) input.dataset.alla = '1'; else input.dataset.val = v.id;
  const text = document.createElement('span');
  text.className = 'val-text';
  const namn = document.createElement('span'); namn.className = 'val-namn'; namn.textContent = v.namn; text.appendChild(namn);
  if (v.matt) { const m = document.createElement('span'); m.className = 'val-matt'; m.textContent = v.matt; text.appendChild(m); }
  if (v.tagg) { const t = document.createElement('span'); t.className = 'tagg'; t.textContent = v.tagg; text.appendChild(t); }
  if (v.info) { const i = document.createElement('span'); i.className = 'val-info'; i.textContent = v.info; text.appendChild(i); }
  label.appendChild(input);
  label.appendChild(text);
  return label;
}

/* ---------- Läs av formuläret ---------- */
function lasFormular() {
  const d = {
    kampanjnamn: $('kampanjnamn').value.trim(),
    startdatum: $('startdatum').value,
    slutdatum: $('slutdatum').value,
    leveransdatum: $('leveransdatum').value,
    notering: $('notering').value.trim(),
    bestallare: { namn: $('bestallare-namn').value.trim(), epost: $('bestallare-epost').value.trim(), telefon: $('bestallare-telefon').value.trim() },
    grupper: []
  };
  for (const g of GRUPPER) {
    if (g.fritext) {
      const t = $('ovrigt-text').value.trim();
      if (t) d.grupper.push({ id: g.id, namn: g.namn, fritext: t });
      continue;
    }
    const valda = g.val.filter(v => $('val-' + v.id).checked);
    if (!valda.length) continue;
    const falt = {};
    for (const fid of g.falt) { const val = $(g.id + '-' + fid).value.trim(); if (val) falt[fid] = val; }
    d.grupper.push({ id: g.id, namn: g.namn, info: g.info || '', leverantor: g.leverantor || '', kompakt: !!g.kompakt, val: valda, falt });
  }
  return d;
}

function antalVal(d) {
  return d.grupper.reduce((n, g) => n + (g.val ? g.val.length : 1), 0);
}

/* ---------- Sammanställning som text ---------- */
function datum(s) {
  if (!s) return '';
  return s; // ÅÅÅÅ-MM-DD från date-fältet
}
function sammanstall(d) {
  const r = [];
  r.push('BESTÄLLNING AV MATERIAL – ' + KONFIG.kund.toUpperCase());
  r.push('Kampanj: ' + (d.kampanjnamn || '(ej ifyllt)'));
  if (d.startdatum || d.slutdatum) r.push('Kampanjperiod: ' + (datum(d.startdatum) || '?') + ' – ' + (datum(d.slutdatum) || '?'));
  r.push('LEVERERAS SENAST: ' + (datum(d.leveransdatum) || '(ej ifyllt)'));
  const b = [d.bestallare.namn, d.bestallare.epost, d.bestallare.telefon].filter(Boolean).join(' · ');
  r.push('Beställare: ' + (b || '(ej ifyllt)'));
  if (d.notering) r.push('Notering: ' + d.notering);

  for (const g of d.grupper) {
    r.push('');
    r.push(g.namn.toUpperCase() + (g.info ? ' (' + g.info.toLowerCase() + ')' : ''));
    if (g.fritext) { r.push(g.fritext); continue; }
    if (g.kompakt) {
      // Många storlekar på en rad, så mejlet blir kortare
      r.push('• ' + g.val.map(v => (v.matt ? v.namn + ' ' + v.matt.replace(' px', '') : v.namn.replace(' px', '')) + (v.tagg ? ' [' + v.tagg + ']' : '')).join(', '));
    } else {
      for (const v of g.val) {
        let rad = '• ' + v.namn + (v.matt ? ', ' + v.matt : '');
        if (v.tagg) rad += ' [' + v.tagg + ']';
        r.push(rad);
      }
    }
    for (const fid of Object.keys(g.falt)) r.push('  ' + FALT[fid].etikett + ': ' + g.falt[fid]);
    if (g.leverantor) r.push('  Leverantör: ' + g.leverantor);
  }

  const nu = new Date();
  const tid = nu.getFullYear() + '-' + String(nu.getMonth() + 1).padStart(2, '0') + '-' + String(nu.getDate()).padStart(2, '0') + ' ' + String(nu.getHours()).padStart(2, '0') + ':' + String(nu.getMinutes()).padStart(2, '0');
  r.push('');
  r.push('Skickad ' + tid + ' via beställningsformuläret (' + KONFIG.sidlank + ')');
  return r.join('\n');
}

function amne(d) {
  return KONFIG.amnesprefix + ': ' + (d.kampanjnamn || 'kampanj') + (d.leveransdatum ? ' – leverans ' + d.leveransdatum : '');
}

function mailtoLank(d, text) {
  const q = [];
  if (KONFIG.kopia.length) q.push('cc=' + encodeURIComponent(KONFIG.kopia.join(',')));
  q.push('subject=' + encodeURIComponent(amne(d)));
  q.push('body=' + encodeURIComponent(text).replace(/%0A/g, '%0D%0A'));
  return 'mailto:' + KONFIG.till.join(',') + '?' + q.join('&');
}

/* ---------- Validering ---------- */
function visaFel(id, visa) {
  const fel = $('fel-' + id);
  if (fel) fel.hidden = !visa;
  const falt = $(id) && $(id).closest('.falt');
  if (falt) falt.classList.toggle('ogiltig', visa);
}
function validera(d) {
  let ok = true;
  const epostOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.bestallare.epost);
  const kontroller = [
    ['kampanjnamn', !!d.kampanjnamn],
    ['leveransdatum', !!d.leveransdatum],
    ['bestallare-namn', !!d.bestallare.namn],
    ['bestallare-epost', epostOk],
    ['slutdatum', !(d.startdatum && d.slutdatum && d.slutdatum < d.startdatum)]
  ];
  let forsta = null;
  for (const [id, giltig] of kontroller) {
    visaFel(id, !giltig);
    if (!giltig) { ok = false; forsta = forsta || id; }
  }
  const harMaterial = d.grupper.length > 0;
  $('fel-material').hidden = harMaterial;
  if (!harMaterial) { ok = false; forsta = forsta || 'grupper'; }
  if (!ok && forsta) {
    const el = $(forsta);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); if (el.focus) el.focus({ preventScroll: true }); }
  }
  return ok;
}

/* ---------- Uppdatera vyn vid varje ändring ---------- */
function uppdatera() {
  // Gruppfält visas bara när något i gruppen är ikryssat; "Alla" speglar gruppens kryssrutor.
  for (const g of GRUPPER) {
    if (g.fritext) {
      const t = $('ovrigt-text').value.trim();
      $('grupp-' + g.id).classList.toggle('vald', !!t);
      continue;
    }
    const valda = g.val.filter(v => $('val-' + v.id).checked);
    const sek = $('grupp-' + g.id);
    sek.classList.toggle('vald', valda.length > 0);
    sek.querySelector('.grupp-falt').hidden = valda.length === 0;
    if (g.alla) {
      const relevanta = g.allaInklEjStandard ? g.val : g.val.filter(v => !v.ejStandard);
      $('val-' + g.id + '-alla').checked = relevanta.every(v => $('val-' + v.id).checked);
    }
  }
  const d = lasFormular();
  const n = antalVal(d);
  $('sammanstallning-forhandsvisning').textContent = n ? sammanstall(d) : '';
  $('snabbrad-text').textContent = n === 0 ? 'Inget valt ännu' : n === 1 ? '1 sak vald' : n + ' saker valda';
  // Varning om leveransdatum efter kampanjstart
  $('varning-leveransdatum').hidden = !(d.startdatum && d.leveransdatum && d.leveransdatum > d.startdatum);
  sparaUtkast();
}

/* ---------- Utkast i webbläsaren ---------- */
function allaFalt() {
  return Array.from(document.querySelectorAll('#formular input, #formular textarea')).filter(el => el.id && !el.dataset.alla);
}
function sparaUtkast() {
  try {
    const o = {};
    for (const el of allaFalt()) o[el.id] = el.type === 'checkbox' ? el.checked : el.value;
    localStorage.setItem(UTKAST_NYCKEL, JSON.stringify(o));
  } catch (e) { /* utan lagring fungerar formuläret ändå */ }
}
function lasUtkast() {
  try {
    const o = JSON.parse(localStorage.getItem(UTKAST_NYCKEL) || 'null');
    if (!o) return;
    for (const el of allaFalt()) {
      if (!(el.id in o)) continue;
      if (el.type === 'checkbox') el.checked = !!o[el.id]; else el.value = o[el.id];
    }
  } catch (e) { /* ignorera trasigt utkast */ }
}
function rensa(behallBestallare) {
  const b = behallBestallare ? { namn: $('bestallare-namn').value, epost: $('bestallare-epost').value, telefon: $('bestallare-telefon').value } : null;
  for (const el of allaFalt()) { if (el.type === 'checkbox') el.checked = false; else el.value = ''; }
  if (b) { $('bestallare-namn').value = b.namn; $('bestallare-epost').value = b.epost; $('bestallare-telefon').value = b.telefon; }
  for (const id of ['kampanjnamn', 'leveransdatum', 'bestallare-namn', 'bestallare-epost', 'slutdatum']) visaFel(id, false);
  $('fel-material').hidden = true;
  uppdatera();
}

/* ---------- Kopiera ---------- */
async function kopiera(text, besked) {
  try {
    await navigator.clipboard.writeText(text);
    if (besked) { besked.hidden = false; setTimeout(() => { besked.hidden = true; }, 2500); }
    return true;
  } catch (e) {
    // Reservväg: markera texten så att användaren kan kopiera själv
    const pre = $('sammanstallning-klar').hidden ? $('sammanstallning-forhandsvisning') : $('sammanstallning-klar');
    const sel = window.getSelection(); const range = document.createRange();
    range.selectNodeContents(pre); sel.removeAllRanges(); sel.addRange(range);
    return false;
  }
}

/* ---------- Skicka ---------- */
async function skicka(e) {
  e.preventDefault();
  const d = lasFormular();
  if (!validera(d)) return;
  const text = sammanstall(d);
  const lank = mailtoLank(d, text);

  if (KONFIG.endpoint) {
    try {
      await fetch(KONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, text, amne: amne(d) }) });
    } catch (err) { /* e-posten är huvudvägen; endpointen är en kopia */ }
  }

  $('sammanstallning-klar').textContent = text;
  $('oppna-mejl-igen').href = lank;
  $('formular').hidden = true;
  $('snabbrad').hidden = true;
  $('bekraftelse').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await kopiera(text, null);
  // Öppna e-postprogrammet
  window.location.href = lank;
  try { localStorage.removeItem(UTKAST_NYCKEL); } catch (err) { /* ok */ }
}

/* ---------- Hämta material ---------- */
async function visaMaterial() {
  const rot = $('material-lista');
  let data = null;
  try {
    const svar = await fetch('material.json', { cache: 'no-store' });
    if (svar.ok) data = await svar.json();
  } catch (e) { /* visas som tomt */ }
  rot.textContent = '';
  const kampanjer = (data && data.kampanjer) || [];
  if (!kampanjer.length) {
    const t = document.createElement('div');
    t.className = 'tomt';
    t.innerHTML = '<h3>Inget material upplagt ännu</h3><p>När Stampen lägger upp färdigt material dyker det upp här, sorterat per kampanj.</p>';
    rot.appendChild(t);
    return;
  }
  for (const k of kampanjer) {
    const sek = document.createElement('section');
    sek.className = 'material-kampanj';
    const h = document.createElement('h3'); h.textContent = k.namn; sek.appendChild(h);
    if (k.beskrivning) { const p = document.createElement('p'); p.textContent = k.beskrivning; sek.appendChild(p); }
    const ul = document.createElement('ul'); ul.className = 'material-filer';
    for (const f of (k.filer || [])) {
      const li = document.createElement('li');
      const a = document.createElement('a'); a.href = f.fil; a.textContent = f.namn; a.download = ''; li.appendChild(a);
      const s = document.createElement('span'); s.textContent = [f.format, f.storlek, f.datum].filter(Boolean).join(' · '); li.appendChild(s);
      ul.appendChild(li);
    }
    sek.appendChild(ul);
    rot.appendChild(sek);
  }
  if (data.uppdaterad) { const p = document.createElement('p'); p.className = 'dampad'; p.textContent = 'Senast uppdaterad ' + data.uppdaterad; rot.appendChild(p); }
}

/* ---------- Vyer (flikar) ---------- */
function visaVy() {
  const vy = location.hash === '#material' ? 'material' : 'bestall';
  $('vy-bestall').hidden = vy !== 'bestall';
  $('vy-material').hidden = vy !== 'material';
  $('flik-bestall').classList.toggle('aktiv', vy === 'bestall');
  $('flik-material').classList.toggle('aktiv', vy === 'material');
  if (vy === 'material') visaMaterial();
  if (vy === 'bestall' && location.hash && location.hash !== '#bestall') {
    const mal = document.querySelector(location.hash);
    if (mal) mal.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ---------- Start ---------- */
function start() {
  byggGrupper();
  const mottagare = KONFIG.till.join(', ');
  $('mottagare-text').textContent = mottagare;
  document.querySelectorAll('.mottagare-text').forEach(el => { el.textContent = mottagare; });
  lasUtkast();

  const form = $('formular');
  form.addEventListener('submit', skicka);
  form.addEventListener('input', uppdatera);
  form.addEventListener('change', (e) => {
    const el = e.target;
    if (el.dataset.alla) {
      const g = GRUPPER.find(x => x.id === el.dataset.grupp);
      const relevanta = g.allaInklEjStandard ? g.val : g.val.filter(v => !v.ejStandard);
      for (const v of relevanta) $('val-' + v.id).checked = el.checked;
    }
    uppdatera();
  });
  $('kopiera-forhandsvisning').addEventListener('click', () => {
    const d = lasFormular();
    kopiera(sammanstall(d), null);
  });
  $('rensa').addEventListener('click', () => rensa(true));
  $('kopiera-klar').addEventListener('click', () => kopiera($('sammanstallning-klar').textContent, $('kopierat-besked')));
  $('ny-bestallning').addEventListener('click', () => {
    $('bekraftelse').hidden = true;
    $('formular').hidden = false;
    $('snabbrad').hidden = false;
    rensa(true);
    location.hash = '#bestall';
    window.scrollTo({ top: 0 });
  });
  window.addEventListener('hashchange', visaVy);
  visaVy();
  uppdatera();
}

document.addEventListener('DOMContentLoaded', start);
