import { useEffect, useRef, useState } from 'react';
import { Disc3 } from 'lucide-react';
type Lyric = { time: number; words: { time: number; text: string }[] };

export default function Ambience({ stage }: { stage: string }) {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const [lyrics, setLyrics] = useState<Lyric[]>([]);
  const [lyricIndex, setLyricIndex] = useState(-1);
  const [wordIndex, setWordIndex] = useState(-1);
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
    let cancelled = false;
    const file = stage === 'letter' ? '/lover-lyrics.lrc' : '/yellow-lyrics.lrc';
    fetch(file).then(r => r.text()).then(text => {
      const rows: Lyric[] = [];
      for (const line of text.split(/\r?\n/)) {
        const match = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
        if (!match) continue;
        const lineTime = Number(match[1]) * 60 + Number(match[2]);
        let nextTime = lineTime;
        const words = match[3].split(/(<\d+:\d+(?:\.\d+)?>)/).flatMap(part => {
          const stamp = part.match(/^<(\d+):(\d+(?:\.\d+)?)>$/);
          if (stamp) { nextTime = Number(stamp[1]) * 60 + Number(stamp[2]); return []; }
          return part.trim().split(/\s+/).filter(Boolean).map(text => ({ time: nextTime, text }));
        });
        if (words.length) rows.push({ time: lineTime, words });
      }
      if (!cancelled) { setLyrics(rows); setLyricIndex(-1); }
    }).catch(() => { if (!cancelled) setLyrics([]); });
    return () => { cancelled = true; };
  }, [stage === 'letter']);

  useEffect(() => {
    const player = audio.current;
    if (!player) return;
    const sync = () => {
      let current = -1;
      for (let i = 0; i < lyrics.length; i += 1) {
        if (lyrics[i].time <= player.currentTime) current = i;
        else break;
      }
      setLyricIndex(current);
      const words = current >= 0 ? lyrics[current].words : [];
      let activeWord = -1;
      for (let i = 0; i < words.length; i += 1) { if (words[i].time <= player.currentTime) activeWord = i; else break; }
      setWordIndex(activeWord);
    };
    player.addEventListener('timeupdate', sync);
    sync();
    return () => player.removeEventListener('timeupdate', sync);
  }, [lyrics]);

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
  return <div className="ambience-wrap"><button className={`sound-toggle ${playing ? 'sound-toggle--playing' : ''}`} onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} ${title}`} aria-pressed={playing}><Disc3 className="player-disc" size={27} aria-hidden="true"/><span>{title} <b>{playing ? 'ON' : 'OFF'}</b></span></button><span className="music-lyric" aria-live="polite">{playing && lyricIndex >= 0 ? lyrics[lyricIndex].words.map((word, index) => <span key={`${word.time}-${index}`} className={index === wordIndex ? 'lyric-word--current' : ''}>{word.text}{index < lyrics[lyricIndex].words.length - 1 ? ' ' : ''}</span>) : ''}</span>{error && <span role="status" className="audio-error">Playback blocked. Tap play to start.</span>}</div>;
}
