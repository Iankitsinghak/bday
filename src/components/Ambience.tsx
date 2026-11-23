import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

export default function Ambience({ stage }: { stage: string }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const savedTimes = useRef<Record<string, number>>({});

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
    const source = stage === 'letter' ? '/Lover.mp3' : '/Yellow.mp3';
    if (player.src.endsWith(source)) return;
    if (player.src) savedTimes.current[player.src.split('/').pop() || ''] = player.currentTime;
    const wasPlaying = !player.paused;
    player.pause();
    player.src = source;
    player.load();
    setPlaying(false);
    let cancelled = false;
    const restoreTime = () => {
      const saved = savedTimes.current[source.split('/').pop() || ''] || 0;
      if (saved > 0 && Number.isFinite(saved)) player.currentTime = Math.min(saved, Math.max(0, player.duration - 0.25));
    };
    const start = async () => {
      if (cancelled || !player.paused || (!wasPlaying && !error)) return;
      try {
        restoreTime();
        await player.play();
        if (!cancelled) { setPlaying(true); setError(false); }
      } catch {
        if (!cancelled) setError(true);
      }
    };
    const onReady = () => { if (wasPlaying || error) void start(); };
    player.addEventListener('loadedmetadata', onReady, { once: true });
    if (player.readyState >= 1) onReady();
    const retryAfterGesture = () => { void start(); };
    window.addEventListener('pointerdown', retryAfterGesture, { once: true });
    window.addEventListener('keydown', retryAfterGesture, { once: true });
    return () => {
      cancelled = true;
      player.removeEventListener('loadedmetadata', onReady);
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
  return <div className="ambience-wrap"><button className={`sound-toggle ${playing ? 'sound-toggle--playing' : ''}`} onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} ${title}`} aria-pressed={playing}>{playing ? <Pause size={15}/> : <Play size={15}/>}<svg className="guitarist" viewBox="0 0 46 42" aria-hidden="true"><circle className="guitarist__head" cx="13" cy="7" r="3.3"/><path className="guitarist__body" d="M14 11l3 10-4 8m4-8 8 4m-8-4-7 5-4 9m11-9 7 9"/><path className="guitarist__guitar" d="M23 23c-4-1-7 2-6 5 1 3 4 4 7 2l9-7-3-4zM26 24l12-12m-1-1 3 2"/><path className="guitarist__strings" d="m25 25 13-12m-11 14 13-12"/></svg><span>{title} <b>{playing ? 'ON' : 'OFF'}</b></span></button>{error && <span role="status" className="audio-error">Playback blocked. Tap play to start.</span>}</div>;
}
