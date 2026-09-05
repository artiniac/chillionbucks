/* The Chillion wallet: bucks saved in the piggy, spent in the Builder. Lives only in this browser (localStorage). */
window.Wallet = (() => {
  const KEY = 'cb:wallet';
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '{}'); return { saved: Math.max(0, Math.round(+v.saved || 0)), lastVisit: v.lastVisit || null, goal: v.goal || null }; } catch (e) { return { saved: 0, lastVisit: null, goal: null }; } };
  let st = read();
  const write = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* storage blocked: play on in memory */ } };
  const emit = () => document.dispatchEvent(new CustomEvent('wallet', { detail: st.saved }));
  return {
    get: () => st.saved,
    set(n) { st.saved = Math.max(0, Math.round(n)); write(); emit(); },
    add(n) { this.set(st.saved + n); },
    goal: () => st.goal,
    setGoal(g) { st.goal = g; write(); },
    /* "Baby money": once per day, saved bucks grow a little while you were away (5%, at least $1, at most $5). */
    interest() {
      const today = new Date().toISOString().slice(0, 10); const prev = st.lastVisit; st.lastVisit = today;
      let gain = 0;
      if (prev && prev < today && st.saved >= 5) { gain = Math.min(5, Math.max(1, Math.round(st.saved * .05))); st.saved += gain; }
      write(); if (gain) emit(); return gain;
    },
  };
})();
