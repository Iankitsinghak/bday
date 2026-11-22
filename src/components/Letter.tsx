import { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { letter } from '../story';
import './letter.css';

/** The final page of the story. All editable copy lives in story.ts. */
export default function Letter() {
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const salutationRef = useRef<HTMLHeadingElement>(null);
  const duration = reduceMotion ? 0 : 0.75;
  const revealAt = (position: number) => reduceMotion ? 0 : 0.45 + position * 0.18;
  const reveal = (position: number) => ({
    initial: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 7 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.7, delay: revealAt(position) },
  });

  return (
    <section className={`letter-desk ${isOpen ? 'letter-desk--open' : ''}`} aria-label="The last page: a letter for Shalu">
      <div className="letter-desk__light" aria-hidden="true" />
      <div className="letter-desk__fabric" aria-hidden="true" />
      <div className="letter-desk__content">
        <motion.div className="letter-prelude" animate={{ opacity: 1 }} initial={{ opacity: reduceMotion ? 1 : 0 }} transition={{ duration }}>
          <p className="letter-eyebrow">THE LAST PAGE</p>
          <h1>No character. No clever line.<br /><em>Just me, writing to you.</em></h1>
          <span className="letter-ornament" aria-hidden="true">✧</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              className="sealed-letter"
              key="sealed-letter"
              initial={{ opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -14, rotateX: reduceMotion ? 0 : 12 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.3 }}
            >
              <div className="envelope-shadow">
                <div className="letter-envelope" aria-hidden="true">
                  <div className="letter-envelope__lining" />
                  <div className="letter-envelope__left" />
                  <div className="letter-envelope__right" />
                  <div className="letter-envelope__bottom" />
                  <div className="letter-envelope__flap" />
                  <span className="letter-envelope__address">For Shalu,</span>
                  <span className="letter-envelope__note">a little less mystery. a little more truth.</span>
                </div>
                <motion.button
                  type="button"
                  className="wax-button"
                  onClick={() => setIsOpen(true)}
                  aria-label="Break the seal and read your letter"
                  whileHover={reduceMotion ? undefined : { scale: 1.045 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.3, rotate: reduceMotion ? 0 : -13 }}
                  transition={{ duration: reduceMotion ? 0 : 0.38 }}
                >
                  <span className="wax-seal" aria-hidden="true"><span>m</span></span>
                  <span className="wax-button__label">BREAK THE SEAL</span>
                </motion.button>
              </div>
              <p className="sealed-letter__caption">Some things deserve to be said on paper.</p>
            </motion.div>
          ) : (
            <motion.div
              className="letter-reveal"
              key="opened-letter"
              initial={{ opacity: reduceMotion ? 1 : 0, rotateX: reduceMotion ? 0 : -24, y: reduceMotion ? 0 : 18 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => salutationRef.current?.focus({ preventScroll: true })}
            >
              <div className="parchment-shadow">
                <article className="parchment" aria-labelledby="letter-salutation">
                  <svg className="parchment__rose" viewBox="0 0 120 150" aria-hidden="true">
                    <path d="M62 73 C48 91 73 108 57 139 M59 111 C42 100 36 105 31 109 C43 111 48 117 59 121 M59 125 C76 113 85 117 91 122 C78 123 70 129 59 134" />
                    <path d="M60 79 C39 79 36 61 49 52 C44 37 58 29 69 38 C82 30 95 44 87 56 C99 68 86 83 72 79 C69 89 58 89 55 81 Z" />
                    <path d="M60 75 C48 70 49 59 58 56 C53 49 61 43 67 48 C74 42 81 50 76 57 C84 63 78 73 70 70 C68 77 62 79 60 75 Z" />
                    <path className="parchment__rose-petal" d="M23 137 C16 130 21 122 28 124 C33 127 30 134 23 137 Z" />
                  </svg>
                  <div className="parchment__grain" aria-hidden="true" />
                  <div className="parchment__creases" aria-hidden="true" />
                  <div className="parchment__ink">
                    <motion.div className="parchment__meta" {...reveal(0)}>
                      <span>A PRIVATE EDITION · ONE READER ONLY</span>
                      <span>24 XI 2026</span>
                    </motion.div>
                    <motion.h2 id="letter-salutation" ref={salutationRef} tabIndex={-1} {...reveal(1)}>
                      {letter.salutation}
                    </motion.h2>
                    <div className="letter-prose">
                      {letter.paragraphs.map((paragraph, index) => (
                        <motion.p key={index} {...reveal(index + 2)}>{paragraph}</motion.p>
                      ))}
                    </div>
                    <motion.div className="letter-signoff" {...reveal(letter.paragraphs.length + 2)}>
                      <p>{letter.closing}</p>
                      <p className="letter-signature">{letter.signature}</p>
                    </motion.div>
                    <motion.div className="letter-last-line" {...reveal(letter.paragraphs.length + 3)}>
                      <span aria-hidden="true">✦</span>
                      <p>{letter.finalLine}</p>
                    </motion.div>
                    <span className="parchment__page-number" aria-hidden="true">the end. and everything after.</span>
                  </div>
                </article>
              </div>
              <motion.footer className="letter-finale" {...reveal(letter.paragraphs.length + 6)}>
                <div className="letter-petals" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((petal) => (
                    <motion.span
                      key={petal}
                      className={`letter-petal letter-petal--${petal + 1}`}
                      initial={{ opacity: 0, y: -60, rotate: petal * 42 }}
                      animate={reduceMotion ? { opacity: 0 } : { opacity: [0, 0.5, 0.3, 0], y: [-60, 110], x: [0, petal % 2 ? 30 : -24], rotate: [petal * 42, petal * 42 + 140] }}
                      transition={{ duration: 7, delay: revealAt(letter.paragraphs.length + 6) + petal * 0.55, ease: 'easeOut' }}
                    />
                  ))}
                </div>
                <p className="letter-eyebrow">HAPPY BIRTHDAY, SHALU.</p>
                <h2>You’re my favourite<br /><em>plot twist.</em></h2>
                <span className="letter-finale__end" aria-hidden="true">S <span>✧</span> M</span>
              </motion.footer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
