/* The Chillion wallet: one pile of bucks shared by the piggy game and the Builder, plus the BILLS a kid has earned but
   not yet dropped into the piggy. Stored only in this browser (localStorage 'cb:wallet'). Fires a 'wallet' event on
   every change so any open page can repaint. */
window.Wallet = (() => {
  const KEY = 'cb:wallet';
  /* the money that can be earned: a bill sits in the tray until the kid drags it into the piggy */
  const BILLS = { b5: { v: 5, name: '$5 bill' }, b20: { v: 20, name: '$20 bill' }, b50: { v: 50, name: '$50 bill' }, b100: { v: 100, name: '$100 bill' }, stack: { v: 5000, name: 'fat stack of cash' }, pot: { v: 10000, name: 'pot of gold' } };
  const today = () => new Date().toISOString().slice(0, 10);
  const read = () => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s.saved === 'number') { s.bills = s.bills || {}; s.earned = s.earned || 0; return s; } } catch (e) {} return { saved: 0, lastVisit: today(), bills: {}, earned: 0 }; };
  let st = read();
  const write = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  const emit = () => document.dispatchEvent(new CustomEvent('wallet', { detail: { saved: st.saved, bills: { ...st.bills } } }));
  return {
    BILLS,
    get: () => st.saved,
    set(n) { st.saved = Math.max(0, Math.round(n)); write(); emit(); },
    add(n) { this.set(st.saved + n); },
    goal: () => st.goal || null,
    setGoal(g) { st.goal = g; write(); },
    /* bills waiting in the tray */
    bills: () => ({ ...st.bills }),
    billCount: () => Object.values(st.bills).reduce((a, b) => a + b, 0),
    billValue: () => Object.entries(st.bills).reduce((a, [k, n]) => a + (BILLS[k] ? BILLS[k].v * n : 0), 0),
    earnBill(kind) { if (!BILLS[kind]) return; st.bills[kind] = (st.bills[kind] || 0) + 1; st.earned += 1; write(); emit(); },
    depositBill(kind) { if (!BILLS[kind] || !(st.bills[kind] > 0)) return 0; st.bills[kind]--; if (!st.bills[kind]) delete st.bills[kind]; st.saved += BILLS[kind].v; write(); emit(); return BILLS[kind].v; },
    earnedCount: () => st.earned || 0,
    /* once a day, savings of $5 or more grow a little: 5%, at least $1, at most $5 (labeled "baby money" in the UI) */
    interest() {
      const t = today(); if (st.lastVisit === t) return 0;
      st.lastVisit = t; let gain = 0;
      if (st.saved >= 5) { gain = Math.min(5, Math.max(1, Math.round(st.saved * .05))); st.saved += gain; }
      write(); if (gain) emit(); return gain;
    },
  };
})();
