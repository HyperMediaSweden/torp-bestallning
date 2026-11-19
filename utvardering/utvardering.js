/* Utvärdering av julkalendern. Butiken kommer hit via en personlig länk (?k=<kod>) från Emandas mejl.
   Butiksnamnet och om utvärderingen redan är besvarad hämtas från beställningssystemet (bestallningar.k2.nu). */
'use strict';

const LOKALT = ['localhost', '127.0.0.1'].includes(location.hostname);
const API = LOKALT ? 'http://127.0.0.1:8778' : 'https://bestallningar.k2.nu'; // Lokalt: mock vid testning
const TIDSGRANS = 15000;
const BETYG = ['helhet', 'forberedelse', 'coachning', 'rolig'];
const OBLIGATORISKA = [...BETYG, 'nastaAr'];
const KONTAKT = 'emanda.andersson@stampen.com';

const $ = (id) => document.getElementById(id);
const kod = (new URLSearchParams(location.search).get('k') || '').trim();

async function hamta(url, val) {
  const styr = new AbortController();
  const klocka = setTimeout(() => styr.abort(), TIDSGRANS);
  try {
    return await fetch(url, { cache: 'no-store', ...val, signal: styr.signal });
  } finally {
    clearTimeout(klocka);
  }
}
const adress = () => API + '/api/utvardering/' + encodeURIComponent(kod);

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
function okandKod() {
  visaMeddelande('Länken fungerar inte.', 'Hör av dig till Emanda på ' + KONTAKT + '.', false);
}
function redanBesvarad(text) {
  visaMeddelande(text || 'Ni har redan svarat. Tack!', 'Era svar har kommit fram till oss.', false);
}

async function start() {
  if (!kod) { okandKod(); return; }
  visa('laddar');
  try {
    const svar = await hamta(adress());
    if (svar.status === 404) { okandKod(); return; }
    const data = await svar.json().catch(() => null);
    if (!svar.ok || !data) throw new Error('Systemet svarade ' + svar.status);
    if (data.besvarad) { redanBesvarad(); return; }
    $('butik-namn').textContent = data.butik || 'där';
    visa('formular');
    uppdateraFramsteg();
  } catch (err) {
    visaMeddelande('Formuläret gick inte att hämta', 'Kontrollera uppkopplingen och försök igen. Fungerar det ändå inte, hör av dig till Emanda på ' + KONTAKT + '.', true);
  }
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
  const el = document.querySelector('input[name="' + namn + '"]:checked');
  return el ? el.value : '';
}
function lasSvar() {
  const d = {};
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
    const forstaVal = document.querySelector('input[name="' + forsta + '"]');
    if (forstaVal) forstaVal.focus({ preventScroll: true });
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
    const svar = await hamta(adress(), {
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
    if (svar.status === 409) { redanBesvarad(json && json.fel); window.scrollTo(0, 0); return; }
    if (svar.status === 404) { okandKod(); window.scrollTo(0, 0); return; }
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
