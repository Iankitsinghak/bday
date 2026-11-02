import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function Ambience() {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const context = useRef<AudioContext | null>(null);
  useEffect(() => () => { void context.current?.close(); }, []);
  async function toggle() {
    if (playing) { await context.current?.suspend(); setPlaying(false); return; }
    try {
      if (!context.current || context.current.state === 'closed') {
        const audio = new AudioContext(); context.current = audio;
        const master = audio.createGain(); master.gain.value = 0.018; master.connect(audio.destination);
        [130.81, 196, 261.63, 311.13].forEach((hz, index) => {
          const oscillator = audio.createOscillator(); const gain = audio.createGain();
          oscillator.type = 'sine'; oscillator.frequency.value = hz; oscillator.detune.value = index % 2 ? 3 : -3;
          gain.gain.value = 0; oscillator.connect(gain); gain.connect(master); oscillator.start();
          gain.gain.linearRampToValueAtTime(0.45, audio.currentTime + 3 + index);
          const lfo = audio.createOscillator(); lfo.frequency.value = 0.06 + index * .015;
          const depth = audio.createGain(); depth.gain.value = 0.15; lfo.connect(depth); depth.connect(gain.gain); lfo.start();
        });
      }
      await context.current.resume(); setPlaying(true); setError(false);
    } catch { setError(true); }
  }
  return <div className="ambience-wrap"><button className="sound-toggle" onClick={toggle} aria-label={playing ? 'Mute ambient audio' : 'Play ambient audio'} aria-pressed={playing}>{playing ? <Volume2 size={15}/> : <VolumeX size={15}/>}<span>AMBIENCE <b>{playing ? 'ON' : 'OFF'}</b></span></button>{error && <span role="status" className="audio-error">Audio unavailable in this browser.</span>}</div>;
}
