import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Crown, LockKeyhole, Sparkles, X } from 'lucide-react';
import { chapterContent } from '../story';
import SafeImage from './SafeImage';
import './chapters.css';
import './chapter-navigation.css';

type Props = { opened: number[]; onOpen: (id: number) => void; onTruth: () => void };

const prompts: Record<number, { prompt: string; choices: string[] }> = {
  1: { prompt: 'Which note belongs in this margin?', choices: ['One more chapter. Of course.', 'Sleep is a social construct.', 'The villain has excellent taste.'] },
  2: { prompt: 'Choose the more dangerous temptation.', choices: ['Coffee, black and uncompromising.', 'Dark chocolate, kept just out of reach.'] },
  3: { prompt: 'Choose the crown’s only rule.', choices: ['No explanation required.', 'Wear it like you invented it.'] },
  4: { prompt: 'This page asks for one honest choice.', choices: ['Read the quieter truth.', 'Keep it between these pages.'] },
  5: { prompt: 'What rule should the author follow?', choices: ['Let the heroine write the ending.', 'Never underestimate her standards.'] },
  6: { prompt: 'Complete the final clue.', choices: ['The heroine is Shalu.', 'The author was never subtle.'] },
};

const marks = ['✦', '☽', '♛', '❦', '✧', '✶'];

export default function Chapters({ opened, onOpen, onTruth }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [turnDirection, setTurnDirection] = useState(1);
  const reduce = useReducedMotion();
  const complete = opened.length === 6;
  const remaining = 6 - opened.length;
  const chapter = active ? chapterContent.find(item => item.id === active) : undefined;
  const previousChapter = chapter ? chapterContent.find(item => item.id === chapter.id - 1) : undefined;
  const nextChapter = chapter ? chapterContent.find(item => item.id === chapter.id + 1) : undefined;

  useEffect(() => { setChosen(null); }, [active]);

  function select() {
    if (!chapter || chosen === null) return;
    onOpen(chapter.id);
  }

  function turnChapter(direction: 1 | -1) {
    if (!chapter) return;
    const destination = chapter.id + direction;
    if (destination < 1 || destination > chapterContent.length) return;
    setTurnDirection(direction);
    setActive(destination);
  }

  return <section className={`chapters-section ${complete ? 'chapters-complete' : ''}`} id="chapters">
    <div className="chapters-atmosphere" aria-hidden="true"><span/><span/><span/></div>
    <div className="chapters-intro">
      <span className="eyebrow">VOLUME I · THE SEALED CHAPTERS</span>
      <h1>Six doors.<br/><em>One last truth.</em></h1>
      <p>Every chapter is a small confession, disguised as a game. Start anywhere. Read everything.</p>
      <div className="chapter-progress" aria-label={`${opened.length} of 6 chapters opened`}><span>{String(opened.length).padStart(2, '0')}</span><i/> <small>OF 06 CHAPTERS OPENED</small></div>
    </div>

    <div className="chapter-constellation" aria-hidden="true"><svg viewBox="0 0 1000 550" preserveAspectRatio="none"><path d="M92 93 C220 18 267 210 405 138 S595 92 668 203 S850 255 927 90"/><path d="M86 369 C228 446 323 292 469 379 S699 507 917 403"/></svg></div>
    <div className="chapter-map" aria-label="The six chapters">
      {chapterContent.map((item, index) => {
        const read = opened.includes(item.id);
        return <motion.button key={item.id} layout className={`chapter-seal chapter-seal-${index + 1} ${read ? 'is-opened' : ''}`} onClick={() => setActive(item.id)} aria-haspopup="dialog" initial={{opacity:0, y:reduce ? 0 : 20}} animate={{opacity:1,y:0}} transition={{delay:reduce ? 0 : index * .08, duration:reduce ? 0 : .5}} whileHover={reduce ? undefined : {y:-10,rotate:index % 2 ? -.7 : .7}} whileTap={reduce ? undefined : {scale:.985}}>
          <span className="seal-top"><span>{read ? 'READ' : 'SEALED'}</span><span className="seal-mark">{marks[index]}</span></span>
          <span className="seal-number">{item.roman}</span>
          <span className="seal-title">{item.title}</span>
          <span className="seal-subtitle">{item.subtitle}</span>
          <span className="seal-action">{read ? 'RETURN TO PAGE' : 'OPEN THE SEAL'} <ArrowRight size={12}/></span>
          {read && <span className="seal-read"><Check size={10}/> READ</span>}
        </motion.button>;
      })}
      <motion.button layout className={`truth-seal ${complete ? 'is-unlocked' : ''}`} disabled={!complete} onClick={onTruth} aria-label={complete ? 'Open Chapter VII: The Truth' : `${remaining} ${remaining === 1 ? 'chapter' : 'chapters'} remaining to unlock the truth`} whileHover={complete && !reduce ? {scale:1.012} : undefined}>
        <span className="truth-rings" aria-hidden="true"><i/><i/><i/></span>
        <span className="truth-lock">{complete ? <Crown size={26} strokeWidth={1}/> : <LockKeyhole size={24} strokeWidth={1}/>}</span>
        <span className="truth-number">VII</span>
        <small>THE TRUTH</small>
        <i className="truth-note">{complete ? 'THE LAST DOOR IS OPEN' : `${remaining} ${remaining === 1 ? 'SEAL REMAINS' : 'SEALS REMAIN'}`}</i>
        {complete && <span className="truth-action">ENTER THE REVEAL <ArrowRight size={13}/></span>}
      </motion.button>
    </div>
    <p className="chapter-footnote">The final door waits for every chapter to be read.</p>

    <AnimatePresence>{chapter && <motion.div className={`chapter-reader-backdrop reader-theme-${chapter.id}`} role="presentation" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={() => setActive(null)}>
      <AnimatePresence mode="wait"><motion.article key={chapter.id} className="chapter-reader" role="dialog" aria-modal="true" aria-labelledby="reader-title" initial={{opacity:0,x:reduce?0:42*turnDirection,y:reduce?0:18,rotateY:reduce?0:turnDirection*-8}} animate={{opacity:1,x:0,y:0,rotateY:0}} exit={{opacity:0,x:reduce?0:-42*turnDirection,y:reduce?0:-12,rotateY:reduce?0:turnDirection*8}} transition={{duration:reduce?0:.44, ease:[.16,1,.3,1]}} onMouseDown={event => event.stopPropagation()}>
        <span className="reader-sunburst" aria-hidden="true"/>
        <button className="reader-close" onClick={() => setActive(null)} aria-label="Close chapter"><X size={18}/></button>
        <div className="reader-heading"><span className="eyebrow">CHAPTER {chapter.roman} · {chapter.subtitle}</span><h2 id="reader-title">{chapter.title}</h2><span className="reader-ornament">{marks[chapter.id - 1]}</span></div>
        {chapter.id === 3 && <SafeImage src="/photos/burgundy-portrait.jpeg" alt="Shalu in a burgundy outfit" className="reader-photo"/>}
        {chapter.id === 4 && <SafeImage src="/photos/floral-portrait.jpeg" alt="Shalu in a floral dress" className="reader-photo"/>}
        <p className="reader-body">{chapter.body}</p>
        {opened.includes(chapter.id) ? <><motion.div initial={{opacity:0,y:reduce?0:8}} animate={{opacity:1,y:0}} className="reader-reveal"><Check size={16}/><p>{chapter.reveal}</p></motion.div>{nextChapter && <button className="turn-page-button" onClick={() => turnChapter(1)}>TURN TO CHAPTER {nextChapter.roman} <span>{nextChapter.title}</span><ArrowRight size={15}/></button>}</> : <div className="chapter-choice"><span>{prompts[chapter.id].prompt}</span><div>{prompts[chapter.id].choices.map((choice, index) => <button key={choice} className={chosen === index ? 'chosen' : ''} onClick={() => setChosen(index)} aria-pressed={chosen === index}>{choice}<ArrowRight size={14}/></button>)}</div>{chosen !== null && <motion.button initial={{opacity:0,y:reduce?0:8}} animate={{opacity:1,y:0}} className="primary-button unlock-chapter" onClick={select}>REVEAL THIS PAGE <Sparkles size={14}/></motion.button>}</div>}
        <nav className="reader-navigation" aria-label="Chapter navigation"><button disabled={!previousChapter} onClick={() => turnChapter(-1)}><ArrowLeft size={14}/><span>{previousChapter ? `CH. ${previousChapter.roman}` : 'BEGINNING'}</span></button><span>PAGE {String(chapter.id).padStart(2, '0')} / 06</span><button disabled={!nextChapter} onClick={() => turnChapter(1)}><span>{nextChapter ? `CH. ${nextChapter.roman}` : 'THE TRUTH'}</span><ArrowRight size={14}/></button></nav>
        <div className="reader-footer"><span>THE FORBIDDEN CHAPTER</span><span>{opened.includes(chapter.id) ? 'MARKED AS READ' : 'A SEALED PAGE'}</span></div>
      </motion.article></AnimatePresence>
    </motion.div>}</AnimatePresence>
  </section>;
}
