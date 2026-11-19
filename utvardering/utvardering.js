/* Utvärdering av julkalendern. En gemensam länk till alla butiker (Fridas beslut 2026-11-19).
   Butiken väljer sitt namn i en lista som hämtas från beställningssystemet (bestallningar.k2.nu).
   Butiker som redan har svarat går inte att välja, och servern säger ifrån om samma butik svarar igen. */
'use strict';

const LOKALT = ['localhost', '127.0.0.1'].includes(location.hostname);
const API = LOKALT ? 'http://127.0.0.1:8778' : 'https://bestallningar.k2.nu'; // Lokalt: mock vid testning
const TIDSGRANS = 15000;
const BETYG = ['helhet', 'forberedelse', 'coachning', 'rolig'];
const OBLIGATORISKA = ['butik', ...BETYG, 'nastaAr'];
const KONTAKT = 'emanda.andersson@stampen.com';

const $ = (id) => document.getElementById(id);
let butiker = [];

async function hamta(url, val) {
  const styr = new AbortController();
  const klocka = setTimeout(() => styr.abort(), TIDSGRANS);
  try {
    return await fetch(url, { cache: 'no-store', ...val, signal: styr.signal });
  } finally {
    clearTimeout(klocka);
  }
}

/* ---------- Tillstånd ---------- */
function visa(lage) {
  for (const id of ['laddar', 'meddelande', 'formular', 'tack']) $(id).hidden = id !== lage;
  $('ingress').hidden = lage !== 'formular';
}

function visaMeddelande(rubrik, text, kanForsoka) {
  $('meddelande-rubrik').textContent = rubrik;
  $('meddelande-text').textContent = text;
  $('meddelande-knapp').hidden = !kanForsoka;
  visa('meddelande');
  $('meddelande-rubrik').focus({ preventScroll: true });
}

async function start() {
  visa('laddar');
  try {
    const svar = await hamta(API + '/api/utvardering/butiker');
    const data = await svar.json().catch(() => null);
    if (!svar.ok || !data || !Array.isArray(data.butiker)) throw new Error('Systemet svarade ' + svar.status);
    butiker = data.butiker;
    if (!butiker.length) {
      visaMeddelande('Utvärderingen är inte öppen just nu.', 'Hör av dig till Emanda på ' + KONTAKT + '.', false);
      return;
    }
    ritaButiker();
    visa('formular');
    uppdateraFramsteg();
  } catch (err) {
    visaMeddelande('Formuläret gick inte att hämta', 'Kontrollera uppkopplingen och försök igen. Fungerar det ändå inte, hör av dig till Emanda på ' + KONTAKT + '.', true);
  }
}

function ritaButiker() {
  const val = $('butik');
  const fore = val.value;
  val.length = 1; // behåll "Välj butik"
  const sorterade = butiker.slice().sort((a, b) => String(a.namn).localeCompare(String(b.namn), 'sv'));
  sorterade.forEach((b) => {
    const o = document.createElement('option');
    o.value = String(b.id);
    o.textContent = b.namn + (b.besvarad ? ' (har svarat)' : '');
    o.disabled = !!b.besvarad;
    val.appendChild(o);
  });
  val.value = sorterade.some(b => String(b.id) === fore && !b.besvarad) ? fore : '';
}

/* ---------- Bygg betygsknapparna ---------- */
function byggBetyg() {
  for (const fs of document.querySelectorAll('fieldset.fraga')) {
    const ruta = fs.querySelector('.betyg');
    if (!ruta) continue;
    const falt = fs.dataset.falt;
    const knappar = document.createElement('div');
    knappar.className = 'betyg-knappar';
    for (let n = 1; n <= 5; n++) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = falt;
      input.value = String(n);
      input.className = 'visuellt-dold';
      const slut = n === 1 ? ruta.dataset.lag : n === 5 ? ruta.dataset.hog : '';
      input.setAttribute('aria-label', n + (slut ? ', ' + slut : ''));
      const siffra = document.createElement('span');
      siffra.textContent = n;
      siffra.setAttribute('aria-hidden', 'true');
      label.append(input, siffra);
      knappar.appendChild(label);
    }
    const skala = document.createElement('div');
    skala.className = 'betyg-skala';
    skala.setAttribute('aria-hidden', 'true');
    const lag = document.createElement('span'); lag.textContent = '1 = ' + ruta.dataset.lag;
    const hog = document.createElement('span'); hog.textContent = '5 = ' + ruta.dataset.hog;
    skala.append(lag, hog);
    ruta.append(knappar, skala);
  }
}

/* ---------- Läs och kontrollera ---------- */
function valt(namn) {
  if (namn === 'butik') return $('butik').value;
  const el = document.querySelector('input[name="' + namn + '"]:checked');
  return el ? el.value : '';
}
function lasSvar() {
  // Skicka tillbaka butikens id med samma typ som servern gav (tal eller sträng)
  const vald = butiker.find(b => String(b.id) === $('butik').value);
  const d = { butik: vald ? vald.id : $('butik').value };
  for (const f of BETYG) d[f] = parseInt(valt(f), 10) || null;
  d.nastaAr = valt('nastaAr');
  const forbattring = $('forbattring').value.trim();
  const namn = $('namn').value.trim();
  if (forbattring) d.forbattring = forbattring;
  if (namn) d.namn = namn;
  d.farCitera = $('farCitera').checked;
  return d;
}
function besvarade() { return OBLIGATORISKA.filter(f => valt(f)).length; }

function uppdateraFramsteg() {
  const n = besvarade(), tot = OBLIGATORISKA.length;
  const text = n === tot ? 'Alla ' + tot + ' obligatoriska frågor är besvarade' : n + ' av ' + tot + ' besvarade';
  $('framsteg').textContent = text;
  $('framsteg').classList.toggle('klar', n === tot);
  $('framsteg-topp').textContent = n + ' av ' + tot + ' besvarade';
}

function visaFel(falt, visa) {
  $('fel-' + falt).hidden = !visa;
  $('fraga-' + falt).classList.toggle('ogiltig', visa);
}
function validera() {
  let forsta = null;
  for (const f of OBLIGATORISKA) {
    const ok = !!valt(f);
    visaFel(f, !ok);
    if (!ok && !forsta) forsta = f;
  }
  if (forsta) {
    $('fraga-' + forsta).scrollIntoView({ block: 'center', behavior: 'smooth' });
    const el = forsta === 'butik' ? $('butik') : document.querySelector('input[name="' + forsta + '"]');
    if (el) el.focus({ preventScroll: true });
  }
  return !forsta;
}

/* ---------- Skicka ---------- */
async function skicka(ev) {
  ev.preventDefault();
  $('fel-skicka').hidden = true;
  if (!validera()) return;
  const knapp = $('skicka');
  knapp.disabled = true;
  knapp.textContent = 'Skickar …';
  try {
    const svar = await hamta(API + '/api/utvardering', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lasSvar())
    });
    const json = await svar.json().catch(() => null);
    if (svar.ok) {
      visa('tack');
      window.scrollTo(0, 0);
      $('tack-rubrik').focus({ preventScroll: true });
      return;
    }
    if (svar.status === 409) {
      visaMeddelande((json && json.fel) || 'Ni har redan svarat. Tack!', 'Er butik har redan skickat in sina svar. Har ni valt fel butik, hör av dig till Emanda på ' + KONTAKT + '.', false);
      window.scrollTo(0, 0);
      return;
    }
    visaSkickfel((json && json.fel) || 'Svaren gick inte att skicka just nu. Försök igen om en stund.');
  } catch (err) {
    visaSkickfel('Svaren gick inte att skicka. Kontrollera uppkopplingen och försök igen.');
  } finally {
    knapp.disabled = false;
    knapp.textContent = 'Skicka svaren';
  }
}
function visaSkickfel(text) {
  $('fel-skicka').textContent = text;
  $('fel-skicka').hidden = false;
}

/* ---------- Start ---------- */
byggBetyg();
$('formular').addEventListener('change', (ev) => {
  const namn = ev.target.name;
  if (OBLIGATORISKA.includes(namn)) visaFel(namn, false);
  uppdateraFramsteg();
});
$('formular').addEventListener('submit', skicka);
$('forsok-igen').addEventListener('click', start);
start();
