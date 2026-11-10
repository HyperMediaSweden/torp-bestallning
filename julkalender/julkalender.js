/* Filmbokning till julkalendern. Tiderna och bokningen sköts av beställningssystemet (bestallningar.k2.nu).
   Tiderna hämtas när sidan laddas och igen precis innan bokningen skickas. Servern avgör om tiden fortfarande är ledig. */
'use strict';

const LOKALT = ['localhost', '127.0.0.1'].includes(location.hostname);
const API = LOKALT ? 'http://127.0.0.1:8777' : 'https://bestallningar.k2.nu'; // Lokalt: mock vid testning
const TIDSGRANS = 15000;
const FALT = ['butik', 'kontaktperson', 'telefon', 'epost'];

const $ = (id) => document.getElementById(id);
let tider = [];
let valdTid = null;

function dagNamn(datum) {
  const text = new Date(datum + 'T12:00:00').toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

async function hamta(url, val) {
  const styr = new AbortController();
  const klocka = setTimeout(() => styr.abort(), TIDSGRANS);
  try {
    return await fetch(url, { cache: 'no-store', ...val, signal: styr.signal });
  } finally {
    clearTimeout(klocka);
  }
}

async function hamtaTider() {
  const svar = await hamta(API + '/api/filmbokning/tider');
  if (!svar.ok) throw new Error('Systemet svarade ' + svar.status);
  const data = await svar.json();
  if (!data || !Array.isArray(data.tider)) throw new Error('Oväntat svar');
  return data.tider;
}

function ritaTider() {
  const rot = $('tider');
  rot.textContent = '';
  rot.removeAttribute('aria-busy');
  if (valdTid && !tider.some(t => t.id === valdTid && t.ledig)) valdTid = null;
  if (!tider.length) {
    const p = document.createElement('p');
    p.className = 'dampad';
    p.textContent = 'Det finns inga tider att boka just nu.';
    rot.appendChild(p);
    visaValdTid();
    return;
  }
  const dagar = [...new Set(tider.map(t => t.datum))];
  for (const datum of dagar) {
    const sek = document.createElement('section');
    sek.className = 'dag';
    const rubrik = document.createElement('h3');
    rubrik.textContent = dagNamn(datum);
    sek.appendChild(rubrik);
    const rutnat = document.createElement('div');
    rutnat.className = 'tid-rutnat';
    rutnat.setAttribute('role', 'group');
    rutnat.setAttribute('aria-label', dagNamn(datum));
    for (const t of tider.filter(x => x.datum === datum)) rutnat.appendChild(tidKnapp(t));
    sek.appendChild(rutnat);
    rot.appendChild(sek);
  }
  visaValdTid();
}

function tidKnapp(t) {
  const label = document.createElement('label');
  label.className = 'tid';
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'tid';
  input.value = t.id;
  input.className = 'visuellt-dold';
  input.disabled = !t.ledig;
  input.checked = t.id === valdTid;
  input.setAttribute('aria-label', t.start + ' till ' + t.slut + (t.ledig ? '' : ', upptagen'));
  input.addEventListener('change', () => { valdTid = t.id; visaValdTid(); visaFel('tid', false); });
  const ruta = document.createElement('span');
  ruta.className = 'tid-ruta';
  const start = document.createElement('b');
  start.textContent = t.start;
  ruta.appendChild(start);
  if (!t.ledig) { const u = document.createElement('small'); u.textContent = 'Upptagen'; ruta.appendChild(u); }
  label.append(input, ruta);
  return label;
}

function visaValdTid() {
  const t = tider.find(x => x.id === valdTid);
  $('vald-tid').hidden = !t;
  $('vald-tid').textContent = t ? 'Vald tid: ' + dagNamn(t.datum).toLowerCase() + ', kl. ' + t.start + '–' + t.slut : '';
}

function visaLaddfel() {
  const rot = $('tider');
  rot.textContent = '';
  rot.removeAttribute('aria-busy');
  const p = document.createElement('p');
  p.className = 'fel';
  p.textContent = 'Tiderna gick inte att hämta just nu.';
  const knapp = document.createElement('button');
  knapp.type = 'button';
  knapp.className = 'knapp knapp-sekundar knapp-liten';
  knapp.textContent = 'Försök igen';
  knapp.addEventListener('click', laddaTider);
  rot.append(p, knapp);
}

async function laddaTider() {
  try {
    tider = await hamtaTider();
    ritaTider();
    return true;
  } catch (err) {
    if (!tider.length) visaLaddfel();
    return false;
  }
}

/* ---------- Validering ---------- */
function visaFel(id, visa, text) {
  const fel = $('fel-' + id);
  if (text) fel.textContent = text;
  fel.hidden = !visa;
  const falt = $(id) && $(id).closest('.falt');
  if (falt) falt.classList.toggle('ogiltig', visa);
}

function lasFormular() {
  const manus = document.querySelector('input[name="manus"]:checked');
  return {
    tid: valdTid,
    butik: $('butik').value.trim(),
    kontaktperson: $('kontaktperson').value.trim(),
    telefon: $('telefon').value.trim(),
    epost: $('epost').value.trim(),
    tavling: $('tavling').value.trim(),
    manus: manus ? manus.value : '',
    bekraftat: $('bekraftat').checked
  };
}

function validera(d) {
  const epostOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.epost);
  const kontroller = [
    ['butik', !!d.butik, $('butik')],
    ['kontaktperson', !!d.kontaktperson, $('kontaktperson')],
    ['telefon', !!d.telefon, $('telefon')],
    ['epost', epostOk, $('epost')],
    ['tid', !!d.tid, $('block-tid')],
    ['manus', !!d.manus, $('manus-grupp')],
    ['bekraftat', d.bekraftat, $('bekraftat')]
  ];
  let forsta = null;
  for (const [id, ok, el] of kontroller) {
    visaFel(id, !ok, id === 'tid' ? 'Välj en filmtid.' : undefined);
    if (!ok && !forsta) forsta = el;
  }
  if (forsta) {
    forsta.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (forsta.matches('input')) forsta.focus({ preventScroll: true });
  }
  return !forsta;
}

/* ---------- Boka ---------- */
async function tidenTagen(text) {
  valdTid = null;
  await laddaTider();
  ritaTider();
  visaFel('tid', true, text);
  $('block-tid').scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function visaBekraftelse(bokning, epost) {
  $('bokad-tid').textContent = dagNamn(bokning.datum) + ', kl. ' + bokning.start + '–' + bokning.slut;
  $('bokad-epost').textContent = epost;
  $('formular').hidden = true;
  document.querySelectorAll('.hero .lead').forEach(el => { el.hidden = true; });
  $('bekraftelse').hidden = false;
  window.scrollTo(0, 0);
  $('bekraftelse-rubrik').focus({ preventScroll: true });
}

async function boka(ev) {
  ev.preventDefault();
  visaFel('skicka', false);
  const d = lasFormular();
  if (!validera(d)) return;
  const knapp = $('boka');
  knapp.disabled = true;
  knapp.textContent = 'Bokar …';
  try {
    // Går kontrollen inte att göra skickas bokningen ändå, servern säger ifrån om tiden är tagen.
    const kontrollerad = await laddaTider();
    const tid = tider.find(t => t.id === d.tid);
    if (kontrollerad && (!tid || !tid.ledig)) {
      await tidenTagen('Tiden hann bli tagen. Välj en annan tid.');
      return;
    }
    const valdRad = tid;
    const svar = await hamta(API + '/api/filmbokning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    });
    let json = null;
    try { json = await svar.json(); } catch (e) { /* inget JSON-svar */ }
    if (svar.ok && json) {
      visaBekraftelse({ datum: json.datum || (valdRad && valdRad.datum), start: json.start || (valdRad && valdRad.start), slut: json.slut || (valdRad && valdRad.slut) }, d.epost);
      return;
    }
    if (svar.status === 409) {
      await tidenTagen((json && json.fel) || 'Tiden hann bli tagen. Välj en annan tid.');
      return;
    }
    visaFel('skicka', true, (json && json.fel) || 'Bokningen gick inte att skicka just nu. Försök igen om en stund.');
  } catch (err) {
    visaFel('skicka', true, 'Bokningen gick inte att skicka. Kontrollera uppkopplingen och försök igen.');
  } finally {
    knapp.disabled = false;
    knapp.textContent = 'Boka filmtiden';
  }
}

/* ---------- Start ---------- */
for (const id of FALT) $(id).addEventListener('input', () => visaFel(id, false));
document.querySelectorAll('input[name="manus"]').forEach(el => el.addEventListener('change', () => visaFel('manus', false)));
$('bekraftat').addEventListener('change', () => { if ($('bekraftat').checked) visaFel('bekraftat', false); });
$('formular').addEventListener('submit', boka);
laddaTider();
