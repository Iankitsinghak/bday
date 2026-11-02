import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, Crown, LockKeyhole, X } from 'lucide-react';
import { chapterContent } from '../story';
import SafeImage from './SafeImage';
import './chapters.css';

type Props = { opened: number[]; onOpen: (id: number) => void; onTruth: () => void };
const prompts: Record<number, { prompt: string; choices: string[] }> = {
  1: { prompt: 'Which note belongs in this margin?', choices: ['One more chapter. Of course.', 'Sleep is a social construct.', 'The villain has excellent taste.'] },
  2: { prompt: 'Choose the more dangerous temptation.', choices: ['Coffee, black and uncompromising.', 'Dark chocolate, kept just out of reach.'] },
  3: { prompt: 'Choose the crown’s only rule.', choices: ['No explanation required.', 'Wear it like you invented it.'] },
  4: { prompt: 'This page asks for one honest choice.', choices: ['Read the quieter truth.', 'Keep it between these pages.'] },
  5: { prompt: 'What rule should the author follow?', choices: ['Let the heroine write the ending.', 'Never underestimate her standards.'] },
  6: { prompt: 'Complete the final clue.', choices: ['The heroine is Shalu.', 'The author was never subtle.'] },
};

export default function Chapters({ opened, onOpen, onTruth }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const complete = opened.length === 6;
  const remaining = 6 - opened.length;
  const chapter = active ? chapterContent.find(item => item.id === active) : undefined;
  useEffect(() => { setChosen(null); }, [active]);
  function select() { if (!chapter || chosen === null) return; onOpen(chapter.id); }
  return <section className="chapters-section" id="chapters">
    <div className="chapters-intro"><span className="eyebrow">VOLUME I · THE SEALED CHAPTERS</span><h1>Six doors.<br/><em>One last truth.</em></h1><p>Every chapter is a small confession, disguised as a game. Start anywhere. Read everything.</p><div className="chapter-progress" aria-label={`${opened.length} of 6 chapters opened`}><span>{String(opened.length).padStart(2, '0')}</span><i/> <small>OF 06 CHAPTERS OPENED</small></div></div>
    <div className="chapter-map" aria-label="The six chapters">
      {chapterContent.map((item, index) => <button key={item.id} className={`chapter-seal chapter-seal-${index + 1} ${opened.includes(item.id) ? 'is-opened' : ''}`} onClick={() => setActive(item.id)} aria-haspopup="dialog"><span className="seal-number">{item.roman}</span><span className="seal-word">{opened.includes(item.id) ? 'READ' : 'OPEN'}</span><span className="seal-title">{item.title}</span><span className="seal-flourish">✦</span></button>)}
      <button className={`truth-seal ${complete ? 'is-unlocked' : ''}`} disabled={!complete} onClick={onTruth} aria-label={complete ? 'Open Chapter VII: The Truth' : `${remaining} ${remaining === 1 ? 'chapter' : 'chapters'} remaining to unlock the truth`}><span className="truth-lock">{complete ? <Crown size={21} strokeWidth={1}/> : <LockKeyhole size={20} strokeWidth={1}/>}</span><span>VII</span><small>THE TRUTH</small><i>{complete ? 'THE LAST DOOR IS OPEN' : `${remaining} ${remaining === 1 ? 'SEAL REMAINS' : 'SEALS REMAIN'}`}</i></button>
    </div>
    <p className="chapter-footnote">The final door waits for every chapter to be read.</p>
    <AnimatePresence>{chapter && <motion.div className="chapter-reader-backdrop" role="presentation" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={() => setActive(null)}><motion.article className="chapter-reader" role="dialog" aria-modal="true" aria-labelledby="reader-title" initial={{opacity:0,y:reduce?0:24}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduce?0:18}} transition={{duration:reduce?0:.32}} onMouseDown={event => event.stopPropagation()}><button className="reader-close" onClick={() => setActive(null)} aria-label="Close chapter"><X size={18}/></button><div className="reader-heading"><span className="eyebrow">CHAPTER {chapter.roman} · {chapter.subtitle}</span><h2 id="reader-title">{chapter.title}</h2><span className="reader-ornament">✦</span></div>{chapter.id === 3 && <SafeImage src="/photos/burgundy-portrait.jpeg" alt="Shalu in a burgundy outfit" className="reader-photo"/>}{chapter.id === 4 && <SafeImage src="/photos/floral-portrait.jpeg" alt="Shalu in a floral dress" className="reader-photo"/>}<p className="reader-body">{chapter.body}</p>{opened.includes(chapter.id) ? <motion.div initial={{opacity:0}} animate={{opacity:1}} className="reader-reveal"><Check size={16}/><p>{chapter.reveal}</p></motion.div> : <div className="chapter-choice"><span>{prompts[chapter.id].prompt}</span><div>{prompts[chapter.id].choices.map((choice, index) => <button key={choice} className={chosen === index ? 'chosen' : ''} onClick={() => setChosen(index)} aria-pressed={chosen === index}>{choice}<ArrowRight size={14}/></button>)}</div>{chosen !== null && <button className="primary-button unlock-chapter" onClick={select}>REVEAL THIS PAGE <ArrowRight size={15}/></button>}</div>}<div className="reader-footer"><span>THE FORBIDDEN CHAPTER</span><span>{opened.includes(chapter.id) ? 'MARKED AS READ' : 'A SEALED PAGE'}</span></div></motion.article></motion.div>}</AnimatePresence>
  </section>;
}
