/* Formatspec: tabellen Ledtider byggs från ../ledtider.js, samma siffror som formuläret använder. */
'use strict';
(function () {
  if (typeof LEDTIDER === 'undefined') return;
  function cell(rad, text, klass) {
    const td = document.createElement('td');
    if (klass) td.className = klass;
    td.textContent = text;
    rad.appendChild(td);
  }
  function ledtidText(l) {
    if (l.text) return l.text;
    const delar = [ledtidDagarText(l.dagar)];
    for (const v of Object.values(l.val || {})) delar.push(v.namn.toLowerCase() + ' ' + ledtidDagarText(v.dagar));
    return delar.join(', ');
  }
  const inhus = document.getElementById('ledtider-rader');
  const kampanj = document.getElementById('ledtider-kampanj');
  if (inhus) inhus.textContent = '';
  for (const l of Object.values(LEDTIDER)) {
    const mal = l.kampanj ? kampanj : inhus;
    if (!mal) continue;
    const rad = document.createElement('tr');
    cell(rad, l.namn, 'g');
    cell(rad, ledtidText(l));
    if (!l.kampanj) cell(rad, l.tillagg || '–');
    mal.appendChild(rad);
  }
})();
