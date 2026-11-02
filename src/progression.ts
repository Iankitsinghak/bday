export type Stage = 'cover' | 'question' | 'dossier' | 'chapters' | 'truth' | 'letter';
export type Progress = { entered: boolean; accepted: boolean; quizComplete: boolean; opened: number[] };
export const STORAGE_KEY = 'her-forbidden-chapter-v1';
export const EMPTY_PROGRESS: Progress = { entered: false, accepted: false, quizComplete: false, opened: [] };
export function normalizeProgress(value: unknown): Progress {
  if (!value || typeof value !== 'object') return { ...EMPTY_PROGRESS, opened: [] };
  const p = value as Partial<Progress>;
  const entered = p.entered === true;
  const accepted = entered && p.accepted === true;
  const quizComplete = accepted && p.quizComplete === true;
  return { entered, accepted, quizComplete, opened: quizComplete && Array.isArray(p.opened) ? [...new Set(p.opened.filter(n => Number.isInteger(n) && n >= 1 && n <= 6))] : [] };
}
export function guardStage(request: string, progress: Progress): Stage {
  if (request === 'cover') return 'cover';
  if (!progress.entered) return 'cover';
  if (request === 'question') return 'question';
  if (!progress.accepted) return 'question';
  if (request === 'dossier') return 'dossier';
  if (!progress.quizComplete) return 'dossier';
  if (request === 'chapters') return 'chapters';
  if (progress.opened.length < 6) return 'chapters';
  return request === 'truth' || request === 'letter' ? request : 'chapters';
}
export function readProgress(): Progress {
  try { return normalizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')); }
  catch { return { ...EMPTY_PROGRESS, opened: [] }; }
}
export function countdown(now: number, target: string) {
  const remaining = Math.max(0, Date.parse(target) - now);
  return { days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60, arrived: remaining === 0 };
}
