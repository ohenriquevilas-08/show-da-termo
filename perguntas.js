// Banco de perguntas do Show da Termo (P2: 1ª lei para volume de controle, Rankine e Brayton).
// Duas fontes: perguntas conceituais fixas (alternativas erradas = erros típicos) e perguntas de conta
// com números sorteados (cada partida muda os valores; as erradas saem de enganos clássicos).
// Dificuldade d de 1 a 10: a Escada do Milhão sobe de 1 a 10.

const R = {
  int: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
  pick: (arr) => arr[Math.floor(Math.random() * arr.length)],
  shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
};
// número em português: vírgula decimal, espaço fino nos milhares, menos tipográfico
const fm = (x, nd = 0) => {
  const s = Math.abs(x).toFixed(nd); let [i, d] = s.split(".");
  i = i.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return (x < 0 && Number(s) !== 0 ? "−" : "") + i + (d ? "," + d : "");
};
const CP = 1.005, CV = 0.717, RAR = 0.287;
const MD = "ṁ", WD = "Ẇ", QD = "Q̇";

// monta a pergunta de múltipla escolha: certa + 3 erradas distintas, embaralhadas
function mk(o) {
  const opts = [o.ok];
  for (const w of R.shuffle(o.bad)) { if (!opts.includes(w) && w !== o.ok) opts.push(w); if (opts.length === 4) break; }
  if (opts.length < 4) return null;
  const sh = R.shuffle(opts);
  return { tpl: o.tpl, d: o.d, kind: o.kind || "conc", q: o.q, opts: sh, ans: sh.indexOf(o.ok), why: o.why, hint: o.hint || o.why, src: o.src || "" };
}

/* ---------------- conceituais ---------------- */
const CONC = [
  { tpl: "c-valvula", d: 1, q: "Numa válvula (estrangulador) adiabática, sem trabalho, com vapor d'água, o que permanece constante entre a entrada e a saída?",
    ok: "A entalpia específica (h₁ = h₂)", bad: ["A temperatura (T₁ = T₂)", "A pressão (P₁ = P₂)", "A entropia específica (s₁ = s₂)"],
    why: "Q̇ = 0, Ẇ = 0 e energias cinética e potencial desprezíveis: sobra h₁ = h₂. A pressão cai e a temperatura (ou o título) também muda.", src: "Prova 2, Q2 (válvula + turbina)" },
  { tpl: "c-turb", d: 1, q: "Para uma turbina adiabática em regime permanente, qual é a potência?",
    ok: WD + " = " + MD + "(h<sub>e</sub> − h<sub>s</sub>)", bad: [WD + " = " + MD + "(h<sub>s</sub> − h<sub>e</sub>)", QD + " = " + MD + "(h<sub>e</sub> − h<sub>s</sub>)", WD + " = 0, pois é adiabática"],
    why: "Adiabática só zera o calor, não o trabalho. O que sai como potência é a queda de entalpia do fluido.", src: "Vídeos T4-46, T4-84, T4-87" },
  { tpl: "c-sinal", d: 1, q: "No formulário da prova, qual é a convenção de sinais de Q̇ e Ẇ?",
    ok: "Q̇ positivo entra no VC e Ẇ positivo sai do VC", bad: ["Q̇ positivo sai do VC e Ẇ positivo entra", "Ambos são positivos quando entram no VC", "Ambos são positivos quando saem do VC"],
    why: "Q̇ + Σṁe(…) = Σṁs(…) + Ẇ: calor entrando e trabalho saindo são positivos.", src: "Formulário da prova" },
  { tpl: "c-comp-sinal", d: 2, q: "O trabalho do compressor entra no fluido. Qual é o sinal de Ẇ na convenção do formulário?",
    ok: "Negativo (Ẇ < 0)", bad: ["Positivo (Ẇ > 0)", "Zero, pois ele é adiabático", "Depende apenas da temperatura de entrada"],
    why: "Ẇ positivo é o que sai. Compressor e bomba recebem trabalho, então Ẇ < 0 (o módulo é a 'potência de acionamento').", src: "Vídeo T4-56, enunciado 4.118" },
  { tpl: "c-permanente", d: 2, q: "Em regime permanente, o que vale para um volume de controle?",
    ok: "dE/dt = 0 e Σṁe = Σṁs", bad: ["dE/dt = 0, mas pode sair mais massa do que entra", "dE/dt = Q̇ − Ẇ, que nunca se anula", "Σṁe = Σṁs só vale se houver uma única entrada"],
    why: "Permanente significa que nada varia no tempo: nem a energia nem a massa dentro do VC.", src: "Equação da 1ª lei para VC" },
  { tpl: "c-so-calor", d: 2, q: "Em qual equipamento Ẇ = 0 e a energia trocada é só calor?",
    ok: "Condensador", bad: ["Turbina", "Bomba", "Compressor"],
    why: "Condensador, caldeira, aquecedor e resfriador não têm eixo: Q̇ = ṁ(hs − he). Turbina, bomba e compressor trocam trabalho.", src: "Vídeos 4.91, 4.119 e 4.120" },
  { tpl: "c-trocador", d: 2, q: "Num trocador de calor de duas correntes, sem troca com o ambiente, em qual volume de controle vale Q̇ = 0?",
    ok: "No trocador inteiro (as duas correntes juntas)", bad: ["Somente na corrente quente", "Somente na corrente fria", "Em nenhum: sempre há calor externo"],
    why: "Se você isola só uma corrente, ela troca calor com a outra. Com as duas dentro do VC, o calor é interno e Q̇ = 0.", src: "Vídeo T4-91 (condensador)" },
  { tpl: "c-sat-liq", d: 2, q: "Qual é o estado da água na saída do condensador de um Rankine ideal?",
    ok: "Líquido saturado", bad: ["Vapor saturado", "Vapor superaquecido", "Mistura com título 0,5"],
    why: "O condensador condensa todo o vapor: sai líquido saturado na pressão do condensador (x = 0).", src: "Ciclo Rankine" },
  { tpl: "c-liq-comp", d: 3, q: "Água a 100 kPa e 50 °C (Tsat a 100 kPa = 99,6 °C). Como obter h?",
    ok: "Líquido comprimido: h ≈ h<sub>l</sub>(50 °C), da tabela por temperatura", bad: ["Vapor superaquecido, pela tabela B.1.3", "Mistura: h = h<sub>l</sub> + x·h<sub>lv</sub>", "Vapor saturado: h = h<sub>v</sub>"],
    why: "T < Tsat(P) significa líquido. Para líquido, h depende quase só de T: h ≈ h<sub>l</sub>(T).", src: "Roteiro de tabelas (4.119)" },
  { tpl: "c-titulo", d: 3, q: "Vapor a 10 kPa com título x = 0,92. Como obter h?",
    ok: "h = h<sub>l</sub> + x·h<sub>lv</sub>, na tabela de saturação a 10 kPa", bad: ["h = x·h<sub>v</sub> + h<sub>lv</sub>", "Entrando na tabela de superaquecido com P e x", "h = h<sub>l</sub>·(1 + x)"],
    why: "Título só existe dentro do domo. h = h<sub>l</sub> + x·h<sub>lv</sub> (h<sub>l</sub> = 191,81 e h<sub>lv</sub> = 2392,82 a 10 kPa).", src: "Vídeo R4-118 (ponto 6)" },
  { tpl: "c-gas-h", d: 3, q: "Em um gás ideal, a entalpia específica h depende de...",
    ok: "Apenas da temperatura", bad: ["Da temperatura e da pressão", "Apenas da pressão", "Apenas do volume específico"],
    why: "Gás ideal: h = h(T). Por isso Δh = cp·ΔT e as pressões não entram no balanço.", src: "Vídeo T4-46 (turbina de ar)" },
  { tpl: "c-tabA7", d: 3, q: "Por que usar a tabela A.7 do ar, e não cp constante, num Brayton que vai de 320 a 1500 K?",
    ok: "cp varia bastante em faixas grandes de temperatura; a tabela é mais exata", bad: ["cp constante só vale acima de 1000 K", "A tabela já inclui o trabalho do compressor", "cp constante só vale para líquidos"],
    why: "Na lousa de 11/11, cp constante errava a turbina em cerca de 11%.", src: "Lousa de 11/11 (Brayton + Carnot)" },
  { tpl: "c-dT", d: 3, q: "Uma diferença de temperatura de 80 °C equivale a quantos kelvin?",
    ok: "80 K", bad: ["353 K", "−193 K", "80 K + 273 K"],
    why: "A escala Celsius só desloca a origem: diferenças são iguais em °C e em K. Só ṁ = PV̇/(RT) exige T absoluta.", src: "Vídeo T4-46" },
  { tpl: "c-ciclo", d: 4, q: "Em um ciclo completo em regime permanente, o que a 1ª lei fornece?",
    ok: "ΣQ̇ = ΣẆ (calor líquido que entra = potência líquida)", bad: ["ΣQ̇ = 0", "ΣẆ = 0", "ΣQ̇ = −ΣẆ, qualquer que seja a convenção"],
    why: "O fluido volta ao estado inicial, então dE/dt = 0: ΣQ̇ − ΣẆ = 0. É a conferência de ciclo.", src: "Quadro do professor e vídeo 4.119/4.120" },
  { tpl: "c-brayton-comp", d: 4, q: "No ciclo Brayton, qual componente consome parte da potência gerada pela turbina?",
    ok: "O compressor", bad: ["O aquecedor (câmara de combustão)", "O resfriador", "A válvula de expansão"],
    why: "Ẇ<sub>líq</sub> = Ẇ<sub>T</sub> − Ẇ<sub>c</sub>. Aquecedor e resfriador só trocam calor, sem eixo.", src: "Prova 2 de 03/07, Q2" },
  { tpl: "c-ke-un", d: 4, q: "V²/2 com V em m/s dá J/kg. Para somar com h em kJ/kg, você deve...",
    ok: "Dividir por 1000", bad: ["Multiplicar por 1000", "Elevar V ao cubo", "Não precisa converter nada"],
    why: "1 kJ = 1000 J. Ex.: V = 200 m/s dá 20 000 J/kg = 20 kJ/kg.", src: "Vídeo T4-56, 4.118" },
  { tpl: "c-ke-45", d: 4, q: "Qual velocidade dá V²/2 ≈ 1 kJ/kg (ordem de grandeza para decidir se desprezar a energia cinética)?",
    ok: "Cerca de 45 m/s", bad: ["Cerca de 1 m/s", "Cerca de 4,5 m/s", "Cerca de 1000 m/s"],
    why: "V = √(2 · 1000) ≈ 44,7 m/s. Abaixo disso, a energia cinética costuma ser desprezível frente a entalpias de centenas de kJ/kg.", src: "CADERNO_P2_Termo" },
  { tpl: "c-bocal", d: 4, q: "Num bocal adiabático, sem trabalho, o que acontece com a velocidade e com h do gás?",
    ok: "V aumenta e h diminui", bad: ["V diminui e h aumenta", "V e h aumentam", "V aumenta e h permanece constante"],
    why: "Bocal: Vs²/2 = he − hs + Ve²/2. A queda de entalpia vira energia cinética. (h constante é a válvula.)", src: "Lista 4.23" },
  { tpl: "c-wliq-rank", d: 5, q: "No Rankine, qual é o trabalho líquido?",
    ok: "Ẇ<sub>turbina</sub> − Ẇ<sub>bomba</sub>", bad: ["Ẇ<sub>turbina</sub> + Ẇ<sub>bomba</sub>", "Ẇ<sub>bomba</sub> − Ẇ<sub>turbina</sub>", "Ẇ<sub>turbina</sub> / Ẇ<sub>bomba</sub>"],
    why: "A turbina produz e a bomba consome. No 4.118: 24 800 − 300 = 24 500 kW.", src: "Vídeo R4-119-120 (conferência)" },
  { tpl: "c-bomba-pouco", d: 5, q: "Por que a bomba do Rankine consome muito menos potência que a turbina produz?",
    ok: "Ela comprime líquido (v pequeno), enquanto a turbina expande vapor", bad: ["Porque a vazão da bomba é menor que a da turbina", "Porque a bomba é adiabática e a turbina não", "Porque a bomba recebe calor da caldeira"],
    why: "A vazão é a mesma em todo o ciclo. Comprimir líquido exige pouca energia (Δh ≈ v·ΔP); no 4.118 são 300 kW contra 24,8 MW.", src: "4.118" },
  { tpl: "c-cond-sinal", d: 5, q: "No Rankine, o calor do condensador, na convenção do formulário, é...",
    ok: "Negativo: o calor sai do vapor", bad: ["Positivo: o vapor ganha calor", "Zero, pois não há trabalho", "Depende apenas da pressão de entrada"],
    why: "h<sub>7</sub> < h<sub>6</sub>: Q̇ = ṁ(h₇ − h₆ + …) < 0. No 4.119: −56 130 kW.", src: "Vídeo R4-119-120" },
  { tpl: "c-vazao-vol", d: 5, q: "O enunciado dá a vazão volumétrica de ar a 100 kPa e 290 K. Como obter ṁ?",
    ok: "ṁ = P·V̇/(R·T), com T em kelvin", bad: ["ṁ = V̇/T", "ṁ = P·V̇·R·T", "ṁ = P·V̇/(R·T), com T em °C"],
    why: "Gás ideal: PV̇ = ṁRT. Com R = 0,287 kJ/kg·K e kPa·m³/s = kW, a unidade casa. T tem de ser absoluta.", src: "Prova 2 de 03/07, Q2" },
  { tpl: "c-carnot", d: 6, q: "Uma máquina térmica entre 1800 K e 300 K tem η = 0,86. É possível?",
    ok: "Impossível: o limite de Carnot é 0,83", bad: ["Possível: 0,86 < 1", "Possível: o limite de Carnot é 0,86", "Impossível: o rendimento nunca passa de 0,5"],
    why: "η<sub>Carnot</sub> = 1 − 300/1800 = 0,833. Nenhuma máquina entre dois reservatórios supera Carnot.", src: "Lousa de 11/11" },
  { tpl: "c-mistura", d: 6, q: "Câmara de mistura adiabática, sem trabalho, 2 entradas e 1 saída. O que vale?",
    ok: "Σṁe·he = ṁs·hs", bad: ["h<sub>e1</sub> = h<sub>e2</sub> = h<sub>s</sub>", "ṁ<sub>1</sub>h<sub>1</sub> = ṁ<sub>s</sub>h<sub>s</sub>, ignorando a outra entrada", "Σṁe = 2ṁs"],
    why: "Massa: ṁs = ṁ₁ + ṁ₂. Energia: ṁ₁h₁ + ṁ₂h₂ = ṁs·hs (aquecedor de mistura 4.107).", src: "Lista 4.107" },
  { tpl: "c-extracao", d: 6, q: "Turbina adiabática com 1 entrada (1) e 2 saídas (2 e 3, a 2 é uma extração). A potência é...",
    ok: "ṁ₁h₁ − ṁ₂h₂ − ṁ₃h₃", bad: ["ṁ₁(h₁ − h₂ − h₃)", "ṁ₁(h₁ − h₃), ignorando a extração", "ṁ₁h₁ + ṁ₂h₂ + ṁ₃h₃"],
    why: "Cada saída leva sua própria vazão e sua própria entalpia. Massa: ṁ₁ = ṁ₂ + ṁ₃.", src: "Vídeo T4-84" },
  { tpl: "c-maior-q", d: 7, q: "No Rankine, qual equipamento recebe (em módulo) o maior calor?",
    ok: "Gerador de vapor (caldeira), pois vaporiza e superaquece", bad: ["Condensador", "Bomba", "Turbina"],
    why: "No 4.118 o gerador recebe 67 MW; o economizador 13,75 MW; o condensador rejeita 56 MW.", src: "Vídeo R4-119-120" },
  { tpl: "c-bomba-h", d: 7, q: "Dada a potência de acionamento da bomba (300 kW) e ṁ = 25 kg/s, a entalpia na saída da bomba é...",
    ok: "h<sub>entrada</sub> + 300/25 (kJ/kg)", bad: ["h<sub>entrada</sub> − 300/25", "h<sub>entrada</sub> + 300·25", "h<sub>entrada</sub> + 300"],
    why: "Bomba adiabática: Ẇ<sub>entra</sub> = ṁ(hs − he). No 4.118: h₁ = 168 + 12 = 180 kJ/kg.", src: "Vídeo R4-119-120, Passo 5" },
  { tpl: "c-resfriador", d: 7, q: "No resfriador (4 → 1) de um Brayton fechado:",
    ok: "Q̇ < 0 e Ẇ = 0", bad: ["Q̇ > 0 e Ẇ = 0", "Ẇ > 0 e Q̇ = 0", "Q̇ = 0 e Ẇ < 0"],
    why: "O ar cede calor ao ambiente (Q̇ negativo na convenção) e não há eixo. Na lousa: Q̇<sub>L</sub> = −1828 kW.", src: "Lousa de 11/11" },
  { tpl: "c-ke-200", d: 8, q: "Vapor entra no condensador a 200 m/s. Quanto vale V²/2?",
    ok: "20 kJ/kg", bad: ["40 kJ/kg", "200 kJ/kg", "20 000 kJ/kg"],
    why: "200²/2 = 20 000 J/kg = 20 kJ/kg (÷1000). No 4.119 entra como −20 na conta do condensador.", src: "Vídeo R4-119-120" },
  { tpl: "c-area", d: 8, q: "Para achar a velocidade num tubo de diâmetro D pelo ṁ·v/A, a área é...",
    ok: "π·D²/4, com D em metros", bad: ["π·D/4", "π·D²/4, com D em milímetros", "π·D²"],
    why: "A = π(0,2)²/4 = 0,0314 m² para D = 200 mm. Converter mm para m antes!", src: "Vídeo R4-118" },
  { tpl: "c-interp", d: 8, q: "Para interpolar v a 490 °C entre 450 °C e 500 °C, a fração do caminho é...",
    ok: "0,8 (= 40/50)", bad: ["0,4", "0,9", "0,98"],
    why: "(490 − 450)/(500 − 450) = 0,8. Interpole em T em cada pressão e depois em P.", src: "Vídeo R4-118, Passo 2" },
  { tpl: "c-fecha", d: 9, q: "Num ciclo, ΣQ̇ = 24 499 kW e ΣẆ = 24 500 kW. O que concluir?",
    ok: "O balanço fecha: a diferença é arredondamento", bad: ["Há erro: os dois têm de ser exatamente iguais", "A 1ª lei foi violada", "O ciclo é reversível"],
    why: "Com dados de tabela arredondados, 1 kW em 24 500 (0,004%) é ruído. Diferença grande indicaria erro de conta.", src: "Vídeo R4-119-120, Passo 5" },
  { tpl: "c-valv-x", d: 9, q: "Na válvula de um ciclo de refrigeração (R134a), líquido saturado de 10 para 4 bar. O título na saída é...",
    ok: "Maior que zero: parte vaporiza, com h constante", bad: ["Zero, pois continua líquido", "Um, pois vaporiza tudo", "Negativo, pois a pressão cai"],
    why: "h₁ = h₂ e a pressão menor: o líquido sai como mistura (flash), com 0 < x < 1.", src: "Prova 2 de 03/07, Q3" },
  { tpl: "c-wc-pequeno", d: 9, q: "Num Brayton com T₃ ≫ T₁, por que Ẇ<sub>c</sub> é bem menor que Ẇ<sub>T</sub>?",
    ok: "O trabalho é proporcional a T: expandir gás quente rende muito mais que comprimir gás frio", bad: ["Porque o compressor é adiabático", "Porque a turbina tem mais estágios", "Porque a vazão na turbina é maior"],
    why: "Mesmo ṁ e cp; ΔT da turbina (≈ 1000 K) é muito maior que o do compressor (≈ 40 a 70 K). Na lousa: 403 kW contra 11 324 kW.", src: "Lousa de 11/11" },
  { tpl: "c-rota-brayton", d: 10, q: "A prova dá só T₁ a T₄ de um Brayton e ṁ. Qual o caminho certo para a eficiência real?",
    ok: "h pela tabela A.7 (ou cp); Q̇<sub>H</sub> = ṁ(h₃ − h₂), Q̇<sub>L</sub> = ṁ(h₁ − h₄), η = 1 − |Q̇<sub>L</sub>|/Q̇<sub>H</sub>",
    bad: ["η = 1 − T<sub>L</sub>/T<sub>H</sub> usando só os reservatórios", "η = T₄/T₃", "η = Ẇ<sub>c</sub>/Ẇ<sub>T</sub>"],
    why: "A eficiência real vem dos calores/trabalhos do ciclo; 1 − T<sub>L</sub>/T<sub>H</sub> é a de Carnot, usada só para comparar.", src: "Lousa de 11/11" },
];

/* ---------------- geradores de conta ---------------- */
const GEN = [];
const G = (tpl, d, fn) => GEN.push({ tpl, d, fn });

function braytonTs() {
  const T1 = R.pick([290, 300, 320]), T2 = T1 + R.pick([60, 70, 80, 100]), T3 = R.pick([1100, 1200, 1300]), T4 = T3 - R.pick([500, 550, 600, 650]);
  return { T1, T2, T3, T4, m: R.pick([5, 8, 10, 12, 15]) };
}
const brayStmt = (b) => `Brayton com ar (cp = 1,005 kJ/kg·K), <b>${b.m} kg/s</b>: T<sub>1</sub> = ${b.T1} K (entrada do compressor), T<sub>2</sub> = ${b.T2} K, T<sub>3</sub> = ${b.T3} K (entrada da turbina) e T<sub>4</sub> = ${b.T4} K.`;

/* ---------------- variações v2: equipamento, fluido, ciclo e molde de pergunta sorteados ---------------- */
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const nd3 = (c) => (Math.abs(c) < 1 ? 3 : Math.abs(c) < 10 ? 2 : 1);
const sgn = (v, nd = 0) => (v > 0 ? "+" : "") + fm(v, nd);
const GASES = [
  { n: "ar", R: 0.287, Rs: "0,287", cp: 1.005, cps: "1,005" },
  { n: "nitrogênio", R: 0.2968, Rs: "0,2968", cp: 1.039, cps: "1,039" },
  { n: "hélio", R: 2.077, Rs: "2,077", cp: 5.193, cps: "5,193" },
  { n: "CO₂", R: 0.1889, Rs: "0,1889", cp: 0.842, cps: "0,842" },
];


G("n-unid", 2, () => {
  const L = [
    ["ṁ em kg/s multiplicada por h em kJ/kg", "kW", ["kJ", "W", "MW"]],
    ["P em kPa multiplicada por V̇ em m³/s", "kW", ["kJ/kg", "MW", "W"]],
    ["ṁ em kg/s multiplicada por cp em kJ/kg·K e por ΔT em K", "kW", ["kJ/kg", "kJ", "W"]],
    ["V²/2 com V em m/s (sem converter nada)", "J/kg", ["kJ/kg", "W", "m²"]],
    ["P em kPa multiplicada por V em m³ (volume)", "kJ", ["kW", "kJ/kg", "J/kg"]],
  ];
  const [d, ok, bad] = R.pick(L);
  return mk({ tpl: "n-unid", d: 2, kind: "conc", q: `Qual é a unidade de: <b>${d}</b>?`, ok, bad: [...bad, "N·m"],
    why: "kg/s · kJ/kg = kJ/s = kW. kPa · m³/s = kJ/s = kW. V²/2 em (m/s)² dá J/kg, então para kJ/kg divide por 1000.", hint: "Faça a análise dimensional.", src: "Formulário" });
});
const TERMOS = [
  ["uma turbina a vapor adiabática", "A", "Adiabática zera o calor, mas a turbina tem eixo: sobra Ẇ."],
  ["um compressor adiabático de ar", "A", "Adiabático zera Q̇; o eixo entrega trabalho ao gás (Ẇ < 0)."],
  ["uma bomba adiabática de água", "A", "Q̇ = 0, mas a bomba recebe potência pelo eixo."],
  ["a caldeira (gerador de vapor)", "B", "Troca calor com a fornalha e não tem eixo: Ẇ = 0."],
  ["o condensador de um Rankine", "B", "Só rejeita calor para a água de resfriamento, sem eixo."],
  ["o resfriador de um Brayton fechado", "B", "Só cede calor ao ambiente, sem eixo."],
  ["uma válvula adiabática", "C", "Sem eixo e sem troca de calor: Q̇ = 0 e Ẇ = 0 (h₁ = h₂)."],
  ["um bocal adiabático", "C", "Sem eixo e sem calor: a queda de h vira energia cinética."],
  ["uma câmara de mistura adiabática", "C", "Sem eixo e sem calor: Σṁh na entrada = ṁh na saída."],
  ["um trocador de calor, com as duas correntes dentro do VC", "C", "O calor passa de uma corrente à outra dentro do VC: Q̇ = 0 e Ẇ = 0."],
  ["uma turbina que perde calor para o ambiente", "D", "Tem eixo (Ẇ ≠ 0) e perda de calor (Q̇ < 0)."],
  ["um compressor refrigerado por camisa de água", "D", "Tem eixo (Ẇ < 0) e cede calor à camisa (Q̇ < 0)."],
];
const TER_TXT = { A: "Q̇ = 0 e Ẇ ≠ 0", B: "Q̇ ≠ 0 e Ẇ = 0", C: "Q̇ = 0 e Ẇ = 0", D: "Q̇ ≠ 0 e Ẇ ≠ 0" };
G("e-termos", 2, () => {
  const [eq, k, why] = R.pick(TERMOS);
  return mk({ tpl: "e-termos", d: 2, q: `Na 1ª lei em regime permanente, qual caso descreve <b>${eq}</b>?`, ok: TER_TXT[k], bad: Object.keys(TER_TXT).filter((x) => x !== k).map((x) => TER_TXT[x]),
    why, hint: why, src: "Roteiro: identificar o equipamento e cortar termos" });
});
const SATW = [{ P: "10 kPa", Ts: 45.8 }, { P: "50 kPa", Ts: 81.3 }, { P: "100 kPa", Ts: 99.6 }, { P: "500 kPa", Ts: 151.9 }, { P: "1 MPa", Ts: 179.9 }, { P: "2 MPa", Ts: 212.4 }, { P: "5 MPa", Ts: 264.0 }];
G("e-estado", 3, () => {
  const s = R.pick(SATW), caso = R.pick(["L", "V", "S"]);
  const T = caso === "L" ? Math.round(s.Ts) - R.pick([15, 25, 35]) : caso === "V" ? Math.round(s.Ts) + R.pick([30, 60, 100]) : s.Ts;
  const O = { L: "Líquido comprimido: h ≈ h<sub>l</sub>(T), da tabela de saturação", V: "Vapor superaquecido: tabela de superaquecido com P e T", S: "No limite da saturação: P e T não bastam, falta o título x", G: "Gás ideal: h = cp·T" };
  return mk({ tpl: "e-estado", d: 3, q: `Água a <b>${s.P}</b> e <b>${fm(T, caso === "S" ? 1 : 0)} °C</b> (T<sub>sat</sub> a ${s.P} = ${fm(s.Ts, 1)} °C). Como obter h?`, ok: O[caso], bad: Object.keys(O).filter((x) => x !== caso).map((x) => O[x]),
    why: `Compare T com T<sub>sat</sub>(P): abaixo é líquido comprimido, acima é vapor superaquecido e igual é saturado (precisa de x). Aqui: ${fm(T, 1)} ${caso === "L" ? "<" : caso === "V" ? ">" : "="} ${fm(s.Ts, 1)}.`, hint: "Compare T com Tsat(P).", src: "Roteiro de tabelas (4.119)" });
});
G("e-hip", 6, () => {
  const eq = R.pick([["turbina a vapor", "Δh entre entrada e saída"], ["turbina a gás", "Δh entre entrada e saída"], ["compressor de ar", "Δh entre entrada e saída"]]);
  const dh = R.pick([300, 500]), V2 = R.pick([60, 100, 250, 300]), ke = V2 * V2 / 2000, pct = ke / dh * 100, ok = pct < 3;
  const txt = (s) => `${s} (ΔEc = ${fm(ke, 1)} kJ/kg, ou ${fm(pct, 1)} % de Δh)`;
  return mk({ tpl: "e-hip", d: 6, q: `Numa ${eq[0]}, o ${eq[1]} é <b>${dh} kJ/kg</b> e o fluido entra com V ≈ 0 e sai a <b>${V2} m/s</b>. Dá para desprezar a variação de energia cinética?`,
    ok: txt(ok ? "Sim, é desprezível" : "Não, precisa entrar no balanço"), bad: [txt(ok ? "Não, precisa entrar no balanço" : "Sim, é desprezível"), "Sim, em turbinas e compressores a energia cinética é sempre desprezível", "Não, pois a variação de energia potencial é que domina"],
    why: `ΔEc = V²/2 = ${V2}²/2000 = ${fm(ke, 1)} kJ/kg, ${fm(pct, 1)} % de ${dh}. ${ok ? "Erro de poucos por cento: dá para desprezar." : "É uma fração grande: entra na conta."}`, hint: "Regra de bolso: 45 m/s ≈ 1 kJ/kg.", src: "CADERNO_P2_Termo" });
});
const ERRO = [
  ["turbina de vapor adiabática, 1 entrada e 1 saída", [
    ["Regime permanente: dE/dt = 0 e ṁ<sub>e</sub> = ṁ<sub>s</sub>", "Regime permanente: entra mais massa do que sai, pois o vapor expande"],
    ["Adiabática: Q̇ = 0", "Adiabática: Ẇ = 0"],
    ["Sem Ec e Ep: Ẇ = ṁ(h<sub>e</sub> − h<sub>s</sub>)", "Sem Ec e Ep: Ẇ = ṁ(h<sub>s</sub> − h<sub>e</sub>)"],
    ["h<sub>s</sub> vem da tabela, com a pressão de saída e o título", "h<sub>s</sub> vem da tabela, com a pressão de entrada e o título de saída"]]],
  ["compressor de ar adiabático", [
    ["Regime permanente: ṁ<sub>e</sub> = ṁ<sub>s</sub>", "Regime permanente: ṁ<sub>s</sub> = 2ṁ<sub>e</sub>, pois o ar é comprimido"],
    ["Adiabático: Q̇ = 0", "Adiabático: Q̇ < 0, pois o ar esquenta ao ser comprimido"],
    ["Gás ideal: Δh = cp·(T<sub>2</sub> − T<sub>1</sub>)", "Gás ideal: h depende de T e de P, então preciso de P<sub>2</sub>"],
    ["Ẇ = ṁ·cp·(T<sub>1</sub> − T<sub>2</sub>) < 0: a potência entra no gás", "Ẇ = ṁ·cp·(T<sub>2</sub> − T<sub>1</sub>) > 0: o compressor consome energia"]]],
  ["válvula adiabática com água", [
    ["Sem eixo: Ẇ = 0", "Tem uma restrição ao escoamento, então Ẇ < 0"],
    ["Rápida e sem troca de calor: Q̇ ≈ 0", "A pressão cai, o fluido esfria e Q̇ < 0"],
    ["Seções parecidas: ΔEc desprezível", "A velocidade cai muito, então ΔEc é o termo principal"],
    ["Logo h<sub>1</sub> = h<sub>2</sub>", "Logo s<sub>1</sub> = s<sub>2</sub>"]]],
  ["trocador de calor com duas correntes, sem perda ao ambiente", [
    ["VC = trocador inteiro: Q̇ = 0 e Ẇ = 0", "VC = trocador inteiro: Q̇ > 0, pois uma corrente é quente"],
    ["Cada corrente conserva a sua vazão de massa", "Em todo trocador ṁ<sub>quente</sub> = ṁ<sub>fria</sub>"],
    ["Energia: ṁ<sub>q</sub>(h<sub>q1</sub> − h<sub>q2</sub>) = ṁ<sub>f</sub>(h<sub>f2</sub> − h<sub>f1</sub>)", "Energia: ṁ<sub>q</sub>(h<sub>q1</sub> − h<sub>q2</sub>) = ṁ<sub>f</sub>(h<sub>f1</sub> − h<sub>f2</sub>)"],
    ["Com cp constante: ṁ<sub>q</sub>·cp<sub>q</sub>·ΔT<sub>q</sub> = ṁ<sub>f</sub>·cp<sub>f</sub>·ΔT<sub>f</sub>", "Com cp constante: ΔT<sub>q</sub> = ΔT<sub>f</sub>, pois a energia se conserva"]]],
  ["bocal adiabático de gás", [
    ["Sem eixo e adiabático: Ẇ = 0 e Q̇ = 0", "O bocal acelera o gás, logo Ẇ > 0"],
    ["Energia: h<sub>s</sub> + V<sub>s</sub>²/2 = h<sub>e</sub> + V<sub>e</sub>²/2", "Energia: h<sub>s</sub> + V<sub>s</sub>² = h<sub>e</sub> + V<sub>e</sub>²"],
    ["V²/2 sai em J/kg: divide por 1000 para ter kJ/kg", "V²/2 sai em J/kg: multiplica por 1000 para ter kJ/kg"],
    ["Se V aumenta, h diminui", "Se V aumenta, h também aumenta"]]],
  ["condensador de um Rankine", [
    ["Sem eixo: Ẇ = 0", "O condensador é adiabático: Q̇ = 0"],
    ["Saída: líquido saturado na pressão do condensador (x = 0)", "Saída: vapor saturado na pressão do condensador (x = 1)"],
    ["Q̇ = ṁ(h<sub>s</sub> − h<sub>e</sub>) < 0: o calor sai do vapor", "Q̇ = ṁ(h<sub>s</sub> − h<sub>e</sub>) > 0: o vapor ganha calor"],
    ["Entrando a 200 m/s, V²/2 = 20 kJ/kg entra na conta", "Entrando a 200 m/s, V²/2 = 20 000 kJ/kg entra na conta"]]],
];
G("e-erro", 9, () => {
  const [eq, steps] = R.pick(ERRO), k = R.int(0, 3), lines = steps.map((s, i) => `Passo ${i + 1}: ${i === k ? s[1] : s[0]}`);
  return mk({ tpl: "e-erro", d: 9, q: `Resolução do equipamento: <b>${eq}</b>. Em qual passo está o <b>erro</b>?`, ok: lines[k], bad: lines.filter((_, i) => i !== k),
    why: `O correto seria: <b>${steps[k][0]}</b>.`, hint: "Releia cada passo: um deles contradiz a 1ª lei ou a convenção de sinais.", src: "Roteiro: identificar o equipamento e cortar termos" });
});
const ESE = [
  ["Uma bomba adiabática de água mantém a potência de acionamento Ẇ. A vazão ṁ passa a ser <b>{k} vezes maior</b>. O que acontece com o aumento de entalpia por quilo (h<sub>s</sub> − h<sub>e</sub>)?", "1/k", "Ẇ = ṁ·Δh: com Ẇ fixa, mais vazão significa menos Δh por quilo."],
  ["Vapor escoa num tubo com ṁ e v (volume específico) fixos. O diâmetro passa a ser <b>{k} vezes maior</b>. O que acontece com a velocidade do vapor?", "1/k2", "V = ṁ·v/A e a área cresce com D²."],
  ["Uma turbina de ar opera com ṁ, T<sub>1</sub> e T<sub>2</sub> fixos. A vazão ṁ passa a ser <b>{k} vezes maior</b>. O que acontece com a <b>potência</b>?", "k", "Ẇ = ṁ·cp·ΔT é linear em ṁ."],
  ["Um aquecedor de gás (cp constante) mantém ṁ. A elevação de temperatura ΔT passa a ser <b>{k} vezes maior</b>. O que acontece com Q̇?", "k", "Q̇ = ṁ·cp·ΔT é linear em ΔT."],
  ["Num bocal com V<sub>entrada</sub> ≈ 0, a velocidade de saída passa a ser <b>{k} vezes maior</b>. O que acontece com a <b>energia cinética específica</b> V²/2 na saída?", "k2", "V²/2 vai com o quadrado da velocidade."],
  ["Um gás ideal escoa com V̇ e T fixos. A pressão passa a ser <b>{k} vezes maior</b>. O que acontece com a vazão mássica ṁ = PV̇/(RT)?", "k", "ṁ é proporcional a P."],
  ["Um gás ideal escoa com P e V̇ fixos. A temperatura <b>absoluta</b> passa a ser <b>{k} vezes maior</b>. O que acontece com ṁ = PV̇/(RT)?", "1/k", "ṁ é inversamente proporcional a T."],
  ["Num compressor adiabático de ar com ΔT fixo, a vazão ṁ passa a ser <b>{k} vezes maior</b>. O que acontece com a <b>potência de acionamento</b>?", "k", "A potência é ṁ·cp·ΔT: dobra com ṁ."],
  ["Numa turbina com entalpias de entrada e saída fixas, a vazão ṁ passa a ser <b>{k} vezes maior</b>. O que acontece com o <b>trabalho específico</b> Ẇ/ṁ = h<sub>e</sub> − h<sub>s</sub>?", "1", "Ẇ/ṁ depende só das entalpias, não da vazão."],
];
G("e-ese", 5, () => {
  const [t, f, why] = R.pick(ESE), k = R.pick([2, 3, 4]);
  const O = { k: `Fica ${k} vezes maior`, k2: `Fica ${k * k} vezes maior`, "1/k": `Fica ${k} vezes menor`, "1/k2": `Fica ${k * k} vezes menor`, "1": "Não muda" }, ans = f;
  return mk({ tpl: "e-ese", d: 5, q: t.replace("{k}", k), ok: O[ans], bad: Object.keys(O).filter((x) => x !== ans).map((x) => O[x]),
    why: `${why} Com fator ${k}: ${O[ans].toLowerCase()}.`, hint: why, src: "Equação da 1ª lei para VC" });
});

/* ---------------- intuição: sinal, direção, comparação e ordem de grandeza (sem conta) ---------------- */
const OPC4 = ["Positivo", "Negativo", "Zero", "Depende só da pressão de saída"];
const SINAL = [
  ["a turbina", "Ẇ", "Positivo", "A turbina entrega potência pelo eixo: Ẇ > 0 na convenção do formulário."],
  ["o compressor", "Ẇ", "Negativo", "O compressor recebe potência: Ẇ < 0."],
  ["a bomba", "Ẇ", "Negativo", "A bomba recebe potência: Ẇ < 0."],
  ["a caldeira", "Ẇ", "Zero", "Não tem eixo: Ẇ = 0."],
  ["o condensador", "Ẇ", "Zero", "Não tem eixo: Ẇ = 0."],
  ["uma válvula adiabática", "Ẇ", "Zero", "Sem eixo: Ẇ = 0 (e Q̇ = 0)."],
  ["a caldeira", "Q̇", "Positivo", "Recebe calor da fornalha: Q̇ > 0."],
  ["o condensador", "Q̇", "Negativo", "O vapor cede calor à água de resfriamento: Q̇ < 0."],
  ["o resfriador de um Brayton fechado", "Q̇", "Negativo", "O gás cede calor ao ambiente: Q̇ < 0."],
  ["o aquecedor (câmara de combustão) de um Brayton", "Q̇", "Positivo", "O gás recebe calor: Q̇ > 0."],
  ["uma turbina adiabática", "Q̇", "Zero", "Adiabática significa Q̇ = 0."],
];
G("e-sinal", 2, () => {
  const [eq, q, ok, why] = R.pick(SINAL);
  return mk({ tpl: "e-sinal", d: 2, q: `Na convenção do formulário (Q̇ entra e Ẇ sai são positivos), qual o sinal de <b>${q}</b> em <b>${eq}</b>?`, ok, bad: OPC4.filter((x) => x !== ok), why, hint: why, src: "Formulário da prova" });
});
const DIRE = [
  ["um bocal adiabático de gás ideal", "a velocidade do gás", "Aumenta", "A queda de h vira energia cinética."],
  ["um bocal adiabático de gás ideal", "a temperatura do gás", "Diminui", "h cai, e para gás ideal h depende só de T."],
  ["um difusor adiabático de gás ideal", "a velocidade do gás", "Diminui", "O difusor freia o escoamento."],
  ["um difusor adiabático de gás ideal", "a temperatura do gás", "Aumenta", "A energia cinética vira entalpia, e T sobe."],
  ["uma válvula adiabática de gás ideal", "a temperatura do gás", "Permanece constante", "h₁ = h₂ e h = h(T): a temperatura não muda."],
  ["uma válvula adiabática", "a entalpia do fluido", "Permanece constante", "Q̇ = 0, Ẇ = 0 e Ec desprezível: h₁ = h₂."],
  ["um compressor adiabático de ar", "a temperatura do ar", "Aumenta", "O trabalho que entra vira entalpia."],
  ["uma turbina adiabática de gás", "a temperatura do gás", "Diminui", "O gás entrega trabalho: h e T caem."],
  ["o aquecedor de um Brayton", "a temperatura do gás", "Aumenta", "O gás recebe calor."],
  ["o resfriador de um Brayton", "a temperatura do gás", "Diminui", "O gás cede calor ao ambiente."],
];
const OPC_D = ["Aumenta", "Diminui", "Permanece constante", "Aumenta e depois diminui"];
G("e-direcao", 3, () => {
  const [eq, qt, ok, why] = R.pick(DIRE);
  return mk({ tpl: "e-direcao", d: 3, q: `Passando por <b>${eq}</b>, o que acontece com <b>${qt}</b>?`, ok, bad: OPC_D.filter((x) => x !== ok), why, hint: why, src: "Lista 4.23 e 1ª lei" });
});
G("e-rank-eq", 4, () => {
  const F = [
    ["consome a <b>menor</b> potência (em módulo)", "Bomba", "Ela comprime líquido, com v pequeno."],
    ["produz a <b>maior</b> potência", "Turbina", "Expande vapor: a queda de h é grande."],
    ["<b>rejeita</b> calor para o ambiente", "Condensador", "O vapor condensa e cede calor."],
    ["<b>recebe</b> o maior calor", "Caldeira", "Vaporiza e superaquece o fluido."],
    ["leva o fluido de líquido saturado a líquido comprimido", "Bomba", "A pressão sobe quase sem mudar o estado de líquido."],
    ["deixa a mistura líquido-vapor na saída (título menor que 1)", "Turbina", "Na expansão o vapor perde entalpia e parte condensa."],
  ];
  const [t, ok, why] = R.pick(F), O = ["Bomba", "Turbina", "Caldeira", "Condensador"];
  return mk({ tpl: "e-rank-eq", d: 4, q: `Num Rankine ideal, qual equipamento ${t}?`, ok, bad: O.filter((x) => x !== ok), why, hint: why, src: "Vídeo R4-119-120" });
});
G("e-mist", 4, () => {
  const [m1, m2] = R.pick([[1, 3], [3, 1], [2, 2], [1, 4], [4, 1], [2, 5], [5, 2]]), agua = Math.random() < 0.5;
  const T1 = agua ? R.pick([15, 20, 25]) : R.pick([300, 320]), T2 = agua ? R.pick([70, 80, 90]) : R.pick([600, 700]), u = agua ? "°C" : "K";
  const ok = m1 === m2 ? "Exatamente no meio" : m2 > m1 ? "Mais perto da corrente quente" : "Mais perto da corrente fria";
  const O = ["Mais perto da corrente quente", "Mais perto da corrente fria", "Exatamente no meio", "Acima da temperatura da corrente quente"];
  return mk({ tpl: "e-mist", d: 4, q: `Câmara de mistura adiabática (cp constante, ${agua ? "água líquida" : "ar"}): <b>${m1} kg/s</b> a ${T1} ${u} (fria) se junta a <b>${m2} kg/s</b> a ${T2} ${u} (quente). A temperatura de saída fica...`, ok, bad: O.filter((x) => x !== ok),
    why: `A saída é a média ponderada pelas vazões: fica mais perto de quem tem mais massa. Com ${m1} e ${m2} kg/s: ${ok.toLowerCase()}. Nunca sai fora do intervalo entre as duas.`, hint: "Média ponderada pela vazão.", src: "Lista 4.107" });
});
G("e-valv", 8, () => {
  const P = [{ n: "500 kPa", h: 640.23 }, { n: "1 MPa", h: 762.81 }, { n: "2 MPa", h: 908.79 }], Pf = R.pick(["100 kPa", "50 kPa", "10 kPa"]), [a, b] = R.shuffle(P).slice(0, 2), win = a.h > b.h ? "A" : "B";
  const O = { A: `A (parte de ${a.n})`, B: `B (parte de ${b.n})`, I: "Iguais, pois nas duas h₂ = h₁", N: "Nenhuma: líquido não vaporiza numa válvula" };
  return mk({ tpl: "e-valv", d: 8, q: `Duas válvulas adiabáticas levam <b>líquido saturado</b> até <b>${Pf}</b>: a <b>A</b> parte de ${a.n} e a <b>B</b> de ${b.n}. Qual produz mais vapor na saída (maior título)?`, ok: O[win], bad: Object.keys(O).filter((k) => k !== win).map((k) => O[k]),
    why: "h₂ = h₁ nas duas, mas quem parte de pressão mais alta tem h₁ maior: sobra mais energia para vaporizar na pressão final. Mesmo h₂ = h₁ em cada uma não implica mesmo título: o título depende do h₁ de cada uma.", hint: "Maior h de entrada, mais vapor na saída.", src: "Prova 2 de 03/07, Q3" });
});
G("e-troc", 9, () => {
  const dT = R.pick([100, 200, 400]), r = R.pick([1, 2]), v = dT / (4 * r), f = (x) => "≈ " + fm(x, x % 1 ? 1 : 0) + " K";
  return mk({ tpl: "e-troc", d: 9, q: `Trocador isolado: ar quente (cp ≈ 1 kJ/kg·K) esfria <b>${dT} K</b> e aquece água líquida (cp ≈ 4 kJ/kg·K). ${r === 1 ? "As duas vazões mássicas são iguais." : "A vazão mássica da água é o <b>dobro</b> da do ar."} Em ordem de grandeza, quanto a água esquenta?`,
    ok: f(v), bad: [f(dT), f(4 * dT), f(dT / 2)],
    why: `Q̇ é o mesmo nas duas correntes: ṁ·cp·ΔT. A água tem cp ≈ 4 vezes maior${r === 2 ? " e o dobro da vazão (8 vezes mais capacidade)" : ""}, então esquenta ${r === 2 ? "8" : "4"} vezes menos que o ar esfria: ${f(v)}.`, hint: "Quem tem mais ṁ·cp varia menos de temperatura.", src: "Vídeo T4-91" });
});
G("e-perda", 6, () => {
  const C = [
    ["Uma turbina a vapor adiabática passa a <b>perder calor</b> para o ambiente, com as <b>mesmas</b> h e V na entrada e na saída. A potência no eixo...", "Diminui", "Ẇ = Q̇ + ṁΔh com Q̇ < 0: sobra menos para o eixo."],
    ["Uma turbina perdia calor e passa a ser <b>bem isolada</b>, com as <b>mesmas</b> h e V na entrada e na saída. A potência no eixo...", "Aumenta", "Ẇ = Q̇ + ṁΔh: com Q̇ → 0, a perda deixa de descontar."],
  ];
  const [q, ok, why] = R.pick(C), O = ["Aumenta", "Diminui", "Permanece constante", "Zera"];
  return mk({ tpl: "e-perda", d: 6, q, ok, bad: O.filter((x) => x !== ok), why, hint: why, src: "Vídeo T4-84 e 4.118" });
});
G("e-bray", 9, () => {
  const S = [
    ["A razão de pressão aumenta (T<sub>2</sub> maior), com T<sub>1</sub> e T<sub>3</sub> iguais. O que acontece com Ẇ<sub>c</sub>?", "Aumenta", "Comprimir mais eleva T₂ e o trabalho do compressor."],
    ["A razão de pressão aumenta (T<sub>2</sub> maior), com T<sub>1</sub> e T<sub>3</sub> iguais. O que acontece com Q̇<sub>H</sub> (calor de 2 → 3)?", "Diminui", "O ar chega mais quente ao aquecedor: o ΔT de 2 → 3 cai."],
    ["T<sub>3</sub> aumenta, com T<sub>1</sub> e T<sub>2</sub> iguais. O que acontece com Ẇ<sub>c</sub>?", "Permanece constante", "O compressor só enxerga T₁ e T₂."],
    ["T<sub>3</sub> aumenta, com T<sub>1</sub> e T<sub>2</sub> iguais. O que acontece com Ẇ<sub>T</sub>?", "Aumenta", "A turbina recebe gás mais quente: o ΔT dela cresce."],
    ["O ar de entrada fica mais quente (T<sub>1</sub> maior), com a mesma razão de pressão. O que acontece com Ẇ<sub>c</sub>?", "Aumenta", "O trabalho de compressão é proporcional à temperatura do gás."],
    ["A vazão ṁ aumenta, com as mesmas temperaturas. O que acontece com |Q̇<sub>L</sub>|?", "Aumenta", "Todo calor e trabalho são proporcionais a ṁ."],
    ["Instala-se um regenerador ideal. O que acontece com Q̇<sub>H</sub>?", "Diminui", "O ar chega ao aquecedor já quente (a T₄)."],
    ["Instala-se um regenerador ideal. O que acontece com Ẇ<sub>líq</sub>?", "Permanece constante", "O regenerador só troca calor internamente: compressor e turbina não mudam."],
    ["Instala-se um regenerador ideal. O que acontece com |Q̇<sub>L</sub>|?", "Diminui", "O gás quente da turbina entrega calor ao ar antes de ir para o resfriador."],
  ];
  const [q, ok, why] = R.pick(S), O = ["Aumenta", "Diminui", "Permanece constante", "Troca de sinal"];
  return mk({ tpl: "e-bray", d: 9, q: "Brayton com ar (gás ideal, cp constante). " + q, ok, bad: O.filter((x) => x !== ok), why, hint: why, src: "Lousa de 11/11" });
});

/* ---------------- v3: os antigos geradores de conta viraram estimativa e intuição ---------------- */
G("e-ke", 3, () => {
  const V = R.pick([10, 45, 100, 200, 450]), ke = V * V / 2000, f = (x) => "≈ " + fm(x, x < 1 ? 2 : x < 10 ? 1 : 0) + " kJ/kg";
  return mk({ tpl: "e-ke", d: 3, kind: "num", q: `Um fluido escoa a <b>${V} m/s</b>. Em ordem de grandeza, quanto vale a energia cinética V²/2, em kJ/kg?`,
    ok: f(ke), bad: [f(ke * 10), f(ke / 10), f(ke * 1000)],
    why: `Regra de bolso: 45 m/s ≈ 1 kJ/kg, e V² cresce rápido (dobrou V, quadruplicou). Aqui: ${V}²/2 = ${fm(V * V / 2)} J/kg ≈ ${fm(ke, 2)} kJ/kg.`, hint: "45 m/s ≈ 1 kJ/kg; escale com V².", src: "CADERNO_P2_Termo" });
});
G("e-gasmassa", 5, () => {
  const g = [{ n: "ar", R: 0.287 }, { n: "hélio", R: 2.077 }, { n: "CO₂", R: 0.1889 }];
  if (Math.random() < 0.5) {
    const [a, b] = R.shuffle(g).slice(0, 2), win = a.R < b.R ? a : b, O = { a: `${cap(a.n)}`, b: `${cap(b.n)}`, i: "Iguais, pois V̇, P e T são iguais", n: "Não dá para saber sem a massa molar" };
    return mk({ tpl: "e-gasmassa", d: 5, kind: "num", q: `<b>${cap(a.n)}</b> e <b>${b.n}</b> escoam com a mesma P, a mesma T e a mesma vazão volumétrica. Qual tem a <b>maior vazão mássica</b>?`, ok: cap(win.n), bad: [cap((win === a ? b : a).n), O.i, O.n],
      why: "ṁ = PV̇/(RT): com P, V̇ e T iguais, ṁ é inversamente proporcional a R. O gás com menor R (mais pesado) leva mais massa.", hint: "ṁ = PV̇/(RT): quanto maior R, menor ṁ.", src: "Prova 2 de 03/07, Q2" });
  }
  const T1 = R.pick([300, 320]), T2 = R.pick([600, 640]);
  return mk({ tpl: "e-gasmassa", d: 5, kind: "num", q: `Ar com a mesma P e a mesma vazão volumétrica entra a <b>${T1} K</b> (caso A) ou a <b>${T2} K</b> (caso B). Qual caso tem a <b>maior vazão mássica</b>?`, ok: `A (${T1} K): o ar frio é mais denso`, bad: [`B (${T2} K): o ar quente tem mais energia`, "Iguais, pois V̇ e P são iguais", `B (${T2} K): ṁ cresce com T`],
    why: "ṁ = PV̇/(RT): ṁ cai quando T (em kelvin) sobe. O ar frio é mais denso e leva mais massa na mesma vazão volumétrica.", hint: "Quanto mais frio, mais denso.", src: "Prova 2 de 03/07, Q2" });
});
G("e-titulo", 4, () => {
  const x = R.pick([0.1, 0.2, 0.5, 0.8, 0.9]), ok = x < 0.5 ? "Mais perto de h<sub>l</sub> (quase tudo líquido)" : x > 0.5 ? "Mais perto de h<sub>v</sub> (quase tudo vapor)" : "No meio entre h<sub>l</sub> e h<sub>v</sub>";
  const O = ["Mais perto de h<sub>l</sub> (quase tudo líquido)", "Mais perto de h<sub>v</sub> (quase tudo vapor)", "No meio entre h<sub>l</sub> e h<sub>v</sub>", "Acima de h<sub>v</sub>"];
  return mk({ tpl: "e-titulo", d: 4, q: `Água saturada a 10 kPa com título <b>x = ${fm(x, 1)}</b>. Onde fica h entre h<sub>l</sub> e h<sub>v</sub>?`, ok, bad: O.filter((o) => o !== ok),
    why: `h = h<sub>l</sub> + x·h<sub>lv</sub> varia linearmente com x. Com x = ${fm(x, 1)}, h fica ${x < 0.5 ? "perto de h<sub>l</sub>" : x > 0.5 ? "perto de h<sub>v</sub>" : "no meio"}; nunca passa de h<sub>v</sub> dentro do domo.`, hint: "h é linear em x.", src: "Vídeo R4-118, Passo 3" });
});
G("e-interp", 3, () => {
  const T = R.pick([455, 470, 475, 480, 495]), ok = T < 475 ? "Mais perto de h(450 °C)" : T > 475 ? "Mais perto de h(500 °C)" : "Exatamente no meio";
  const O = ["Mais perto de h(450 °C)", "Mais perto de h(500 °C)", "Exatamente no meio", "Fora do intervalo entre h(450 °C) e h(500 °C)"];
  return mk({ tpl: "e-interp", d: 3, q: `Numa tabela, h está dado a 450 °C e a 500 °C, na mesma pressão. Interpolando para <b>${T} °C</b>, o valor de h fica...`, ok, bad: O.filter((o) => o !== ok),
    why: `A fração do caminho é (${T} − 450)/50 = ${fm((T - 450) / 50, 1)}: h fica ${ok.toLowerCase()}. Interpolar nunca sai do intervalo entre os dois valores.`, hint: "Fração = (T − 450)/50.", src: "Vídeo R4-118, Passo 2" });
});
G("e-prod", 5, () => {
  const eq = R.pick([["uma turbina de ar", "a potência"], ["um compressor de ar", "a potência de acionamento"], ["um aquecedor de gás", "o calor recebido"], ["um resfriador de gás", "o calor rejeitado"]]);
  const F = [0.5, 1, 2], a = R.pick(F), b = R.pick(F);
  if (a === 1 && b === 1) return null;
  const tx = (v) => (v === 2 ? "dobra" : v === 0.5 ? "cai pela metade" : "fica igual"), p = a * b;
  const L = { 0.25: "Cai a um quarto", 0.5: "Cai pela metade", 1: "Não muda", 2: "Dobra", 4: "Quadruplica" };
  return mk({ tpl: "e-prod", d: 5, kind: "num", q: `Em ${eq[0]} (gás ideal, cp constante), a vazão ṁ ${tx(a)} e a variação de temperatura ΔT ${tx(b)}. O que acontece com ${eq[1]}?`, ok: L[p], bad: Object.keys(L).filter((k) => +k !== p).map((k) => L[k]),
    why: `A grandeza é ṁ·cp·ΔT: os fatores se multiplicam. ${fm(a, a % 1 ? 1 : 0)} × ${fm(b, b % 1 ? 1 : 0)} = ${fm(p, p % 1 ? 2 : 0)}.`.replace(/\./g, (m, i, s) => m), hint: "ṁ·cp·ΔT: multiplique os fatores.", src: "Vídeo T4-46" });
});
G("e-compke", 6, () => {
  const S = [
    ["Um compressor de ar adiabático entrega o ar a alta velocidade (a energia cinética de saída é relevante). A potência de acionamento, comparada com ṁ·cp·ΔT, é...", "Maior", "Parte do trabalho vira energia cinética, além de entalpia."],
    ["Uma turbina a vapor descarrega o vapor ainda em alta velocidade. A potência no eixo, comparada com ṁ(h<sub>e</sub> − h<sub>s</sub>), é...", "Menor", "Parte da queda de h sai como energia cinética do vapor."],
    ["Uma turbina recebe o vapor já em alta velocidade e o descarrega devagar. A potência, comparada com ṁ(h<sub>e</sub> − h<sub>s</sub>), é...", "Maior", "A energia cinética que entra também vira trabalho."],
  ];
  const [q, ok, why] = R.pick(S), O = ["Maior", "Menor", "Igual", "Zero"];
  return mk({ tpl: "e-compke", d: 6, q, ok, bad: O.filter((x) => x !== ok), why, hint: why, src: "Vídeos T4-56 e T4-84" });
});
G("e-extrac", 8, () => {
  const S = [
    ["Numa turbina a vapor com uma extração, aumenta-se a fração extraída (mesma ṁ de entrada, mesmas entalpias). A potência...", "Diminui", "O vapor extraído não expande até a saída: entrega menos trabalho que o que segue."],
    ["A extração passa a ser feita numa pressão mais alta (h maior), com a mesma vazão extraída. A potência...", "Diminui", "Esse vapor sai da turbina mais cedo, tendo expandido menos."],
    ["Elimina-se a extração: todo o vapor expande até a saída. A potência...", "Aumenta", "Todo o vapor passa a render a queda de entalpia completa."],
  ];
  const [q, ok, why] = R.pick(S), O = ["Aumenta", "Diminui", "Permanece constante", "Zera"];
  return mk({ tpl: "e-extrac", d: 8, q, ok, bad: O.filter((x) => x !== ok), why, hint: why, src: "Vídeo T4-84" });
});
G("e-cond", 6, () => {
  const S = [
    ["Um condensador de vapor é resfriado por água. Se a água puder esquentar mais (ΔT maior), a vazão de água necessária...", "Diminui", "O mesmo calor passa a ser levado por menos massa: Q̇ = ṁ·cp·ΔT."],
    ["O vapor entra no condensador com título maior (mais vapor, menos líquido), mesma ṁ. A vazão de água necessária...", "Aumenta", "Há mais calor a retirar para chegar a líquido saturado."],
    ["A vazão de vapor dobra, com os mesmos estados e o mesmo ΔT da água. A vazão de água necessária...", "Aumenta", "O calor rejeitado dobra, então a água também."],
  ];
  const [q, ok, why] = R.pick(S), O = ["Aumenta", "Diminui", "Permanece constante", "Zera"];
  return mk({ tpl: "e-cond", d: 6, q, ok, bad: O.filter((x) => x !== ok), why, hint: why, src: "Vídeos T4-91 e R4-119" });
});
G("e-fecha", 7, () => {
  const e = R.pick([0.25, 0.3, 0.35, 0.4]);
  return mk({ tpl: "e-fecha", d: 7, kind: "num", q: `Num ciclo em regime permanente, Q̇<sub>H</sub> = 100 kW e Ẇ<sub>líq</sub> = ${fm(e * 100)} kW. O calor rejeitado |Q̇<sub>L</sub>| é...`, ok: "Menor que Q̇<sub>H</sub>, mas maior que Ẇ<sub>líq</sub>",
    bad: ["Igual a Ẇ<sub>líq</sub>", "Maior que Q̇<sub>H</sub>", "Zero, pois o ciclo converte tudo em trabalho"],
    why: `ΣQ̇ = ΣẆ: |Q̇<sub>L</sub>| = Q̇<sub>H</sub> − Ẇ<sub>líq</sub> = ${fm(100 - e * 100)} kW. Como η < 50 %, rejeita-se mais do que se converte.`, hint: "Calor líquido = potência líquida.", src: "Quadro e lousa" });
});
G("e-eta-faixa", 7, () => {
  const S = [
    ["uma usina a vapor (Rankine)", "≈ 30 a 40 %", ["≈ 80 a 90 %", "≈ 5 %", "≈ 100 %"]],
    ["uma turbina a gás (Brayton simples)", "≈ 25 a 40 %", ["≈ 80 a 90 %", "≈ 5 %", "≈ 100 %"]],
    ["uma máquina de Carnot entre 300 K e 1500 K", "≈ 80 %", ["≈ 30 %", "≈ 5 %", "≈ 100 %"]],
    ["uma máquina de Carnot entre 300 K e 600 K", "≈ 50 %", ["≈ 20 %", "≈ 80 %", "≈ 100 %"]],
  ];
  const [t, ok, bad] = R.pick(S);
  return mk({ tpl: "e-eta-faixa", d: 7, kind: "num", q: `Qual é a ordem de grandeza da eficiência térmica de <b>${t}</b>?`, ok, bad,
    why: "Máquinas reais de potência ficam em 30 a 40 %. Carnot é o teto: η = 1 − T<sub>L</sub>/T<sub>H</sub> (ex.: 1 − 300/1500 = 80 %).", hint: "Carnot é o teto; máquinas reais ficam bem abaixo.", src: "Lousa de 11/11" });
});
G("e-carnot", 9, () => {
  const TH = R.pick([600, 900, 1500, 3000]), eC = Math.round((1 - 300 / TH) * 100) / 100, imp = Math.round((eC + 0.05) * 100) / 100, f = (x) => "η = " + fm(x, 2);
  return mk({ tpl: "e-carnot", d: 9, kind: "num", q: `Qual dessas máquinas térmicas, operando entre <b>${TH} K</b> e <b>300 K</b>, é <b>impossível</b>?`, ok: f(imp), bad: [f(eC - 0.1), f(eC - 0.2), f(eC - 0.3)],
    why: `O teto é Carnot: η = 1 − 300/${TH} ≈ ${fm(eC, 2)}. Só ${f(imp)} passa dele.`, hint: "Nenhuma máquina supera 1 − TL/TH.", src: "Lousa de 11/11" });
});

function retry(g) { for (let i = 0; i < 40; i++) { const q = g.fn(); if (q) return q; } return null; }
const CONC_Q = (c) => mk({ ...c, kind: "conc" });
const ALL = [...CONC.map((c) => ({ tpl: c.tpl, d: c.d, fn: () => CONC_Q(c) })), ...GEN];
const SEEN_KEY = "seen";

// escolhe a pergunta do degrau L (0 a 15): dificuldade-alvo crescente; evita repetir molde na partida e entre partidas
const TARGET = [1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 7, 8, 8, 9, 10];
function pickQ(L, avoid = [], past = []) {
  const t = TARGET[L];
  let pool = ALL.filter((g) => Math.abs(g.d - t) <= (L === 14 ? 2 : 1) && !avoid.includes(g.tpl));
  if (!pool.length) pool = ALL.filter((g) => !avoid.includes(g.tpl));
  const fresh = pool.filter((g) => !past.includes(g.tpl));
  const g = R.pick(fresh.length ? fresh : pool);
  return retry(g);
}
function pickAny(avoid = [], past = []) {
  const pool = ALL.filter((g) => !avoid.includes(g.tpl)), fresh = pool.filter((g) => !past.includes(g.tpl));
  return retry(R.pick(fresh.length ? fresh : pool));
}
if (typeof module !== "undefined") module.exports = { ALL, CONC, GEN, pickQ, pickAny, mk, fm, TARGET, retry };
