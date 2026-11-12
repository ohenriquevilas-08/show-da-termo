const B = require("../perguntas.js");
let bad = 0, total = 0, per = {};
for (const g of B.ALL) {
  const n = g.tpl.startsWith("c-") ? 5 : 400;
  for (let i = 0; i < n; i++) {
    const q = B.retry(g); total++;
    if (!q) { console.log("NULL", g.tpl); bad++; continue; }
    const txt = JSON.stringify(q);
    if (/NaN|undefined|Infinity/.test(txt)) { console.log("BAD", g.tpl, q.q, q.opts); bad++; }
    if (new Set(q.opts).size !== 4) { console.log("DUP", g.tpl); bad++; }
    if (q.ans < 0 || q.ans > 3 || !q.why) { console.log("ANS", g.tpl); bad++; }
  }
}
// níveis: toda posição da escada tem pergunta
for (let L = 0; L < 16; L++) { const q = B.pickQ(L); if (!q) { console.log("sem pergunta L", L); bad++; } }
// quantos moldes por nível
for (let L = 0; L < 16; L++) { const s = new Set(); for (let i = 0; i < 300; i++) { const q = B.pickQ(L); if (q) s.add(q.tpl); } per[L] = s.size; }
console.log("total", total, "problemas", bad, "moldes por degrau", JSON.stringify(per), "conceituais", B.CONC.length, "geradores", B.GEN.length);
