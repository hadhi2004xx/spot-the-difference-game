// All sound is synthesised with WebAudio — short oscillator notes, no audio files, so the
// game ships no assets and plays offline. The context is created lazily on the first user
// gesture (browsers refuse one earlier) and every call is a no-op while muted or unavailable.

let context = null;
let muted = false;

/** Create or resume the shared AudioContext; returns null when audio is unavailable. */
function audioContext() {
  if (typeof window === 'undefined' || !window.AudioContext) return null;
  if (context === null) context = new window.AudioContext();
  if (context.state === 'suspended') context.resume();
  return context;
}

/** Flip the mute flag; returns the new state. */
export function toggleMuted() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

/** One enveloped tone starting `delay` seconds from now. */
function tone(frequency, delay, duration, type, volume) {
  const ac = audioContext();
  if (ac === null || muted) return;
  const start = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** A find: a bright two-note chime. */
export function playFind() {
  tone(1318, 0, 0.16, 'sine', 0.20);
  tone(1760, 0.07, 0.24, 'sine', 0.18);
}

/** A miss: a short low buzz. */
export function playMiss() {
  tone(160, 0, 0.16, 'sawtooth', 0.10);
  tone(120, 0.05, 0.18, 'sawtooth', 0.08);
}

/** A hint: a rising shimmer that settles where the eye should go. */
export function playHint() {
  tone(880, 0, 0.14, 'triangle', 0.14);
  tone(1108, 0.09, 0.14, 'triangle', 0.14);
  tone(1479, 0.18, 0.26, 'triangle', 0.14);
}

/** A button press. */
export function playClick() {
  tone(660, 0, 0.07, 'triangle', 0.10);
}

/** The last-seconds clock tick. */
export function playTick() {
  tone(1046, 0, 0.05, 'square', 0.05);
}

/** Level cleared: a small fanfare. */
export function playWin() {
  const notes = [523, 659, 784, 1046];
  notes.forEach((note, index) => tone(note, index * 0.11, 0.22, 'triangle', 0.16));
  tone(1318, 0.46, 0.4, 'sine', 0.16);
}

/** Time up: a falling pair. */
export function playLose() {
  tone(392, 0, 0.25, 'triangle', 0.14);
  tone(311, 0.18, 0.4, 'triangle', 0.14);
}
