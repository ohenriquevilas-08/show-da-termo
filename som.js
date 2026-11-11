// Som do Show da Termo: tudo sintetizado com Web Audio (nenhum arquivo). O AudioContext nasce no
// primeiro toque do jogador; sem áudio (ou com erro) o jogo segue mudo. store.mute guarda o mudo.
const SOM = (() => {
  let ctx = null, out = null, loop = null, urgent = false;
  const muted = () => { try { return !!store.mute; } catch (e) { return false; } };
  function init() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      ctx = new AC(); out = ctx.createGain(); out.gain.value = muted() ? 0 : 0.5;
      const comp = ctx.createDynamicsCompressor(); out.connect(comp); comp.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
  }
  try { ["pointerdown", "keydown"].forEach((ev) => window.addEventListener(ev, () => { const c = init(); if (c && c.state === "suspended") c.resume(); }, { capture: true })); } catch (e) {}
  // nota com envelope: f (Hz), início relativo t, duração d, tipo de onda, volume
  function tone(f, t = 0, d = 0.2, type = "sine", vol = 0.3, slide = 0) {
    if (!ctx || muted()) return;
    try {
      const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + t;
      o.type = type; o.frequency.setValueAtTime(f, t0); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t0 + d);
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.03, d / 4)); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + d + 0.05);
    } catch (e) {}
  }
  function noise(t = 0, d = 0.3, vol = 0.2, from = 800, to = 3000) {
    if (!ctx || muted()) return;
    try {
      const n = Math.floor(ctx.sampleRate * d), buf = ctx.createBuffer(1, n, ctx.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), t0 = ctx.currentTime + t;
      f.type = "bandpass"; f.Q.value = 2; f.frequency.setValueAtTime(from, t0); f.frequency.exponentialRampToValueAtTime(to, t0 + d);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      s.buffer = buf; s.connect(f); f.connect(g); g.connect(out); s.start(t0);
    } catch (e) {}
  }
  const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // suspense: pulso grave + tique agudo; acelera nos últimos segundos do cronômetro
  let beat = 0;
  function step() {
    if (!ctx || muted()) return;
    const bass = [45, 45, 44, 45, 46, 45, 44, 43][beat % 8];
    tone(midi(bass), 0, urgent ? 0.22 : 0.45, "triangle", 0.16);
    if (beat % 2 === 0) tone(midi(81), 0.02, 0.05, "square", urgent ? 0.05 : 0.025);
    beat++;
  }
  function think(on) {
    if (!on) { if (loop) clearInterval(loop); loop = null; urgent = false; return; }
    if (loop) return;
    beat = 0; step(); loop = setInterval(step, 620);
  }
  function setUrgent(u) {
    if (u === urgent || !loop) { urgent = u; return; }
    urgent = u; clearInterval(loop); loop = setInterval(step, u ? 300 : 620);
  }
  return {
    init, think, urgent: setUrgent,
    isMuted: muted,
    setMute(m) { try { store.mute = m; save(); } catch (e) {} if (out) out.gain.value = m ? 0 : 0.5; if (m) think(false); },
    tick() { init(); tone(1320, 0, 0.05, "square", 0.05); },
    confirm() { init(); think(false); [57, 60, 63, 66].forEach((m, i) => tone(midi(m), i * 0.04, 1.3, "sawtooth", 0.06)); tone(midi(45), 0, 1.4, "sine", 0.25); },
    right(level = 0) {
      init(); think(false);
      const base = 60 + Math.min(12, level); [0, 4, 7, 12].forEach((s, i) => tone(midi(base + s), i * 0.09, 0.35, "triangle", 0.28));
      for (let i = 0; i < 6 + level; i++) tone(midi(96 + (i % 3) * 2), 0.42 + i * 0.045, 0.06, "square", 0.05); // moedas
      if (level === 15) this.million();
    },
    wrong() { init(); think(false); tone(110, 0, 0.75, "sawtooth", 0.22, 0.8); tone(116, 0, 0.75, "sawtooth", 0.18, 0.8); },
    timeout() { init(); think(false); tone(880, 0, 0.12, "square", 0.12); tone(880, 0.18, 0.12, "square", 0.12); this.wrong(); },
    help(k) {
      init();
      if (k === "pular") noise(0, 0.35, 0.25, 400, 4000);
      if (k === "cartas") for (let i = 0; i < 5; i++) noise(i * 0.07, 0.06, 0.25, 2000, 2500);
      if (k === "univ") [72, 76, 79].forEach((m, i) => tone(midi(m), i * 0.12, 0.12, "sine", 0.22));
      if (k === "placas") [60, 64, 67, 72].forEach((m, i) => tone(midi(m), i * 0.06, 0.4, "triangle", 0.16));
    },
    million() { [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => tone(midi(60 + s), 0.6 + i * 0.1, 0.5, "triangle", 0.25)); [60, 64, 67, 72].forEach((m) => tone(midi(m), 1.4, 1.6, "sawtooth", 0.07)); noise(1.4, 1.2, 0.12, 3000, 9000); },
  };
})();
