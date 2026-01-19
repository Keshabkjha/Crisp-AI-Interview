import { describe, expect, it } from 'vitest';
import { generateOfflineQuestions } from '../services/offlineQuestions';
import { QuestionDifficulty } from '../types';

describe('generateOfflineQuestions', () => {
  it('returns the requested number of questions per difficulty', () => {
    const distribution = { easy: 5, medium: 4, hard: 4 };
    const questions = generateOfflineQuestions([], distribution);

    const counts = questions.reduce<Record<QuestionDifficulty, number>>(
      (acc, question) => {
        acc[question.difficulty] += 1;
        return acc;
      },
      { Easy: 0, Medium: 0, Hard: 0 }
    );

    expect(questions).toHaveLength(13);
    expect(counts.Easy).toBe(5);
    expect(counts.Medium).toBe(4);
    expect(counts.Hard).toBe(4);
  });
});
