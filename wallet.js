/* The Chillion wallet: one pile of bucks shared by the piggy game and the Builder, plus the BILLS a kid has earned but
   not yet dropped into the piggy. Stored only in this browser (localStorage 'cb:wallet'). Fires a 'wallet' event on
   every change so any open page can repaint. */
window.Wallet = (() => {
  const KEY = 'cb:wallet';
  /* the money that can be earned: a bill sits in the tray until the kid drags it into the piggy */
  const BILLS = { b5: { v: 5, name: '$5 bill' }, b20: { v: 20, name: '$20 bill' }, b50: { v: 50, name: '$50 bill' }, b100: { v: 100, name: '$100 bill' }, stack: { v: 5000, name: 'fat stack of cash' }, pot: { v: 10000, name: 'pot of gold' } };
  const today = () => { const d = new Date(); return [d.getFullYear(), d.getMonth()+1, d.getDate()].join('-'); };
  const JOBS = {feed:{pay:5,limit:1},clean:{pay:10,limit:1},delivery:{pay:10,limit:2},park:{pay:10,limit:1},classic:{pay:5,limit:2}};
  function ledger() { const t=today(); if(st.workDay!==t){st.workDay=t;st.workClaims={};st.workPay=0;}st.workClaims=st.workClaims||{};return st; }
  const read = () => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && typeof s.saved === 'number') { s.bills = s.bills || {}; s.earned = s.earned || 0; return s; } } catch (e) {} return { saved: 0, lastVisit: today(), bills: {}, earned: 0 }; };
  let st = read();
  const write = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
  const emit = () => document.dispatchEvent(new CustomEvent('wallet', { detail: { saved: st.saved, bills: { ...st.bills } } }));
  window.addEventListener('storage', e => { if (e.key === KEY) { st = read(); emit(); } });
  return {
    BILLS,
    get: () => (st = read()).saved,
    set(n) { st = read(); if (!Number.isFinite(n)) return; st.saved = Math.max(0, Math.round(n)); write(); emit(); },
    add(n) { this.set(this.get() + n); },
    goal: () => (st = read()).goal || null,
    setGoal(g) { st = read(); st.goal = g; write(); },
    /* bills waiting in the tray */
    bills: () => ({ ...(st = read()).bills }),
    billCount: () => Object.values((st = read()).bills).reduce((a, b) => a + b, 0),
    billValue: () => Object.entries((st = read()).bills).reduce((a, [k, n]) => a + (BILLS[k] ? BILLS[k].v * n : 0), 0),
    earnBill(kind) { st = read(); if (!BILLS[kind]) return; st.bills[kind] = (st.bills[kind] || 0) + 1; st.earned += 1; write(); emit(); },
    depositBill(kind) { st = read(); if (!BILLS[kind] || !(st.bills[kind] > 0)) return 0; st.bills[kind]--; if (!st.bills[kind]) delete st.bills[kind]; st.saved += BILLS[kind].v; write(); emit(); return BILLS[kind].v; },
    earnedCount: () => st.earned || 0,
    workInfo(type) { st=read();ledger();const rule=JOBS[type];return rule?{pay:rule.pay,left:Math.min(Math.max(0,rule.limit-(st.workClaims[type]||0)),Math.floor((45-(st.workPay||0))/rule.pay))}:{pay:0,left:0}; },
    canWork(type) { return this.workInfo(type).left>0; },
    async completeWork(type) {
      const claim=()=>{st=read();ledger();const rule=JOBS[type];if(!rule||(st.workClaims[type]||0)>=rule.limit||(st.workPay||0)+rule.pay>45)return 0;
        st.workClaims[type]=(st.workClaims[type]||0)+1;st.workPay=(st.workPay||0)+rule.pay;st.bills.b5=(st.bills.b5||0)+rule.pay/5;st.earned+=1;
        try{localStorage.setItem(KEY,JSON.stringify(st));}catch{return 0;}emit();return rule.pay;};
      return navigator.locks ? navigator.locks.request('cb:work-pay',claim) : claim();
    },
    // Growth is taught in the explicitly labeled simulator, not minted on each visit.
    interest() { return 0; },
  };
})();
