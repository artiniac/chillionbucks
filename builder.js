/* Chillion Builder: Leo's imagination board. Pick a place (or a photo of your room), spend saved bucks on
   stickers, drag them anywhere, draw on top, save a picture. Everything stays in this browser. No libraries. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SFX = window.SFX, Wallet = window.Wallet;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const NS = 'xmlns="http://www.w3.org/2000/svg"';
  const INK = '#052e16';

  /* ============================== SCENES (backgrounds) ============================== */
  const sky = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>`;
  const SCENES = {
    bedroom: { name: 'Bedroom', e: '🛏️', svg: `<svg ${NS} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
      <rect width="1200" height="800" fill="#dbeafe"/><rect y="540" width="1200" height="260" fill="#d9a066"/>
      <g stroke="#c08a4d" stroke-width="4">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<line x1="${i * 100}" y1="540" x2="${i * 100 - 60}" y2="800"/>`).join('')}<line x1="0" y1="640" x2="1200" y2="640"/><line x1="0" y1="730" x2="1200" y2="730"/></g>
      <rect y="524" width="1200" height="18" fill="#fff"/>
      <rect x="760" y="110" width="320" height="250" rx="10" fill="#7dd3fc" stroke="#fff" stroke-width="18"/><circle cx="1000" cy="180" r="34" fill="#fde047"/><ellipse cx="850" cy="220" rx="60" ry="22" fill="#fff" opacity=".9"/>
      <line x1="920" y1="110" x2="920" y2="360" stroke="#fff" stroke-width="12"/><line x1="760" y1="235" x2="1080" y2="235" stroke="#fff" stroke-width="12"/>
      <rect x="720" y="90" width="50" height="300" rx="10" fill="#f472b6"/><rect x="1070" y="90" width="50" height="300" rx="10" fill="#f472b6"/>
      <rect x="150" y="140" width="220" height="160" rx="14" fill="#fff" stroke="#fbbf24" stroke-width="10"/><text x="260" y="240" text-anchor="middle" font-size="90">⭐</text>
      <ellipse cx="420" cy="700" rx="290" ry="72" fill="#f472b6"/><ellipse cx="420" cy="700" rx="210" ry="50" fill="#fda4af"/>
    </svg>` },
    living: { name: 'Living room', e: '🛋️', svg: `<svg ${NS} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">
      <rect width="1200" height="800" fill="#fef3c7"/><rect y="560" width="1200" height="240" fill="#a16207"/>
      <g stroke="#854d0e" stroke-width="4">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => `<line x1="${i * 100 + 50}" y1="560" x2="${i * 100 - 10}" y2="800"/>`).join('')}<line x1="0" y1="660" x2="1200" y2="660"/></g>
      <rect y="546" width="1200" height="16" fill="#fff"/>
      <rect x="120" y="100" width="380" height="280" rx="10" fill="#bae6fd" stroke="#fff" stroke-width="18"/><line x1="310" y1="100" x2="310" y2="380" stroke="#fff" stroke-width="12"/><line x1="120" y1="240" x2="500" y2="240" stroke="#fff" stroke-width="12"/>
      <ellipse cx="220" cy="190" rx="60" ry="24" fill="#fff" opacity=".9"/><circle cx="430" cy="170" r="30" fill="#fde047"/>
      <rect x="720" y="160" width="360" height="22" rx="6" fill="#92400e"/><rect x="720" y="300" width="360" height="22" rx="6" fill="#92400e"/>
      <g stroke="${INK}" stroke-width="3"><rect x="740" y="100" width="34" height="60" fill="#ef4444"/><rect x="780" y="110" width="30" height="50" fill="#3b82f6"/><rect x="816" y="95" width="40" height="65" fill="#22c55e"/><rect x="862" y="115" width="28" height="45" fill="#f59e0b"/><rect x="900" y="105" width="36" height="55" fill="#a855f7"/></g>
      <rect x="760" y="240" width="60" height="60" rx="8" fill="#22c55e"/><rect x="860" y="250" width="120" height="50" rx="8" fill="#f472b6"/>
      <ellipse cx="600" cy="720" rx="330" ry="60" fill="#0ea5e9" opacity=".85"/>
    </svg>` },
    backyard: { name: 'Backyard', e: '🌳', svg: `<svg ${NS} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">${sky('by', '#7dd3fc', '#e0f2fe')}
      <rect width="1200" height="800" fill="url(#by)"/><circle cx="980" cy="140" r="70" fill="#fde047"/>
      <ellipse cx="260" cy="150" rx="120" ry="40" fill="#fff" opacity=".9"/><ellipse cx="620" cy="110" rx="90" ry="30" fill="#fff" opacity=".85"/>
      <rect y="470" width="1200" height="330" fill="#4ade80"/><rect y="470" width="1200" height="40" fill="#22c55e"/>
      <g fill="#fff" stroke="#cbd5e1" stroke-width="3">${Array.from({ length: 24 }, (_, i) => `<rect x="${i * 50 + 6}" y="400" width="30" height="110" rx="4"/>`).join('')}<rect x="0" y="430" width="1200" height="12"/><rect x="0" y="480" width="1200" height="12"/></g>
      <g fill="#16a34a"><circle cx="120" cy="560" r="50"/><circle cx="170" cy="580" r="40"/><circle cx="1060" cy="570" r="55"/><circle cx="1120" cy="590" r="40"/></g>
      <g fill="#f472b6"><circle cx="330" cy="700" r="8"/><circle cx="360" cy="740" r="8"/><circle cx="820" cy="710" r="8"/><circle cx="880" cy="750" r="8"/></g>
    </svg>` },
    beach: { name: 'Beach', e: '🏖️', svg: `<svg ${NS} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">${sky('be', '#38bdf8', '#e0f2fe')}
      <rect width="1200" height="800" fill="url(#be)"/><circle cx="220" cy="130" r="70" fill="#fde047"/>
      <ellipse cx="800" cy="130" rx="110" ry="36" fill="#fff" opacity=".9"/>
      <rect y="400" width="1200" height="230" fill="#0ea5e9"/>
      <path d="M0 420 q60 -20 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 V440 H0Z" fill="#7dd3fc"/>
      <path d="M0 520 q60 -14 120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0 t120 0" fill="none" stroke="#e0f2fe" stroke-width="8" opacity=".8"/>
      <path d="M0 600 q100 -30 200 0 t200 0 t200 0 t200 0 t200 0 t200 0 V800 H0Z" fill="#fde68a"/><rect y="640" width="1200" height="160" fill="#fde68a"/>
      <g fill="#fda4af"><ellipse cx="300" cy="720" rx="18" ry="10"/><ellipse cx="900" cy="740" rx="16" ry="9"/><ellipse cx="620" cy="770" rx="14" ry="8"/></g>
    </svg>` },
    ocean: { name: 'Under the sea', e: '🐠', svg: `<svg ${NS} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">${sky('oc', '#38bdf8', '#1e3a8a')}
      <rect width="1200" height="800" fill="url(#oc)"/>
      <g fill="#fff" opacity=".12"><polygon points="200,0 320,0 520,800 260,800"/><polygon points="700,0 780,0 1100,800 900,800"/></g>
      <ellipse cx="600" cy="800" rx="720" ry="90" fill="#f59e0b"/><ellipse cx="600" cy="810" rx="720" ry="60" fill="#fbbf24"/>
      <g fill="none" stroke="#16a34a" stroke-width="14" stroke-linecap="round"><path d="M120 760 q40 -60 0 -120 q-40 -60 10 -130"/><path d="M1060 760 q-40 -60 0 -120 q40 -60 -10 -130"/><path d="M860 770 q30 -50 0 -100 q-30 -50 10 -100"/></g>
      <g fill="#fff" opacity=".45"><circle cx="300" cy="500" r="10"/><circle cx="330" cy="440" r="6"/><circle cx="960" cy="380" r="9"/><circle cx="930" cy="320" r="5"/></g>
    </svg>` },
    forest: { name: 'Forest', e: '🌲', svg: `<svg ${NS} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">${sky('fo', '#bae6fd', '#ecfccb')}
      <rect width="1200" height="800" fill="url(#fo)"/>
      <g fill="#15803d">${[0, 150, 300, 450, 600, 750, 900, 1050].map(x => `<polygon points="${x + 75},180 ${x},460 ${x + 150},460"/>`).join('')}</g>
      <g fill="#166534">${[70, 230, 400, 560, 720, 880, 1040].map(x => `<polygon points="${x + 60},260 ${x},520 ${x + 120},520"/><rect x="${x + 48}" y="520" width="24" height="40" fill="#78350f"/>`).join('')}</g>
      <rect y="540" width="1200" height="260" fill="#4ade80"/><rect y="540" width="1200" height="30" fill="#22c55e"/>
      <path d="M500 800 q60 -120 20 -200 q-30 -50 40 -60 h120 q60 10 20 80 q-40 90 40 180 Z" fill="#d6a86b"/>
      <g fill="#fbbf24"><circle cx="200" cy="700" r="8"/><circle cx="1000" cy="720" r="8"/><circle cx="300" cy="760" r="7"/></g>
    </svg>` },
    town: { name: 'Town', e: '🏙️', svg: `<svg ${NS} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">${sky('tw', '#93c5fd', '#e0f2fe')}
      <rect width="1200" height="800" fill="url(#tw)"/><circle cx="1050" cy="120" r="55" fill="#fde047"/>
      ${[['#64748b', 0, 300], ['#f87171', 200, 200], ['#fbbf24', 380, 340], ['#94a3b8', 600, 260], ['#60a5fa', 780, 380], ['#a78bfa', 1000, 220]].map(([c, x, h]) => `<rect x="${x}" y="${600 - h}" width="180" height="${h}" fill="${c}" stroke="${INK}" stroke-width="4"/>` + Array.from({ length: Math.floor(h / 70) }, (_, r) => [0, 1, 2].map(k => `<rect x="${x + 22 + k * 52}" y="${600 - h + 22 + r * 70}" width="32" height="34" fill="#fef9c3" stroke="${INK}" stroke-width="3"/>`).join('')).join('')).join('')}
      <rect y="600" width="1200" height="40" fill="#cbd5e1"/><rect y="640" width="1200" height="160" fill="#374151"/>
      <g stroke="#fde047" stroke-width="10" stroke-dasharray="60 40"><line x1="0" y1="720" x2="1200" y2="720"/></g>
    </svg>` },
    space: { name: 'Outer space', e: '🚀', svg: `<svg ${NS} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice">${sky('sp', '#020617', '#312e81')}
      <rect width="1200" height="800" fill="url(#sp)"/>
      <g fill="#fff">${Array.from({ length: 60 }, (_, i) => `<circle cx="${(i * 197) % 1200}" cy="${(i * 131) % 620}" r="${1.5 + (i % 3)}"/>`).join('')}</g>
      <circle cx="980" cy="170" r="90" fill="#f472b6" stroke="${INK}" stroke-width="5"/><ellipse cx="980" cy="180" rx="150" ry="28" fill="none" stroke="#fbbf24" stroke-width="12"/>
      <circle cx="220" cy="140" r="50" fill="#e2e8f0"/><circle cx="205" cy="128" r="10" fill="#cbd5e1"/><circle cx="240" cy="160" r="7" fill="#cbd5e1"/>
      <ellipse cx="600" cy="820" rx="800" ry="200" fill="#cbd5e1"/><ellipse cx="600" cy="830" rx="800" ry="170" fill="#e2e8f0"/>
      <g fill="#cbd5e1"><ellipse cx="300" cy="720" rx="60" ry="20"/><ellipse cx="820" cy="750" rx="80" ry="24"/><ellipse cx="560" cy="700" rx="40" ry="14"/></g>
    </svg>` },
  };

  /* ============================== STICKER ART (the fancy water stuff and friends) ============================== */
  const S = {
    pool: (u) => `<svg ${NS} viewBox="0 0 300 180"><defs><clipPath id="c${u}"><rect x="22" y="40" width="256" height="118" rx="18"/></clipPath><linearGradient id="g${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs>
      <rect x="6" y="24" width="288" height="150" rx="28" fill="#e2e8f0" stroke="${INK}" stroke-width="5"/><rect x="22" y="40" width="256" height="118" rx="18" fill="url(#g${u})" stroke="${INK}" stroke-width="4"/>
      <g clip-path="url(#c${u})" fill="none" stroke="#e0f2fe" stroke-width="5" stroke-linecap="round" opacity=".85"><path class="w-wave" d="M-40 75 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/><path class="w-wave w-wave2" d="M-40 115 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/></g>
      <g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"><path d="M240 28 v62 M262 28 v62 M240 46 h22 M240 62 h22 M240 78 h22"/></g>
      <g class="w-float"><circle cx="110" cy="105" r="22" fill="none" stroke="#fb7185" stroke-width="12"/><circle cx="110" cy="105" r="22" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="110" cy="105" r="10" fill="none" stroke="${INK}" stroke-width="3"/></g></svg>`,
    roundpool: (u) => `<svg ${NS} viewBox="0 0 240 170"><defs><clipPath id="c${u}"><ellipse cx="120" cy="90" rx="94" ry="56"/></clipPath><linearGradient id="g${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs>
      <ellipse cx="120" cy="90" rx="114" ry="72" fill="#e2e8f0" stroke="${INK}" stroke-width="5"/><ellipse cx="120" cy="90" rx="94" ry="56" fill="url(#g${u})" stroke="${INK}" stroke-width="4"/>
      <g clip-path="url(#c${u})" fill="none" stroke="#e0f2fe" stroke-width="5" stroke-linecap="round" opacity=".85"><path class="w-wave" d="M-40 80 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/><path class="w-wave w-wave2" d="M-40 110 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/></g>
      <g class="w-float"><ellipse cx="150" cy="95" rx="16" ry="12" fill="#fde047" stroke="${INK}" stroke-width="3"/><circle cx="162" cy="82" r="10" fill="#fde047" stroke="${INK}" stroke-width="3"/><polygon points="170,84 182,86 170,90" fill="#f97316"/><circle cx="165" cy="80" r="1.8" fill="${INK}"/></g></svg>`,
    lazyriver: (u) => `<svg ${NS} viewBox="0 0 340 200"><defs><clipPath id="c${u}"><path d="M20 60 C 90 10, 160 130, 230 70 S 320 40, 330 120" fill="none" stroke="#000" stroke-width="44"/></clipPath></defs>
      <path d="M20 60 C 90 10, 160 130, 230 70 S 320 40, 330 120" fill="none" stroke="${INK}" stroke-width="54" stroke-linecap="round"/><path d="M20 60 C 90 10, 160 130, 230 70 S 320 40, 330 120" fill="none" stroke="#e2e8f0" stroke-width="48" stroke-linecap="round"/><path d="M20 60 C 90 10, 160 130, 230 70 S 320 40, 330 120" fill="none" stroke="#0ea5e9" stroke-width="36" stroke-linecap="round"/>
      <path class="w-fall" d="M20 60 C 90 10, 160 130, 230 70 S 320 40, 330 120" fill="none" stroke="#bae6fd" stroke-width="6" stroke-linecap="round" stroke-dasharray="14 26" opacity=".9"/>
      <g><circle r="15" fill="none" stroke="#fb7185" stroke-width="9"/><circle r="15" fill="none" stroke="${INK}" stroke-width="3"/><circle r="6" fill="#86efac" stroke="${INK}" stroke-width="2.5"/><rect x="-5" y="-3" width="4" height="2.5" fill="${INK}"/><rect x="1" y="-3" width="4" height="2.5" fill="${INK}"/>
      <animateMotion dur="16s" repeatCount="indefinite" keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" path="M20 60 C 90 10, 160 130, 230 70 S 320 40, 330 120"/></g>
      <g fill="#16a34a"><circle cx="60" cy="140" r="16"/><circle cx="290" cy="40" r="14"/><circle cx="170" cy="30" r="12"/></g></svg>`,
    hottub: (u) => `<svg ${NS} viewBox="0 0 200 170"><defs><clipPath id="c${u}"><ellipse cx="100" cy="78" rx="62" ry="16"/></clipPath></defs>
      <g class="w-steam" fill="#fff" opacity=".6"><path d="M70 60 q10 -20 0 -35 q-8 -12 4 -20"/><ellipse cx="72" cy="40" rx="10" ry="16"/></g><g class="w-steam s2" fill="#fff" opacity=".55"><ellipse cx="100" cy="36" rx="12" ry="18"/></g><g class="w-steam s3" fill="#fff" opacity=".5"><ellipse cx="130" cy="42" rx="10" ry="15"/></g>
      <rect x="30" y="78" width="140" height="70" rx="14" fill="#b45309" stroke="${INK}" stroke-width="5"/><g stroke="#78350f" stroke-width="3">${[50, 70, 90, 110, 130, 150].map(x => `<line x1="${x}" y1="82" x2="${x}" y2="146"/>`).join('')}</g>
      <ellipse cx="100" cy="78" rx="78" ry="24" fill="#92400e" stroke="${INK}" stroke-width="5"/><ellipse cx="100" cy="78" rx="62" ry="16" fill="#38bdf8" stroke="${INK}" stroke-width="3"/>
      <g clip-path="url(#c${u})" fill="#e0f2fe"><circle class="w-bub" cx="80" cy="90" r="4"/><circle class="w-bub b2" cx="100" cy="92" r="5"/><circle class="w-bub b3" cx="120" cy="90" r="3.5"/><circle class="w-bub b4" cx="90" cy="94" r="3"/></g></svg>`,
    waterslide: (u) => `<svg ${NS} viewBox="0 0 260 250"><defs><clipPath id="c${u}"><ellipse cx="62" cy="214" rx="52" ry="16"/></clipPath></defs>
      <rect x="176" y="46" width="40" height="150" fill="#fbbf24" stroke="${INK}" stroke-width="5"/><g stroke="${INK}" stroke-width="4"><line x1="176" y1="80" x2="216" y2="80"/><line x1="176" y1="110" x2="216" y2="110"/><line x1="176" y1="140" x2="216" y2="140"/><line x1="176" y1="170" x2="216" y2="170"/></g>
      <rect x="160" y="34" width="70" height="14" rx="5" fill="#f59e0b" stroke="${INK}" stroke-width="4"/>
      <path d="M180 48 C 60 60, 30 140, 60 205" fill="none" stroke="${INK}" stroke-width="34" stroke-linecap="round"/><path d="M180 48 C 60 60, 30 140, 60 205" fill="none" stroke="#f472b6" stroke-width="26" stroke-linecap="round"/>
      <path class="w-fall" d="M180 48 C 60 60, 30 140, 60 205" fill="none" stroke="#bae6fd" stroke-width="7" stroke-linecap="round" stroke-dasharray="14 12"/>
      <ellipse cx="62" cy="214" rx="56" ry="20" fill="#e2e8f0" stroke="${INK}" stroke-width="4"/><ellipse cx="62" cy="214" rx="52" ry="16" fill="#38bdf8"/>
      <g clip-path="url(#c${u})" fill="none" stroke="#e0f2fe" stroke-width="4" stroke-linecap="round"><path class="w-wave" d="M-40 214 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0"/></g>
      <g fill="#bae6fd"><circle class="w-drop" cx="40" cy="196" r="4"/><circle class="w-drop d2" cx="80" cy="192" r="3.5"/><circle class="w-drop d3" cx="60" cy="190" r="3"/></g></svg>`,
    waterfall: (u) => `<svg ${NS} viewBox="0 0 220 240"><defs><clipPath id="c${u}"><ellipse cx="110" cy="205" rx="90" ry="24"/></clipPath><linearGradient id="g${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0284c7"/></linearGradient></defs>
      <polygon points="20,240 30,120 70,40 150,40 190,120 200,240" fill="#94a3b8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><polygon points="30,120 70,40 150,40 190,120 150,130 70,130" fill="#64748b"/>
      <rect x="82" y="40" width="56" height="170" fill="#7dd3fc"/>
      <g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-dasharray="18 14" opacity=".85"><path class="w-fall" d="M94 44 v170"/><path class="w-fall" d="M110 44 v170" style="animation-delay:-.2s"/><path class="w-fall" d="M126 44 v170" style="animation-delay:-.4s"/></g>
      <ellipse cx="110" cy="205" rx="94" ry="28" fill="#e2e8f0" stroke="${INK}" stroke-width="5"/><ellipse cx="110" cy="205" rx="90" ry="24" fill="url(#g${u})"/>
      <g clip-path="url(#c${u})" fill="none" stroke="#e0f2fe" stroke-width="5" stroke-linecap="round" opacity=".85"><path class="w-wave" d="M-40 200 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/><path class="w-wave w-wave2" d="M-40 214 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/></g>
      <g fill="#fff" opacity=".6"><ellipse class="w-steam" cx="80" cy="190" rx="14" ry="10"/><ellipse class="w-steam s2" cx="140" cy="192" rx="16" ry="10"/></g>
      <g fill="#16a34a"><circle cx="30" cy="150" r="18"/><circle cx="190" cy="160" r="20"/></g></svg>`,
    fountain: (u) => `<svg ${NS} viewBox="0 0 200 210"><defs><clipPath id="c${u}"><ellipse cx="100" cy="178" rx="80" ry="20"/></clipPath></defs>
      <ellipse cx="100" cy="178" rx="92" ry="28" fill="#e2e8f0" stroke="${INK}" stroke-width="5"/><ellipse cx="100" cy="178" rx="80" ry="20" fill="#38bdf8"/>
      <g clip-path="url(#c${u})" fill="none" stroke="#e0f2fe" stroke-width="4" stroke-linecap="round" opacity=".9"><path class="w-wave" d="M-40 176 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/></g>
      <rect x="88" y="100" width="24" height="70" fill="#cbd5e1" stroke="${INK}" stroke-width="4"/><ellipse cx="100" cy="100" rx="44" ry="14" fill="#e2e8f0" stroke="${INK}" stroke-width="4"/><ellipse cx="100" cy="98" rx="36" ry="9" fill="#38bdf8"/>
      <rect x="94" y="60" width="12" height="36" fill="#cbd5e1" stroke="${INK}" stroke-width="3"/>
      <g fill="none" stroke="#7dd3fc" stroke-width="5" stroke-linecap="round"><path d="M100 58 q-34 20 -44 60"/><path d="M100 58 q34 20 44 60"/><path d="M100 58 q-10 30 -8 46"/><path d="M100 58 q10 30 8 46"/></g>
      <g fill="#bae6fd"><circle class="w-drop" cx="56" cy="118" r="4"/><circle class="w-drop d2" cx="144" cy="118" r="4"/><circle class="w-drop d3" cx="100" cy="70" r="4"/></g><ellipse cx="100" cy="56" rx="6" ry="10" fill="#e0f2fe"/></svg>`,
    aquarium: (u) => `<svg ${NS} viewBox="0 0 260 220"><defs><clipPath id="c${u}"><rect x="24" y="34" width="212" height="162" rx="10"/></clipPath><linearGradient id="g${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0369a1"/></linearGradient></defs>
      <rect x="14" y="18" width="232" height="16" rx="6" fill="${INK}"/><rect x="20" y="30" width="220" height="170" rx="14" fill="url(#g${u})" stroke="${INK}" stroke-width="5"/>
      <g clip-path="url(#c${u})">
        <ellipse cx="130" cy="196" rx="120" ry="16" fill="#f59e0b"/><g fill="#fbbf24">${[40, 70, 100, 130, 160, 190, 220].map(x => `<circle cx="${x}" cy="190" r="6"/>`).join('')}</g>
        <g fill="none" stroke="#16a34a" stroke-width="8" stroke-linecap="round"><path d="M50 190 q16 -30 0 -60 q-14 -28 8 -50"/><path d="M205 190 q-14 -30 0 -60 q14 -30 -6 -50"/></g>
        <g class="w-fish"><ellipse cx="80" cy="90" rx="24" ry="14" fill="#fb923c" stroke="${INK}" stroke-width="3"/><polygon points="56,90 40,78 40,102" fill="#fb923c" stroke="${INK}" stroke-width="3"/><circle cx="90" cy="86" r="3" fill="${INK}"/></g>
        <g class="w-fish f2"><ellipse cx="70" cy="140" rx="18" ry="11" fill="#facc15" stroke="${INK}" stroke-width="3"/><polygon points="52,140 40,131 40,149" fill="#facc15" stroke="${INK}" stroke-width="3"/><circle cx="78" cy="137" r="2.5" fill="${INK}"/></g>
        <g class="w-fish f3"><ellipse cx="120" cy="60" rx="14" ry="8" fill="#f472b6" stroke="${INK}" stroke-width="3"/><polygon points="106,60 96,53 96,67" fill="#f472b6" stroke="${INK}" stroke-width="3"/><circle cx="126" cy="58" r="2" fill="${INK}"/></g>
        <g fill="#e0f2fe" opacity=".8"><circle class="w-bub" cx="180" cy="180" r="4"/><circle class="w-bub b2" cx="192" cy="184" r="3"/><circle class="w-bub b3" cx="170" cy="186" r="5"/><circle class="w-bub b4" cx="200" cy="180" r="2.5"/></g>
        <rect x="24" y="34" width="212" height="12" fill="#fff" opacity=".35"/>
      </g>
      <rect x="10" y="198" width="240" height="16" rx="6" fill="${INK}"/></svg>`,
    pond: (u) => `<svg ${NS} viewBox="0 0 220 150"><defs><clipPath id="c${u}"><path d="M20 90 C 10 40, 90 20, 130 40 C 190 30, 220 80, 190 115 C 160 145, 50 145, 20 90 Z"/></clipPath></defs>
      <path d="M20 90 C 10 40, 90 20, 130 40 C 190 30, 220 80, 190 115 C 160 145, 50 145, 20 90 Z" fill="#0ea5e9" stroke="${INK}" stroke-width="5"/>
      <g clip-path="url(#c${u})" fill="none" stroke="#bae6fd" stroke-width="4" stroke-linecap="round" opacity=".8"><path class="w-wave" d="M-40 80 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/><path class="w-wave w-wave2" d="M-40 110 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/></g>
      <g fill="#22c55e" stroke="${INK}" stroke-width="3"><path d="M70 70 m-16 0 a16 16 0 1 1 16 16 L70 70 Z"/><path d="M150 100 m-14 0 a14 14 0 1 1 14 14 L150 100 Z"/></g>
      <g fill="#f472b6"><circle cx="70" cy="62" r="6"/><circle cx="64" cy="70" r="6"/><circle cx="76" cy="70" r="6"/><circle cx="70" cy="68" r="4" fill="#fde047"/></g>
      <g class="w-float"><circle cx="112" cy="90" r="11" fill="#4ade80" stroke="${INK}" stroke-width="3"/><circle cx="106" cy="82" r="4" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="118" cy="82" r="4" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="106" cy="82" r="1.5" fill="${INK}"/><circle cx="118" cy="82" r="1.5" fill="${INK}"/></g>
      <g stroke="#65a30d" stroke-width="4" stroke-linecap="round"><line x1="190" y1="60" x2="196" y2="20"/><line x1="200" y1="66" x2="210" y2="30"/></g><ellipse cx="196" cy="18" rx="4" ry="9" fill="#78350f"/><ellipse cx="210" cy="28" rx="4" ry="9" fill="#78350f"/></svg>`,
    splashpad: (u) => `<svg ${NS} viewBox="0 0 220 170">
      <ellipse cx="110" cy="138" rx="102" ry="26" fill="#38bdf8" stroke="${INK}" stroke-width="5"/><g fill="#0284c7">${[40, 70, 100, 130, 160, 180].map((x, i) => `<circle cx="${x}" cy="${140 + (i % 2) * 8}" r="4"/>`).join('')}</g>
      <g fill="#7dd3fc">${[50, 80, 110, 140, 170].map((x, i) => `<rect class="w-jet ${i % 3 === 1 ? 'j2' : i % 3 === 2 ? 'j3' : ''}" x="${x - 4}" y="60" width="8" height="78" rx="4"/>`).join('')}</g>
      <g fill="#bae6fd">${[50, 80, 110, 140, 170].map((x, i) => `<circle class="w-drop ${i % 3 === 1 ? 'd2' : i % 3 === 2 ? 'd3' : ''}" cx="${x + (i % 2 ? 8 : -8)}" cy="56" r="4"/>`).join('')}</g>
      <g fill="#e0f2fe">${[50, 80, 110, 140, 170].map(x => `<circle cx="${x}" cy="60" r="6"/>`).join('')}</g></svg>`,
    submarine: (u) => `<svg ${NS} viewBox="0 0 240 140">
      <g class="w-spin"><ellipse cx="216" cy="86" rx="6" ry="20" fill="#94a3b8" stroke="${INK}" stroke-width="3"/><ellipse cx="216" cy="86" rx="20" ry="6" fill="#94a3b8" stroke="${INK}" stroke-width="3"/></g>
      <polygon points="180,60 210,50 210,120 180,110" fill="#f59e0b" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="110" cy="86" rx="95" ry="40" fill="#facc15" stroke="${INK}" stroke-width="5"/>
      <rect x="86" y="36" width="54" height="36" rx="10" fill="#facc15" stroke="${INK}" stroke-width="5"/><path d="M112 36 v-18 h20" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <g fill="#38bdf8" stroke="${INK}" stroke-width="4"><circle cx="60" cy="86" r="11"/><circle cx="100" cy="88" r="11"/><circle cx="140" cy="86" r="11"/></g>
      <g fill="#fff" opacity=".7"><circle class="w-bub" cx="120" cy="30" r="4"/><circle class="w-bub b2" cx="132" cy="26" r="3"/></g></svg>`,
    pirateship: (u) => `<svg ${NS} viewBox="0 0 260 240">
      <rect x="126" y="30" width="8" height="140" fill="#451a03"/>
      <path d="M134 50 L214 66 L214 126 L134 118 Z" fill="#f8fafc" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M126 60 L66 72 L66 116 L126 110 Z" fill="#f1f5f9" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <g class="w-flag"><rect x="134" y="26" width="44" height="24" fill="${INK}"/><circle cx="156" cy="36" r="6" fill="#fff"/><circle cx="153.5" cy="35" r="1.5" fill="${INK}"/><circle cx="158.5" cy="35" r="1.5" fill="${INK}"/><rect x="152" y="41" width="8" height="2" fill="#fff"/></g>
      <path d="M22 160 Q 34 224 130 224 Q 226 224 238 160 Z" fill="#92400e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M22 160 L238 160" stroke="${INK}" stroke-width="5"/><rect x="14" y="146" width="232" height="18" rx="6" fill="#b45309" stroke="${INK}" stroke-width="4"/>
      <g fill="#38bdf8" stroke="${INK}" stroke-width="3"><circle cx="80" cy="190" r="8"/><circle cx="130" cy="192" r="8"/><circle cx="180" cy="190" r="8"/></g>
      <path d="M0 226 q30 -14 60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/></svg>`,
    jetski: (u) => `<svg ${NS} viewBox="0 0 220 120">
      <g fill="#e0f2fe" opacity=".9"><circle class="w-drop" cx="26" cy="70" r="6"/><circle class="w-drop d2" cx="14" cy="80" r="5"/><circle class="w-drop d3" cx="36" cy="60" r="4"/></g>
      <path d="M30 92 L70 56 L160 50 Q 206 54 210 92 Z" fill="#ef4444" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M60 92 L200 92" stroke="#fff" stroke-width="6" opacity=".6"/>
      <rect x="96" y="44" width="70" height="18" rx="9" fill="${INK}"/><path d="M84 56 v-22 h26" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="110" cy="34" r="4" fill="#fbbf24"/>
      <path d="M0 100 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#38bdf8" stroke-width="8" stroke-linecap="round"/></svg>`,
    slide: (u) => `<svg ${NS} viewBox="0 0 220 210">
      <rect x="150" y="60" width="14" height="140" fill="#2563eb" stroke="${INK}" stroke-width="4"/><rect x="190" y="60" width="14" height="140" fill="#2563eb" stroke="${INK}" stroke-width="4"/>
      <g stroke="${INK}" stroke-width="4"><line x1="164" y1="90" x2="190" y2="90"/><line x1="164" y1="120" x2="190" y2="120"/><line x1="164" y1="150" x2="190" y2="150"/><line x1="164" y1="180" x2="190" y2="180"/></g>
      <rect x="140" y="46" width="74" height="16" rx="6" fill="#fbbf24" stroke="${INK}" stroke-width="4"/>
      <path d="M150 58 C 70 70, 40 140, 24 196" fill="none" stroke="${INK}" stroke-width="30" stroke-linecap="round"/><path d="M150 58 C 70 70, 40 140, 24 196" fill="none" stroke="#f59e0b" stroke-width="22" stroke-linecap="round"/><path d="M150 58 C 70 70, 40 140, 24 196" fill="none" stroke="#fde68a" stroke-width="6" stroke-linecap="round"/></svg>`,
    trampoline: (u) => `<svg ${NS} viewBox="0 0 220 140">
      <g stroke="${INK}" stroke-width="6" stroke-linecap="round"><line x1="40" y1="70" x2="30" y2="130"/><line x1="180" y1="70" x2="190" y2="130"/><line x1="110" y1="76" x2="110" y2="130"/></g>
      <g class="w-boing"><ellipse cx="110" cy="62" rx="104" ry="24" fill="#2563eb" stroke="${INK}" stroke-width="5"/><ellipse cx="110" cy="62" rx="84" ry="16" fill="#1e293b" stroke="${INK}" stroke-width="3"/></g>
      <g class="w-bub" style="animation-duration:1.6s"><circle cx="110" cy="40" r="12" fill="#f472b6" stroke="${INK}" stroke-width="3"/></g></svg>`,
    swingset: (u) => `<svg ${NS} viewBox="0 0 240 200">
      <g stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"><path d="M30 190 L60 30 L90 190"/><path d="M150 190 L180 30 L210 190"/><line x1="60" y1="30" x2="180" y2="30"/></g>
      <g class="w-swing"><g transform="translate(0 0)"><line x1="100" y1="34" x2="100" y2="130" stroke="#78350f" stroke-width="4"/><line x1="124" y1="34" x2="124" y2="130" stroke="#78350f" stroke-width="4"/><rect x="92" y="128" width="40" height="10" rx="4" fill="#ef4444" stroke="${INK}" stroke-width="3"/></g></g>
      <g class="w-swing g2"><line x1="140" y1="34" x2="140" y2="130" stroke="#78350f" stroke-width="4"/><line x1="164" y1="34" x2="164" y2="130" stroke="#78350f" stroke-width="4"/><rect x="132" y="128" width="40" height="10" rx="4" fill="#fbbf24" stroke="${INK}" stroke-width="3"/></g></svg>`,
    treehouse: (u) => `<svg ${NS} viewBox="0 0 240 260">
      <rect x="104" y="130" width="32" height="130" fill="#92400e" stroke="${INK}" stroke-width="5"/>
      <g fill="#16a34a" stroke="${INK}" stroke-width="5"><circle cx="70" cy="110" r="46"/><circle cx="170" cy="110" r="46"/><circle cx="120" cy="70" r="50"/></g><g fill="#22c55e"><circle cx="90" cy="90" r="20"/><circle cx="150" cy="80" r="18"/></g>
      <rect x="70" y="100" width="100" height="66" fill="#fbbf24" stroke="${INK}" stroke-width="5"/><polygon points="62,100 120,58 178,100" fill="#ef4444" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <rect x="86" y="116" width="26" height="24" fill="#7dd3fc" stroke="${INK}" stroke-width="4"/><rect x="128" y="120" width="22" height="46" rx="6" fill="#78350f" stroke="${INK}" stroke-width="4"/>
      <g stroke="${INK}" stroke-width="4"><line x1="150" y1="170" x2="150" y2="250"/><line x1="170" y1="170" x2="170" y2="250"/><line x1="150" y1="190" x2="170" y2="190"/><line x1="150" y1="210" x2="170" y2="210"/><line x1="150" y1="230" x2="170" y2="230"/></g></svg>`,
    lighthouse: (u) => `<svg ${NS} viewBox="0 0 200 270">
      <g class="w-beam" fill="#fde047"><polygon points="100,52 0,20 0,84"/><polygon points="100,52 200,20 200,84"/></g>
      <polygon points="66,250 84,80 116,80 134,250" fill="#f8fafc" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
      <g fill="#ef4444"><polygon points="82,105 118,105 121,135 79,135"/><polygon points="77,165 123,165 126,195 74,195"/><polygon points="72,225 128,225 130,250 70,250"/></g>
      <rect x="80" y="40" width="40" height="40" rx="6" fill="#fde047" stroke="${INK}" stroke-width="5"/><path d="M76 40 q24 -30 48 0" fill="#ef4444" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="100" cy="252" rx="60" ry="14" fill="#64748b" stroke="${INK}" stroke-width="5"/></svg>`,
    portal: (u) => `<svg ${NS} viewBox="0 0 200 200"><defs><radialGradient id="g${u}"><stop offset="0" stop-color="#1e1b4b"/><stop offset=".6" stop-color="#7c3aed"/><stop offset="1" stop-color="#22d3ee"/></radialGradient></defs>
      <g class="w-glow"><circle cx="100" cy="100" r="84" fill="none" stroke="#22d3ee" stroke-width="12" opacity=".9"/><circle cx="100" cy="100" r="72" fill="url(#g${u})" stroke="${INK}" stroke-width="5"/></g>
      <g class="w-spin" style="animation-duration:6s"><path d="M100 40 a60 60 0 0 1 52 30" fill="none" stroke="#e0f2fe" stroke-width="6" stroke-linecap="round" opacity=".8"/><path d="M100 160 a60 60 0 0 1 -52 -30" fill="none" stroke="#e0f2fe" stroke-width="6" stroke-linecap="round" opacity=".8"/></g>
      <g fill="#fff"><circle class="w-bub" cx="80" cy="120" r="3"/><circle class="w-bub b2" cx="120" cy="130" r="4"/><circle class="w-bub b3" cx="100" cy="110" r="2.5"/></g></svg>`,
    hoverboard: (u) => `<svg ${NS} viewBox="0 0 220 110">
      <g class="w-glow" fill="#22d3ee" opacity=".7"><ellipse cx="60" cy="86" rx="30" ry="9"/><ellipse cx="160" cy="86" rx="30" ry="9"/></g>
      <g class="w-float"><rect x="16" y="40" width="188" height="24" rx="12" fill="#7c3aed" stroke="${INK}" stroke-width="5"/><rect x="40" y="46" width="140" height="6" rx="3" fill="#c4b5fd"/><circle cx="60" cy="52" r="5" fill="#22d3ee"/><circle cx="160" cy="52" r="5" fill="#22d3ee"/></g></svg>`,
    sign: (u, label) => { const t = (label || 'LEO’S WORLD').slice(0, 18); const fs = t.length > 10 ? Math.max(14, Math.round(26 * 10 / t.length)) : 26; return `<svg ${NS} viewBox="0 0 220 170">
      <rect x="100" y="86" width="20" height="84" fill="#92400e" stroke="${INK}" stroke-width="4"/><rect x="16" y="18" width="188" height="72" rx="12" fill="#fbbf24" stroke="${INK}" stroke-width="5"/>
      <text x="110" y="63" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="${fs}" fill="${INK}">${esc(t)}</text></svg>`; },
  };

  /* ============================== THE CATALOG ============================== */
  const CATS = [
    { id: 'water', e: '💧', name: 'Water' }, { id: 'sea', e: '🐠', name: 'Sea friends' }, { id: 'rides', e: '🎢', name: 'Rides & boats' },
    { id: 'nature', e: '🌴', name: 'Nature' }, { id: 'future', e: '🚀', name: 'Future' }, { id: 'animals', e: '🦖', name: 'Creatures' },
    { id: 'home', e: '🛋️', name: 'Home & treats' }, { id: 'vehicles', e: '🚗', name: 'Vehicles' }, { id: 'build', e: '🏰', name: 'Buildings' },
  ];
  const V = (id, cat, name, price, w, svg) => ({ id, cat, name, price, w, svg });
  const E = (id, cat, name, e, price, w = .14) => ({ id, cat, name, e, price, w });
  const ITEMS = [
    V('pool', 'water', 'Big pool', 20, .42, S.pool), V('roundpool', 'water', 'Round pool', 14, .3, S.roundpool), V('lazyriver', 'water', 'Lazy river', 25, .5, S.lazyriver),
    V('hottub', 'water', 'Hot tub', 8, .22, S.hottub), V('waterslide', 'water', 'Water slide', 18, .3, S.waterslide), V('waterfall', 'water', 'Waterfall', 12, .26, S.waterfall),
    V('fountain', 'water', 'Fountain', 6, .2, S.fountain), V('aquarium', 'water', 'Aquarium', 15, .3, S.aquarium), V('pond', 'water', 'Pond', 5, .26, S.pond),
    V('splashpad', 'water', 'Splash pad', 9, .26, S.splashpad), E('bathtub', 'water', 'Bathtub', '🛁', 3, .16), E('wave', 'water', 'Wave', '🌊', 2, .16), E('drop', 'water', 'Water drop', '💧', 0, .08), E('ice', 'water', 'Ice block', '🧊', 1, .1),
    E('dolphin', 'sea', 'Dolphin', '🐬', 4), E('shark', 'sea', 'Shark', '🦈', 5, .16), E('octopus', 'sea', 'Octopus', '🐙', 4), E('whale', 'sea', 'Whale', '🐳', 6, .2), E('turtle', 'sea', 'Turtle', '🐢', 3, .12),
    E('tropfish', 'sea', 'Tropical fish', '🐠', 1, .1), E('fish', 'sea', 'Fish', '🐟', 0, .09), E('crab', 'sea', 'Crab', '🦀', 2, .1), E('seal', 'sea', 'Seal', '🦭', 3, .12), E('mermaid', 'sea', 'Mermaid', '🧜', 5, .14),
    E('squid', 'sea', 'Squid', '🦑', 3, .12), E('lobster', 'sea', 'Lobster', '🦞', 2, .1), E('shrimp', 'sea', 'Shrimp', '🦐', 1, .08), E('puffer', 'sea', 'Puffer fish', '🐡', 2, .1), E('shell', 'sea', 'Shell', '🐚', 0, .07), E('anchor', 'sea', 'Anchor', '⚓', 2, .1),
    E('sailboat', 'rides', 'Sailboat', '⛵', 5, .16), E('speedboat', 'rides', 'Speedboat', '🚤', 6, .16), E('ship', 'rides', 'Big ship', '🚢', 10, .22), E('canoe', 'rides', 'Canoe', '🛶', 3, .14),
    V('submarine', 'rides', 'Submarine', 9, .24, S.submarine), V('pirateship', 'rides', 'Pirate ship', 14, .28, S.pirateship), V('jetski', 'rides', 'Jet ski', 6, .2, S.jetski), E('surf', 'rides', 'Surfer', '🏄', 3, .12),
    E('coaster', 'rides', 'Roller coaster', '🎢', 25, .34), E('ferris', 'rides', 'Ferris wheel', '🎡', 20, .28), E('carousel', 'rides', 'Carousel', '🎠', 12, .2), V('slide', 'rides', 'Slide', 8, .22, S.slide),
    V('trampoline', 'rides', 'Trampoline', 7, .22, S.trampoline), V('swingset', 'rides', 'Swing set', 6, .24, S.swingset), E('kite', 'rides', 'Kite', '🪁', 1, .1), E('balloon', 'rides', 'Balloon', '🎈', 1, .09), E('circus', 'rides', 'Circus tent', '🎪', 10, .24),
    E('palm', 'nature', 'Palm tree', '🌴', 2, .2), E('tree', 'nature', 'Tree', '🌳', 2, .2), E('pine', 'nature', 'Pine tree', '🌲', 2, .2), E('cactus', 'nature', 'Cactus', '🌵', 1, .14), E('blossom', 'nature', 'Blossom', '🌸', 0, .08),
    E('sunflower', 'nature', 'Sunflower', '🌻', 1, .1), E('hibiscus', 'nature', 'Hibiscus', '🌺', 1, .09), E('tulip', 'nature', 'Tulip', '🌷', 1, .08), E('mushroom', 'nature', 'Mushroom', '🍄', 1, .1), E('rainbow', 'nature', 'Rainbow', '🌈', 6, .3),
    E('sun', 'nature', 'Sun', '☀️', 3, .14), E('cloud', 'nature', 'Cloud', '☁️', 1, .16), E('moon', 'nature', 'Moon', '🌙', 3, .12), E('star', 'nature', 'Star', '⭐', 1, .08), E('volcano', 'nature', 'Volcano', '🌋', 8, .28),
    E('mountain', 'nature', 'Mountain', '🏔️', 5, .3), E('rock', 'nature', 'Rock', '🪨', 0, .1), E('coconut', 'nature', 'Coconut', '🥥', 1, .07), E('pineapple', 'nature', 'Pineapple', '🍍', 1, .08), E('umbrella', 'nature', 'Beach umbrella', '🏖️', 3, .16),
    E('campfire', 'nature', 'Campfire', '🔥', 2, .12), E('tent', 'nature', 'Tent', '⛺', 4, .18), E('snowflake', 'nature', 'Snowflake', '❄️', 1, .09), E('snowman', 'nature', 'Snowman', '⛄', 3, .14),
    E('rocket', 'future', 'Rocket', '🚀', 8, .18), E('ufo', 'future', 'UFO', '🛸', 7, .2), E('robot', 'future', 'Robot', '🤖', 6, .14), E('satellite', 'future', 'Satellite', '🛰️', 4, .16), E('alien', 'future', 'Alien', '👽', 3, .12),
    V('portal', 'future', 'Portal', 10, .22, S.portal), V('hoverboard', 'future', 'Hoverboard', 5, .2, S.hoverboard), E('crystal', 'future', 'Crystal ball', '🔮', 2, .1), E('zap', 'future', 'Lightning', '⚡', 1, .1), E('gem', 'future', 'Gem', '💎', 3, .09),
    E('magnet', 'future', 'Magnet', '🧲', 1, .1), E('planet', 'future', 'Planet', '🪐', 5, .2), E('shooting', 'future', 'Shooting star', '🌠', 2, .16),
    E('trex', 'animals', 'T. rex', '🦖', 6, .2), E('bronto', 'animals', 'Long-neck dino', '🦕', 6, .2), E('dragon', 'animals', 'Dragon', '🐉', 9, .22), E('unicorn', 'animals', 'Unicorn', '🦄', 7, .16), E('cat', 'animals', 'Cat', '🐱', 2, .1),
    E('dog', 'animals', 'Dog', '🐶', 2, .1), E('lion', 'animals', 'Lion', '🦁', 4, .13), E('monkey', 'animals', 'Monkey', '🐵', 3, .11), E('parrot', 'animals', 'Parrot', '🦜', 3, .11), E('penguin', 'animals', 'Penguin', '🐧', 2, .11),
    E('elephant', 'animals', 'Elephant', '🐘', 5, .18), E('giraffe', 'animals', 'Giraffe', '🦒', 5, .18), E('butterfly', 'animals', 'Butterfly', '🦋', 1, .09), E('bee', 'animals', 'Bee', '🐝', 1, .07), E('frog', 'animals', 'Frog', '🐸', 1, .09),
    E('panda', 'animals', 'Panda', '🐼', 4, .13), E('bear', 'animals', 'Bear', '🐻', 3, .13), E('koala', 'animals', 'Koala', '🐨', 3, .12), E('flamingo', 'animals', 'Flamingo', '🦩', 3, .14), E('croc', 'animals', 'Crocodile', '🐊', 4, .16),
    E('bed', 'home', 'Bed', '🛏️', 4, .22), E('couch', 'home', 'Couch', '🛋️', 4, .22), E('chair', 'home', 'Chair', '🪑', 1, .12), E('tv', 'home', 'TV', '📺', 3, .16), E('gamepad', 'home', 'Game controller', '🎮', 3, .12),
    E('teddy', 'home', 'Teddy bear', '🧸', 2, .12), E('books', 'home', 'Books', '📚', 1, .12), E('piano', 'home', 'Piano', '🎹', 5, .18), E('guitar', 'home', 'Guitar', '🎸', 3, .14), E('drum', 'home', 'Drum', '🥁', 3, .14),
    E('cake', 'home', 'Cake', '🎂', 2, .12), E('pizza', 'home', 'Pizza', '🍕', 2, .11), E('icecream', 'home', 'Ice cream', '🍦', 1, .1), E('donut', 'home', 'Donut', '🍩', 1, .1), E('popcorn', 'home', 'Popcorn', '🍿', 1, .1),
    E('gift', 'home', 'Gift', '🎁', 2, .11), E('trophy', 'home', 'Trophy', '🏆', 3, .12), E('crown', 'home', 'Crown', '👑', 4, .12), E('picture', 'home', 'Picture frame', '🖼️', 1, .14), E('plant', 'home', 'House plant', '🪴', 1, .12),
    E('darts', 'home', 'Dartboard', '🎯', 2, .12), E('bowling', 'home', 'Bowling', '🎳', 2, .12), E('soccer', 'home', 'Soccer ball', '⚽', 1, .08), E('bball', 'home', 'Basketball', '🏀', 1, .08), E('skate', 'home', 'Skateboard', '🛹', 2, .12),
    E('car', 'vehicles', 'Car', '🚗', 3, .16), E('racecar', 'vehicles', 'Race car', '🏎️', 5, .18), E('truck', 'vehicles', 'Truck', '🚚', 3, .18), E('firetruck', 'vehicles', 'Fire truck', '🚒', 4, .18), E('police', 'vehicles', 'Police car', '🚓', 3, .16),
    E('bus', 'vehicles', 'Bus', '🚌', 3, .18), E('train', 'vehicles', 'Train', '🚂', 5, .2), E('plane', 'vehicles', 'Airplane', '✈️', 6, .2), E('heli', 'vehicles', 'Helicopter', '🚁', 5, .18), E('bike', 'vehicles', 'Bike', '🚲', 2, .14),
    E('scooter', 'vehicles', 'Scooter', '🛴', 1, .12), E('moped', 'vehicles', 'Moped', '🛵', 2, .14), E('tractor', 'vehicles', 'Tractor', '🚜', 3, .16),
    E('castle', 'build', 'Castle', '🏰', 12, .3), E('house', 'build', 'House', '🏠', 6, .22), E('tower', 'build', 'Tower', '🗼', 8, .22), V('treehouse', 'build', 'Treehouse', 9, .26, S.treehouse), V('lighthouse', 'build', 'Lighthouse', 7, .18, S.lighthouse),
    E('bridge', 'build', 'Bridge', '🌉', 6, .3), E('statue', 'build', 'Statue', '🗽', 5, .16), E('stadium', 'build', 'Stadium', '🏟️', 10, .3), E('office', 'build', 'Tall building', '🏢', 5, .2), E('shrine', 'build', 'Gate', '⛩️', 4, .2),
    V('sign', 'build', 'Sign (your words!)', 1, .22, S.sign), E('cone', 'build', 'Traffic cone', '🚧', 1, .1),
  ];
  const DEF = Object.fromEntries(ITEMS.map(d => [d.id, d]));

  /* ============================== STATE ============================== */
  const KEY = 'cb:world';
  const fresh = () => ({ v: 1, bg: { type: 'scene', id: 'bedroom' }, items: [], strokes: [] });
  let world = (() => { try { const w = JSON.parse(localStorage.getItem(KEY) || 'null'); if (w && Array.isArray(w.items)) { w.strokes = w.strokes || []; w.items = w.items.filter(it => DEF[it.kind]); return w; } } catch (e) {} return fresh(); })();
  let selected = null, drawing = false, eraser = false, color = '#2563eb', brush = .014;
  const undo = [];

  const STAGE = $('#stage'), BG = $('#bg'), LAYER = $('#items'), DRAW = $('#draw'), HINT = $('#hint'), TOOLS = $('#tools'), SHELF = $('#shelf'), CATSEL = $('#cats');
  const stageRect = () => STAGE.getBoundingClientRect();

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(world)); }
    catch (e) {
      if (world.bg.type === 'photo') { try { localStorage.setItem(KEY, JSON.stringify({ ...world, bg: { type: 'scene', id: 'bedroom' } })); toast('That photo is too big to remember. It stays until you leave this page.'); } catch (e2) {} }
    }
  }
  function pushUndo() { undo.push(JSON.stringify({ items: world.items, strokes: world.strokes, wallet: Wallet.get() })); if (undo.length > 40) undo.shift(); }

  /* ============================== RENDER ============================== */
  function renderBg() {
    if (world.bg.type === 'photo') { BG.innerHTML = `<img alt="" src="${world.bg.data}">`; }
    else { const sc = SCENES[world.bg.id] || SCENES.bedroom; BG.innerHTML = sc.svg; }
  }
  function placeEl(d, it) {
    const def = DEF[it.kind]; const W = stageRect().width; const w = def.w * W;
    d.style.width = w + 'px'; d.style.left = (it.x * 100) + '%'; d.style.top = (it.y * 100) + '%'; d.style.zIndex = 10 + it.z;
    d.style.transform = `translate(-50%,-50%) scale(${it.s})${it.flip ? ' scaleX(-1)' : ''}`;
    const em = d.querySelector('.em'); if (em) em.style.fontSize = (w * .85) + 'px';
  }
  function makeEl(it) {
    const def = DEF[it.kind]; const d = document.createElement('div'); d.className = 'it'; d.dataset.uid = it.uid;
    d.innerHTML = def.svg ? def.svg(it.uid, it.label) : `<span class="em">${def.e}</span>`;
    placeEl(d, it); return d;
  }
  function render() {
    world.items.sort((a, b) => a.z - b.z).forEach((it, i) => { it.z = i; });
    LAYER.innerHTML = '';
    world.items.forEach(it => { const d = makeEl(it); if (selected && selected.uid === it.uid) d.classList.add('sel'); LAYER.appendChild(d); });
    TOOLS.hidden = !selected; if (selected) $('#sellPrice').textContent = DEF[selected.kind].price;
    HINT.hidden = world.items.length > 0 || world.strokes.length > 0;
  }
  function replaceAll() { $$('.it', LAYER).forEach(d => { const it = world.items.find(x => x.uid === d.dataset.uid); if (it) placeEl(d, it); }); }
  function select(it) { selected = it; $$('.it', LAYER).forEach(d => d.classList.toggle('sel', !!it && d.dataset.uid === it.uid)); TOOLS.hidden = !it; if (it) $('#sellPrice').textContent = DEF[it.kind].price; }

  // drawing layer
  const dctx = DRAW.getContext('2d');
  function sizeDraw() { const r = stageRect(); const dpr = Math.min(2, devicePixelRatio || 1); DRAW.width = Math.round(r.width * dpr); DRAW.height = Math.round(r.height * dpr); redraw(); }
  function strokePath(st, W, H) {
    dctx.globalCompositeOperation = st.c === 'erase' ? 'destination-out' : 'source-over';
    dctx.strokeStyle = st.c === 'erase' ? '#000' : st.c; dctx.lineWidth = Math.max(2, st.w * W); dctx.lineCap = 'round'; dctx.lineJoin = 'round';
    dctx.beginPath(); st.pts.forEach(([x, y], i) => { if (i === 0) dctx.moveTo(x * W, y * H); else dctx.lineTo(x * W, y * H); }); if (st.pts.length === 1) dctx.lineTo(st.pts[0][0] * W + .1, st.pts[0][1] * H); dctx.stroke();
  }
  function redraw() { const W = DRAW.width, H = DRAW.height; dctx.clearRect(0, 0, W, H); world.strokes.forEach(st => strokePath(st, W, H)); dctx.globalCompositeOperation = 'source-over'; }

  new ResizeObserver(() => { replaceAll(); sizeDraw(); }).observe(STAGE);

  /* ============================== DRAG & SELECT ============================== */
  LAYER.addEventListener('pointerdown', e => {
    if (drawing) return;
    const d = e.target.closest('.it');
    if (!d) { select(null); return; }
    e.preventDefault();
    const it = world.items.find(x => x.uid === d.dataset.uid); if (!it) return;
    select(it); pushUndo(); SFX.tap();
    const r = stageRect(); const ox = e.clientX - (r.left + it.x * r.width), oy = e.clientY - (r.top + it.y * r.height);
    let moved = false;
    const mv = ev => { moved = true; it.x = clamp((ev.clientX - ox - r.left) / r.width, 0, 1); it.y = clamp((ev.clientY - oy - r.top) / r.height, 0, 1); placeEl(d, it); };
    const up = () => { d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); d.removeEventListener('pointercancel', up); if (moved) { SFX.pop(); save(); } else undo.pop(); };
    try { d.setPointerCapture(e.pointerId); } catch (err) {}
    d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
  });
  TOOLS.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !selected) return;
    const it = selected; const act = b.dataset.act;
    if (act === 'sell') { sell(it); return; }
    pushUndo();
    if (act === 'bigger') it.s = Math.min(3, it.s * 1.18);
    if (act === 'smaller') it.s = Math.max(.35, it.s / 1.18);
    if (act === 'flip') it.flip = !it.flip;
    if (act === 'front') it.z = Math.max(-1, ...world.items.map(x => x.z)) + 1;
    if (act === 'back') it.z = Math.min(0, ...world.items.map(x => x.z)) - 1;
    SFX.tap(); render(); save();
  });

  /* ============================== SHOP ============================== */
  let cat = CATS[0].id;
  function renderCats() {
    CATSEL.innerHTML = '';
    CATS.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', c.id === cat); b.innerHTML = `${c.e}<small>${esc(c.name)}</small>`; b.onclick = () => { cat = c.id; SFX.tap(); renderCats(); renderShelf(); }; CATSEL.appendChild(b); });
  }
  function renderShelf() {
    SHELF.innerHTML = ''; const bucks = Wallet.get();
    ITEMS.filter(d => d.cat === cat).forEach((d, i) => {
      const t = document.createElement('button'); t.type = 'button'; t.className = 'tile' + (d.price === 0 ? ' free' : '') + (d.price > bucks ? ' locked' : ''); t.dataset.id = d.id; t.style.animationDelay = (i * .025) + 's';
      t.innerHTML = `<span class="thumb">${d.svg ? d.svg('t' + d.id, 'HELLO') : d.e}</span><span class="nm">${esc(d.name)}</span><span class="pr">${d.price === 0 ? 'FREE' : '$' + d.price}</span>`;
      t.setAttribute('aria-label', `${d.name}, ${d.price === 0 ? 'free' : '$' + d.price}`);
      t.onclick = () => buy(d, t); SHELF.appendChild(t);
    });
  }
  function refreshLocks() { const bucks = Wallet.get(); $$('.tile', SHELF).forEach(t => t.classList.toggle('locked', DEF[t.dataset.id].price > bucks)); $('#needBucks').hidden = bucks >= 1; }
  function buy(def, tile) {
    if (Wallet.get() < def.price) {
      SFX.buzz(); const w = $('#wallet'); w.classList.remove('sad'); void w.offsetWidth; w.classList.add('sad');
      if (tile) { tile.classList.remove('shake'); void tile.offsetWidth; tile.classList.add('shake'); }
      toast(`Need $${def.price - Wallet.get()} more for the ${def.name}. Drag coins into the piggy! 🐷`); $('#needBucks').hidden = false; return;
    }
    let label;
    if (def.id === 'sign') { label = (prompt('What should the sign say?', 'LEO’S WORLD') || '').trim(); if (!label) return; }
    pushUndo(); Wallet.add(-def.price);
    const it = { uid: uid(), kind: def.id, x: .5 + (Math.random() - .5) * .14, y: .55 + (Math.random() - .5) * .14, s: 1, flip: false, z: world.items.length, label };
    world.items.push(it); selected = it; render(); save();
    const d = LAYER.querySelector(`[data-uid="${it.uid}"]`); if (d) d.classList.add('drop');
    if (def.price > 0) SFX.chaChing(); else SFX.pop();
    if (def.price >= 15) { SFX.cheer(); confetti(120); } else if (def.price >= 8) confetti(50);
    toast(def.price ? `You bought a ${def.name} for $${def.price}! Drag it anywhere. 👆` : `Free ${def.name}! Drag it anywhere. 👆`);
  }
  function sell(it) {
    const def = DEF[it.kind]; pushUndo();
    world.items = world.items.filter(x => x !== it); selected = null; Wallet.add(def.price); render(); save();
    SFX.chaChing(); toast(def.price ? `Sold the ${def.name} for $${def.price}. Your bucks are back! 💰` : `Removed the ${def.name}.`);
  }
  $('#surpriseBtn').onclick = () => {
    const bucks = Wallet.get(); let pool = ITEMS.filter(d => d.price <= bucks && d.id !== 'sign'); const paid = pool.filter(d => d.price > 0); if (paid.length) pool = paid;
    if (!pool.length) { toast('Nothing in the shop for $0 yet. Fill the piggy first! 🐷'); return; }
    buy(pick(pool));
  };

  /* ============================== SCENES + PHOTO ============================== */
  function renderScenes() {
    const box = $('#scenes'); box.innerHTML = '';
    Object.entries(SCENES).forEach(([id, sc]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'scene'; b.setAttribute('aria-pressed', world.bg.type === 'scene' && world.bg.id === id);
      b.innerHTML = `<span class="prev">${sc.svg}</span><b>${sc.e} ${esc(sc.name)}</b>`;
      b.onclick = () => { world.bg = { type: 'scene', id }; renderBg(); save(); SFX.ding(); $('#sceneSheet').hidden = true; toast(`Welcome to the ${sc.name}! 🎉`); };
      box.appendChild(b);
    });
  }
  $('#sceneBtn').onclick = () => { renderScenes(); $('#sceneSheet').hidden = false; SFX.tap(); };
  $('#sceneClose').onclick = () => { $('#sceneSheet').hidden = true; };
  $('#sceneSheet').addEventListener('click', e => { if (e.target.id === 'sceneSheet') $('#sceneSheet').hidden = true; });
  const openPhoto = () => { $('#sceneSheet').hidden = true; $('#photoInput').value = ''; $('#photoInput').click(); };
  $('#photoBtn').onclick = openPhoto; $('#sheetPhoto').onclick = openPhoto;
  $('#photoInput').addEventListener('change', e => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    toast('Getting your photo ready… 📷');
    const rd = new FileReader();
    rd.onload = () => {
      const im = new Image();
      im.onload = () => {
        const MAX = 1400; const k = Math.min(1, MAX / Math.max(im.naturalWidth, im.naturalHeight));
        const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        world.bg = { type: 'photo', data: c.toDataURL('image/jpeg', .82) }; renderBg(); save(); SFX.levelUp(); confetti(80);
        toast('Your room is the world now! Buy stuff and drag it in. 🏠');
      };
      im.onerror = () => toast('That picture did not open. Try another one.');
      im.src = rd.result;
    };
    rd.readAsDataURL(f);
  });

  /* ============================== DRAW MODE ============================== */
  const COLORS = ['#052e16', '#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#2563eb', '#a855f7', '#f472b6', '#ffffff'];
  const colorsEl = $('#colors');
  COLORS.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.style.background = c; b.setAttribute('aria-label', 'Color ' + c); b.classList.toggle('on', c === color); b.onclick = () => { color = c; eraser = false; $('#eraserBtn').classList.remove('on'); $$('button', colorsEl).forEach(x => x.classList.toggle('on', x === b)); SFX.tap(); }; colorsEl.appendChild(b); });
  $$('.sizes button').forEach(b => b.onclick = () => { brush = +b.dataset.size; $$('.sizes button').forEach(x => x.classList.toggle('on', x === b)); SFX.tap(); });
  $('#eraserBtn').onclick = () => { eraser = !eraser; $('#eraserBtn').classList.toggle('on', eraser); SFX.tap(); };
  function setDrawing(on) { drawing = on; STAGE.classList.toggle('drawing', on); $('#drawbar').hidden = !on; $('#drawBtn').classList.toggle('on', on); if (on) { select(null); toast('Draw with your finger! Tap ✓ Done when you finish. ✏️'); } }
  $('#drawBtn').onclick = () => setDrawing(!drawing); $('#drawDone').onclick = () => setDrawing(false);
  DRAW.addEventListener('pointerdown', e => {
    if (!drawing) return; e.preventDefault(); pushUndo();
    const r = stageRect(); const st = { c: eraser ? 'erase' : color, w: eraser ? brush * 2.2 : brush, pts: [[(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]] };
    world.strokes.push(st); redraw();
    const mv = ev => { st.pts.push([clamp((ev.clientX - r.left) / r.width, 0, 1), clamp((ev.clientY - r.top) / r.height, 0, 1)]); redraw(); };
    const up = () => { DRAW.removeEventListener('pointermove', mv); DRAW.removeEventListener('pointerup', up); DRAW.removeEventListener('pointercancel', up); save(); HINT.hidden = true; };
    try { DRAW.setPointerCapture(e.pointerId); } catch (err) {}
    DRAW.addEventListener('pointermove', mv); DRAW.addEventListener('pointerup', up); DRAW.addEventListener('pointercancel', up);
  });

  /* ============================== UNDO / START OVER / SNAPSHOT ============================== */
  $('#undoBtn').onclick = () => {
    const s = undo.pop(); if (!s) { SFX.buzz(); toast('Nothing to undo yet.'); return; }
    const st = JSON.parse(s); world.items = st.items.filter(it => DEF[it.kind]); world.strokes = st.strokes; Wallet.set(st.wallet); selected = null; render(); redraw(); save(); SFX.pop(); toast('Undone! ↩️');
  };
  $('#newBtn').onclick = () => {
    const refund = world.items.reduce((s, it) => s + DEF[it.kind].price, 0);
    if ((world.items.length || world.strokes.length || world.bg.type === 'photo') && !confirm(`Start a brand-new world? Everything here gets sold back${refund ? ` (you get $${refund} back)` : ''}.`)) return;
    pushUndo(); Wallet.add(refund); world = fresh(); selected = null; renderBg(); render(); redraw(); save(); SFX.levelUp(); toast(refund ? `Fresh start! $${refund} came back to your wallet. 💰` : 'Fresh start! 🧹');
  };
  const loadImg = src => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  const svgUrl = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  function drawCover(x, im, W, H, anchorBottom) { const k = Math.max(W / im.naturalWidth, H / im.naturalHeight); const w = im.naturalWidth * k, h = im.naturalHeight * k; x.drawImage(im, (W - w) / 2, anchorBottom ? H - h : (H - h) / 2, w, h); }
  async function snapshot() {
    const r = stageRect(); const W = Math.round(r.width * 2), H = Math.round(r.height * 2);
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#bae6fd'; x.fillRect(0, 0, W, H);
    try { const im = await loadImg(world.bg.type === 'photo' ? world.bg.data : svgUrl((SCENES[world.bg.id] || SCENES.bedroom).svg.replace('preserveAspectRatio="xMidYMax slice"', '').replace('<svg ', '<svg width="1200" height="800" '))); drawCover(x, im, W, H, world.bg.type !== 'photo'); } catch (e) {}
    x.drawImage(DRAW, 0, 0, W, H);
    for (const it of [...world.items].sort((a, b) => a.z - b.z)) {
      const def = DEF[it.kind]; const w = def.w * W * it.s; const cx = it.x * W, cy = it.y * H;
      x.save(); x.translate(cx, cy); if (it.flip) x.scale(-1, 1);
      if (def.svg) { try { const s = def.svg('snap' + it.uid, it.label); const vb = s.match(/viewBox="0 0 (\d+) (\d+)"/); const ar = vb ? +vb[2] / +vb[1] : 1; const im = await loadImg(svgUrl(s.replace('<svg ', `<svg width="${vb ? vb[1] : 200}" height="${vb ? vb[2] : 200}" `))); x.drawImage(im, -w / 2, -w * ar / 2, w, w * ar); } catch (e) {} }
      else { x.font = `${w * .85}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(def.e, 0, w * .04); }
      x.restore();
    }
    x.font = `700 ${Math.round(W / 38)}px Fredoka, Nunito, sans-serif`; x.fillStyle = 'rgba(5,46,22,.75)'; x.textAlign = 'right'; x.textBaseline = 'bottom'; x.fillText('chillionbucks.com 😎', W - 16, H - 12);
    return c.toDataURL('image/png');
  }
  $('#snapBtn').onclick = async () => { SFX.tap(); toast('Saving your picture… 📸'); try { $('#snapImg').src = await snapshot(); $('#snapSheet').hidden = false; SFX.levelUp(); confetti(70); } catch (e) { toast('Could not make the picture. Try again.'); } };
  $('#snapClose').onclick = () => { $('#snapSheet').hidden = true; };
  $('#snapSheet').addEventListener('click', e => { if (e.target.id === 'snapSheet') $('#snapSheet').hidden = true; });

  /* ============================== WALLET DISPLAY, TOAST, CONFETTI ============================== */
  function paintWallet(bump) { const el = $('#walletAmt'); el.textContent = '$' + Wallet.get(); if (bump) { const w = $('#wallet'); w.classList.remove('bump'); void w.offsetWidth; w.classList.add('bump'); } refreshLocks(); }
  document.addEventListener('wallet', () => paintWallet(true));
  let toastT = null;
  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }
  const confetti = (() => {
    const cv = $('#confetti'); const ctx = cv.getContext('2d'); let parts = [], raf = null;
    const cols = ['#22c55e', '#a3e635', '#fbbf24', '#38bdf8', '#ffffff', '#f472b6'];
    function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height); parts = parts.filter(p => p.life > 0);
      for (const p of parts) { p.vy += .35; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.rot += p.vr; p.life--; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.min(1, p.life / 30); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); ctx.restore(); }
      if (parts.length) raf = requestAnimationFrame(tick); else { raf = null; ctx.clearRect(0, 0, cv.width, cv.height); }
    }
    return function burst(n = 100) {
      if (reduced) return; cv.width = innerWidth; cv.height = innerHeight; const r = stageRect(); const ox = r.left + r.width / 2, oy = r.top + r.height * .4;
      for (let i = 0; i < n; i++) parts.push({ x: ox + (Math.random() - .5) * 160, y: oy, vx: (Math.random() - .5) * 14, vy: -(6 + Math.random() * 10), r: 5 + Math.random() * 6, c: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .3, life: 100 + Math.random() * 40 });
      if (!raf) tick();
    };
  })();

  /* ============================== INIT ============================== */
  SFX.bind($('#soundBtn'));
  const gain = Wallet.interest();
  renderBg(); render(); renderCats(); renderShelf(); paintWallet(false); sizeDraw();
  if (gain) setTimeout(() => { toast(`🌱 Baby money! Your savings made $${gain} while you were away.`); SFX.levelUp(); confetti(60); }, 500);
  else if (Wallet.get() === 0 && !world.items.length) setTimeout(() => toast('Your wallet is empty. Free stickers are marked FREE. Drag coins into the piggy to earn more! 🐷'), 900);
})();
