import { beforeEach, describe, expect, it, vi } from 'vitest';
import { countdown, guardStage, normalizeProgress, readProgress, STORAGE_KEY } from '../src/progression';
import { story } from '../src/story';

beforeEach(() => localStorage.clear());

describe('story navigation boundaries', () => {
  it.each([
    [{}, 'cover'],
    [{ entered: true }, 'question'],
    [{ entered: true, accepted: true }, 'dossier'],
    [{ entered: true, accepted: true, quizComplete: true }, 'chapters'],
    [{ entered: true, accepted: true, quizComplete: true, opened: [1, 2, 3, 4, 5] }, 'chapters'],
  ])('does not let a direct final-page URL skip unfinished steps (%j)', (saved, expected) => {
    expect(guardStage('letter', normalizeProgress(saved))).toBe(expected);
    expect(guardStage('truth', normalizeProgress(saved))).toBe(expected);
  });

  it('unlocks the seventh chapter only after six distinct valid chapters', () => {
    const prerequisites = { entered: true, accepted: true, quizComplete: true };
    const incomplete = normalizeProgress({ ...prerequisites, opened: [1, 1, 2, 3, 4, 5, 0, 7, '6'] });
    expect(guardStage('truth', incomplete)).toBe('chapters');
    const complete = normalizeProgress({ ...prerequisites, opened: [6, 1, 2, 3, 4, 5, 6] });
    expect(guardStage('truth', complete)).toBe('truth');
    expect(guardStage('letter', complete)).toBe('letter');
    expect(guardStage('not-a-real-page', complete)).toBe('chapters');
    expect(guardStage('cover', complete)).toBe('cover');
  });

  it('ignores forged later progress when earlier choices were never made', () => {
    const forged = normalizeProgress({ entered: false, accepted: true, quizComplete: true, opened: [1, 2, 3, 4, 5, 6] });
    expect(guardStage('letter', forged)).toBe('cover');
    expect(forged.opened).toHaveLength(0);
  });
});

describe('browser bookmarks survive corrupt or unavailable storage', () => {
  it.each(['{invalid json', 'null', '42', '"completed"', '{"entered":"true","accepted":true,"quizComplete":true,"opened":[1,2,3,4,5,6]}'])('starts safely for invalid stored data: %s', value => {
    localStorage.setItem(STORAGE_KEY, value);
    expect(guardStage('letter', readProgress())).toBe('cover');
  });

  it('preserves legitimate progress while discarding invalid chapter IDs', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ entered: true, accepted: true, quizComplete: true, opened: [2, '3', null, -1, 99, 2, 4, 2.5] }));
    const bookmark = readProgress();
    expect(bookmark.opened).toEqual([2, 4]);
    expect(guardStage('chapters', bookmark)).toBe('chapters');
    expect(guardStage('letter', bookmark)).toBe('chapters');
  });

  it('still offers the opening story when browser storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Storage blocked', 'SecurityError'); });
    expect(guardStage('letter', readProgress())).toBe('cover');
  });
});

describe('birthday countdown in Asia/Kolkata', () => {
  it('keeps waiting one minute before Kolkata midnight, although UTC is still November 23', () => {
    expect(countdown(Date.parse('2026-11-23T18:29:00Z'), story.birthday)).toEqual({ days: 0, hours: 0, minutes: 1, arrived: false });
    expect(countdown(Date.parse('2026-11-23T18:29:59.999Z'), story.birthday).arrived).toBe(false);
  });

  it('arrives exactly at midnight on November 24 in Kolkata', () => {
    expect(countdown(Date.parse('2026-11-23T18:30:00Z'), story.birthday)).toEqual({ days: 0, hours: 0, minutes: 0, arrived: true });
  });

  it('never shows negative numbers after the birthday begins', () => {
    expect(countdown(Date.parse('2026-12-01T12:00:00Z'), story.birthday)).toEqual({ days: 0, hours: 0, minutes: 0, arrived: true });
  });
});
