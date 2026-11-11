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

G("n-ke", 4, () => {
  const V = R.pick([50, 80, 120, 150, 200, 250, 300]), c = V * V / 2000;
  return mk({ tpl: "n-ke", d: 4, kind: "num", q: `Um fluido escoa a <b>${V} m/s</b>. Qual a energia cinética específica V²/2, <b>em kJ/kg</b>?`,
    ok: fm(c, c < 100 ? 2 : 1) + " kJ/kg", bad: [fm(V * V / 2) + " kJ/kg", fm(V * V / 200, 1) + " kJ/kg", fm(V * V / 20000, 3) + " kJ/kg"],
    why: `V²/2 = ${V}²/2 = ${fm(V * V / 2)} J/kg = <b>${fm(c, 2)} kJ/kg</b> (divide por 1000).`, hint: "Lembre: V²/2 sai em J/kg e h está em kJ/kg.", src: "Vídeo T4-56" });
});
G("n-vol", 5, () => {
  const T = R.pick([280, 290, 300, 310, 320]), Vd = R.pick([5, 8, 10, 12, 15, 20]), c = 100 * Vd / (RAR * T);
  return mk({ tpl: "n-vol", d: 5, kind: "num", q: `Ar (gás ideal, R = 0,287 kJ/kg·K) a <b>100 kPa e ${T} K</b> com vazão volumétrica de <b>${Vd} m³/s</b>. Qual a vazão mássica?`,
    ok: fm(c, 1) + " kg/s", bad: [fm(100 * Vd / (RAR * (T - 273)), 1) + " kg/s", fm(100 * Vd / (8.314 * T), 1) + " kg/s", fm(100 * Vd / T, 1) + " kg/s"],
    why: `ṁ = PV̇/(RT) = 100 · ${Vd}/(0,287 · ${T}) = <b>${fm(c, 1)} kg/s</b> (T em kelvin).`, hint: "Gás ideal: PV̇ = ṁRT, com T absoluta.", src: "Prova 2 de 03/07, Q2" });
});
G("n-misturah", 5, () => {
  const x = R.pick([0.8, 0.84, 0.88, 0.92, 0.94, 0.96]), hl = 191.81, hlv = 2392.82, hv = 2584.63, c = hl + x * hlv;
  return mk({ tpl: "n-misturah", d: 5, kind: "num", q: `Água a <b>10 kPa</b> com título <b>x = ${fm(x, 2)}</b>. Dados: h<sub>l</sub> = 191,81, h<sub>lv</sub> = 2392,82 e h<sub>v</sub> = 2584,63 kJ/kg. Qual a entalpia h?`,
    ok: fm(c, 1) + " kJ/kg", bad: [fm(x * hlv, 1) + " kJ/kg", fm(hl + (1 - x) * hlv, 1) + " kJ/kg", fm(x * hv, 1) + " kJ/kg"],
    why: `h = h<sub>l</sub> + x·h<sub>lv</sub> = 191,81 + ${fm(x, 2)} · 2392,82 = <b>${fm(c, 1)} kJ/kg</b>.`, hint: "h = h_l + x·h_lv.", src: "Vídeo R4-118, Passo 3" });
});
G("n-interp", 6, () => {
  const [a, b] = R.pick([[3316.15, 3433.76], [3301.76, 3422.12]]), T = R.pick([460, 470, 480, 490]), f = (T - 450) / 50, c = a + f * (b - a);
  return mk({ tpl: "n-interp", d: 6, kind: "num", q: `Numa tabela, h vale <b>${fm(a, 2)} kJ/kg a 450 °C</b> e <b>${fm(b, 2)} kJ/kg a 500 °C</b> (mesma pressão). Interpole linearmente h a <b>${T} °C</b>.`,
    ok: fm(c, 1) + " kJ/kg", bad: [fm(a + (1 - f) * (b - a), 1) + " kJ/kg", fm((a + b) / 2, 1) + " kJ/kg", fm(a + (T - 450) * (b - a) / 100, 1) + " kJ/kg"],
    why: `Fração = (${T} − 450)/50 = ${fm(f, 1)}. h = ${fm(a, 2)} + ${fm(f, 1)} · (${fm(b, 2)} − ${fm(a, 2)}) = <b>${fm(c, 1)} kJ/kg</b>.`, hint: "h = h₁ + fração · (h₂ − h₁), fração = (T − 450)/50.", src: "Vídeo R4-118, Passo 2" });
});
G("n-turbar", 6, () => {
  const m = R.pick([2, 3, 5, 8, 10, 12]), dT = R.pick([200, 250, 300, 350, 400]), T1 = R.pick([900, 1000, 1100, 1200]), c = m * CP * dT;
  return mk({ tpl: "n-turbar", d: 6, kind: "num", q: `Turbina de ar adiabática, <b>${m} kg/s</b>, entra a <b>${T1} K</b> e sai a <b>${T1 - dT} K</b> (cp = 1,005 kJ/kg·K). Qual a potência?`,
    ok: fm(c) + " kW", bad: [fm(m * CV * dT) + " kW", fm(CP * dT) + " kW", fm(c * 1000) + " kW"],
    why: `Ẇ = ṁ·cp·(T₁ − T₂) = ${m} · 1,005 · ${dT} = <b>${fm(c)} kW</b>.`, hint: "Turbina adiabática de gás ideal: Ẇ = ṁ·cp·ΔT.", src: "Vídeo T4-46" });
});
G("n-compke", 7, () => {
  const W = R.pick([3000, 4000, 5000, 6000]), dT = R.pick([300, 350, 400, 410, 450]), V = R.pick([90, 100, 120, 150]), ke = V * V / 2000, c = W / (CP * dT + ke);
  return mk({ tpl: "n-compke", d: 7, kind: "num", q: `Compressor adiabático de ar (cp = 1,005): potência de acionamento <b>${fm(W)} kW</b>, o ar sobe <b>${dT} K</b> e sai a <b>${V} m/s</b> (entra com V ≈ 0). Qual a vazão mássica?`,
    ok: fm(c, 2) + " kg/s", bad: [fm(W / (CP * dT), 2) + " kg/s", fm(W / (CP * dT + V * V / 2), 2) + " kg/s", fm(W / (CP * dT - ke), 2) + " kg/s"],
    why: `ṁ = Ẇ/(cp·ΔT + V²/2) = ${fm(W)}/(${fm(CP * dT, 1)} + ${fm(ke, 2)}) = <b>${fm(c, 2)} kg/s</b>. A energia cinética soma (÷1000).`, hint: "O trabalho que entra vira entalpia mais energia cinética.", src: "Vídeo T4-56" });
});
G("n-extrac", 7, () => {
  const m = R.pick([4, 5, 6, 8, 10]), f = R.pick([0.1, 0.15, 0.2, 0.25, 0.3]), h1 = 3456.48, h2 = 3157.65, h3 = 2870.46;
  const c = m * h1 - f * m * h2 - (1 - f) * m * h3;
  return mk({ tpl: "n-extrac", d: 7, kind: "num", q: `Turbina a vapor adiabática recebe <b>${m} kg/s</b> (h<sub>1</sub> = 3456,5 kJ/kg). <b>${fm(f * 100)}%</b> é extraído (h<sub>2</sub> = 3157,7) e o resto sai com h<sub>3</sub> = 2870,5. Qual a potência?`,
    ok: fm(c) + " kW", bad: [fm(m * (h1 - h3)) + " kW", fm(m * h1 - f * m * h3 - (1 - f) * m * h2) + " kW", fm(m * h1 - m * h2 - m * h3) + " kW"],
    why: `ṁ₂ = ${fm(f * m, 2)} e ṁ₃ = ${fm((1 - f) * m, 2)} kg/s. Ẇ = ṁ₁h₁ − ṁ₂h₂ − ṁ₃h₃ = <b>${fm(c)} kW</b>.`, hint: "Primeiro a massa: ṁ₃ = ṁ₁ − ṁ₂. Depois cada saída com sua entalpia.", src: "Vídeo T4-84" });
});
G("n-cond", 7, () => {
  const mv = R.pick([0.5, 1, 2, 3]), x = R.pick([0.9, 0.92, 0.95]), dT = R.pick([8, 10, 12, 15]), hlv = 2392.82, c = mv * x * hlv / (4.18 * dT);
  return mk({ tpl: "n-cond", d: 7, kind: "num", q: `Condensador isolado: <b>${fm(mv, 1)} kg/s</b> de vapor a 10 kPa com <b>x = ${fm(x, 2)}</b> sai como líquido saturado (h<sub>lv</sub> = 2392,8 kJ/kg). A água de resfriamento (cp = 4,18) sobe <b>${dT} K</b>. Qual a vazão da água?`,
    ok: fm(c, 1) + " kg/s", bad: [fm(mv * hlv / (4.18 * dT), 1) + " kg/s", fm(mv * x * hlv / 4.18, 1) + " kg/s", fm(mv * (1 - x) * hlv / (4.18 * dT), 1) + " kg/s"],
    why: `O vapor perde x·h<sub>lv</sub> = ${fm(x * hlv, 1)} kJ/kg. ṁ<sub>a</sub> = ${fm(mv, 1)} · ${fm(x * hlv, 1)}/(4,18 · ${dT}) = <b>${fm(c, 1)} kg/s</b>.`, hint: "Calor que o vapor perde = calor que a água ganha.", src: "Vídeos T4-91 e R4-119" });
});
G("n-pumph", 8, () => {
  const Wp = R.pick([200, 250, 300, 400]), m = R.pick([20, 25, 40, 50]), h7 = R.pick([168, 190, 200]), c = h7 + Wp / m;
  return mk({ tpl: "n-pumph", d: 8, kind: "num", q: `Bomba adiabática, vazão <b>${m} kg/s</b>, potência de acionamento <b>${Wp} kW</b>. A entalpia na entrada é <b>${h7} kJ/kg</b>. Qual a entalpia na saída?`,
    ok: fm(c, 1) + " kJ/kg", bad: [fm(h7 - Wp / m, 1) + " kJ/kg", fm(h7 + Wp * m) + " kJ/kg", fm(h7 + Wp) + " kJ/kg"],
    why: `h<sub>s</sub> = h<sub>e</sub> + Ẇ/ṁ = ${h7} + ${Wp}/${m} = <b>${fm(c, 1)} kJ/kg</b>.`, hint: "A bomba entrega Ẇ/ṁ de entalpia por quilo.", src: "Vídeo R4-119-120, Passo 5" });
});
G("n-vel", 8, () => {
  const m = R.pick([10, 25, 40]), v = R.pick([0.0602, 0.0616, 0.0733, 0.0548]), D = R.pick([0.15, 0.2, 0.25]), A = Math.PI * D * D / 4, c = m * v / A;
  return mk({ tpl: "n-vel", d: 8, kind: "num", q: `Vapor escoa a <b>${m} kg/s</b> num tubo de <b>${fm(D * 1000)} mm</b> de diâmetro, com v = <b>${fm(v, 4)} m³/kg</b>. Qual a velocidade?`,
    ok: fm(c, 1) + " m/s", bad: [fm(4 * m * v / (Math.PI * D), 1) + " m/s", fm(m * v / (Math.PI * D * D), 1) + " m/s", fm(m / (v * A), 0) + " m/s"],
    why: `A = π·${fm(D, 2)}²/4 = ${fm(A, 4)} m². V = ṁ·v/A = ${m} · ${fm(v, 4)}/${fm(A, 4)} = <b>${fm(c, 1)} m/s</b>.`, hint: "V = ṁ·v/A, com A = πD²/4 e D em metros.", src: "Vídeo R4-118, Passo 2" });
});
function braytonTs() {
  const T1 = R.pick([290, 300, 320]), T2 = T1 + R.pick([60, 70, 80, 100]), T3 = R.pick([1100, 1200, 1300]), T4 = T3 - R.pick([500, 550, 600, 650]);
  return { T1, T2, T3, T4, m: R.pick([5, 8, 10, 12, 15]) };
}
const brayStmt = (b) => `Brayton com ar (cp = 1,005 kJ/kg·K), <b>${b.m} kg/s</b>: T<sub>1</sub> = ${b.T1} K (entrada do compressor), T<sub>2</sub> = ${b.T2} K, T<sub>3</sub> = ${b.T3} K (entrada da turbina) e T<sub>4</sub> = ${b.T4} K.`;
G("n-brayQ", 8, () => {
  const b = braytonTs(), c = b.m * CP * (b.T3 - b.T2);
  return mk({ tpl: "n-brayQ", d: 8, kind: "num", q: brayStmt(b) + " Qual o calor recebido no aquecedor (2 → 3)?",
    ok: fm(c) + " kW", bad: [fm(b.m * CP * (b.T4 - b.T1)) + " kW", fm(b.m * CP * (b.T3 - b.T1)) + " kW", fm(b.m * CP * (b.T3 - b.T4)) + " kW"],
    why: `Q̇<sub>H</sub> = ṁ·cp·(T₃ − T₂) = ${b.m} · 1,005 · ${b.T3 - b.T2} = <b>${fm(c)} kW</b>.`, hint: "O aquecedor liga a saída do compressor (2) à entrada da turbina (3).", src: "Prova 2 de 03/07, Q2" });
});
G("n-brayW", 8, () => {
  const b = braytonTs(), Wt = b.m * CP * (b.T3 - b.T4), Wc = b.m * CP * (b.T2 - b.T1), c = Wt - Wc;
  return mk({ tpl: "n-brayW", d: 8, kind: "num", q: brayStmt(b) + " Qual a potência líquida do ciclo?",
    ok: fm(c) + " kW", bad: [fm(Wt + Wc) + " kW", fm(Wt) + " kW", fm(b.m * CP * (b.T3 - b.T2)) + " kW"],
    why: `Ẇ<sub>T</sub> = ${fm(Wt)} kW, Ẇ<sub>c</sub> = ${fm(Wc)} kW. Ẇ<sub>líq</sub> = Ẇ<sub>T</sub> − Ẇ<sub>c</sub> = <b>${fm(c)} kW</b>.`, hint: "O compressor consome parte da turbina.", src: "Prova 2 de 03/07, Q2" });
});
G("n-eta", 9, () => {
  const eta = R.pick([0.3, 0.32, 0.35, 0.38, 0.4]), Wt = R.pick([20000, 24800, 25000, 30000]), Wb = R.pick([300, 500, 800]), QH = Math.round((Wt - Wb) / eta / 10) * 10, e = (Wt - Wb) / QH;
  return mk({ tpl: "n-eta", d: 9, kind: "num", q: `Rankine: turbina <b>${fm(Wt)} kW</b>, bomba <b>${fm(Wb)} kW</b> (consome) e calor na caldeira + economizador <b>${fm(QH)} kW</b>. Qual a eficiência térmica?`,
    ok: fm(e * 100, 1) + " %", bad: [fm(Wt / QH * 100, 1) + " %", fm((Wt + Wb) / QH * 100, 1) + " %", fm((QH - (Wt - Wb)) / QH * 100, 1) + " %"],
    why: `η = (Ẇ<sub>T</sub> − Ẇ<sub>P</sub>)/Q̇<sub>H</sub> = (${fm(Wt)} − ${fm(Wb)})/${fm(QH)} = <b>${fm(e * 100, 1)} %</b>.`, hint: "Potência líquida dividida pelo calor que entra.", src: "Vídeo R4-119-120" });
});
G("n-fecha", 9, () => {
  const Wc = R.pick([300, 600, 900, 1200, 1500]), Wt = Wc * R.pick([5, 6, 7, 8]), QL = R.pick([2000, 3000, 4000, 5000]) , QH = Wt - Wc + QL;
  return mk({ tpl: "n-fecha", d: 9, kind: "num", q: `Num ciclo Brayton: Q̇<sub>H</sub> = <b>${fm(QH)} kW</b>, Ẇ<sub>T</sub> = <b>${fm(Wt)} kW</b> e Ẇ<sub>c</sub> = <b>${fm(Wc)} kW</b>. Qual o calor rejeitado (módulo)?`,
    ok: fm(QL) + " kW", bad: [fm(QH - Wt) + " kW", fm(QH - Wt - Wc) + " kW", fm(Wt - Wc) + " kW"],
    why: `ΣQ̇ = ΣẆ: Q̇<sub>H</sub> − |Q̇<sub>L</sub>| = Ẇ<sub>T</sub> − Ẇ<sub>c</sub>. |Q̇<sub>L</sub>| = ${fm(QH)} − (${fm(Wt)} − ${fm(Wc)}) = <b>${fm(QL)} kW</b>.`, hint: "Calor líquido = potência líquida.", src: "Quadro e lousa" });
});
G("n-carnot", 9, () => {
  const TH = R.pick([1200, 1500, 1800, 2000]), TL = R.pick([290, 300]), eC = 1 - TL / TH, imp = Math.random() < 0.5;
  const eta = imp ? Math.min(0.97, eC + R.pick([0.02, 0.03, 0.04])) : eC - R.pick([0.1, 0.15, 0.2]), QH = 10000, QL = Math.round(QH * (1 - eta));
  const e2 = 1 - QL / QH, bad = e2 > eC;
  return mk({ tpl: "n-carnot", d: 9, kind: "num", q: `Máquina entre <b>${TH} K</b> e <b>${TL} K</b>: Q̇<sub>H</sub> = <b>${fm(QH)} kW</b> e |Q̇<sub>L</sub>| = <b>${fm(QL)} kW</b>. Ela é possível?`,
    ok: bad ? "Impossível: η supera o limite de Carnot" : "Possível: η está abaixo do limite de Carnot",
    bad: [bad ? "Possível: η está abaixo do limite de Carnot" : "Impossível: η supera o limite de Carnot", "Possível, pois η < 1 sempre basta", "Impossível, pois Q̇<sub>L</sub> não pode ser positivo"],
    why: `η = 1 − ${fm(QL)}/${fm(QH)} = ${fm(e2, 3)}; η<sub>Carnot</sub> = 1 − ${TL}/${TH} = ${fm(eC, 3)}. ${bad ? "η > η<sub>Carnot</sub>: impossível." : "η < η<sub>Carnot</sub>: possível."}`, hint: "Compare η = 1 − QL/QH com 1 − TL/TH.", src: "Lousa de 11/11" });
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
