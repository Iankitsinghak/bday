import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export default function Ambience({ stage }: { stage: string }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const player = new Audio();
    player.loop = true;
    audio.current = player;
    const onEnded = () => setPlaying(false);
    player.addEventListener('ended', onEnded);
    return () => {
      player.pause();
      player.removeEventListener('ended', onEnded);
      audio.current = null;
    };
  }, []);

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    player.pause();
    player.src = stage === 'letter' ? '/Lover.mp3' : '/Yellow.mp3';
    player.load();
    setPlaying(false);
    let cancelled = false;
    const start = async () => {
      if (cancelled || !player.paused) return;
      try {
        await player.play();
        if (!cancelled) { setPlaying(true); setError(false); }
      } catch {
        if (!cancelled) setError(true);
      }
    };
    void start();
    const retryAfterGesture = () => { void start(); };
    window.addEventListener('pointerdown', retryAfterGesture, { once: true });
    window.addEventListener('keydown', retryAfterGesture, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('pointerdown', retryAfterGesture);
      window.removeEventListener('keydown', retryAfterGesture);
    };
  }, [stage]);

  async function toggle() {
    if (!audio.current) return;
    if (playing) {
      audio.current.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.current.play();
      setPlaying(true);
      setError(false);
    } catch {
      setError(true);
    }
  }

  const title = stage === 'letter' ? 'LOVER' : 'YELLOW';
  return <div className="ambience-wrap"><button className={`sound-toggle ${playing ? 'sound-toggle--playing' : ''}`} onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} ${title}`} aria-pressed={playing}>{playing ? <Pause size={15}/> : <Play size={15}/>}<span className="sound-toggle__title">{title} <b>{playing ? 'ON' : 'OFF'}</b></span><span className="sound-wave" aria-hidden="true">{Array.from({ length: 17 }, (_, i) => <i key={i} style={{ '--bar': i } as React.CSSProperties}/>)}</span></button>{error && <span role="status" className="audio-error">Playback blocked. Tap play to start.</span>}</div>;
}
