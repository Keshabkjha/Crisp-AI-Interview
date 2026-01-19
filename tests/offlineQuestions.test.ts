import { describe, expect, it } from 'vitest';
import { generateOfflineQuestions } from '../services/offlineQuestions';
import { QuestionDifficulty } from '../types';
import questionBank from '../data/offlineQuestionBank.json';

const behavioralCategory = questionBank.categories.find(
  (category) => category.category === 'behavioral'
);
const behavioralQuestions = behavioralCategory
  ? [
      ...behavioralCategory.questions.Easy,
      ...behavioralCategory.questions.Medium,
      ...behavioralCategory.questions.Hard,
    ]
  : [];
const behavioralQuestionSet = new Set(behavioralQuestions);

describe('generateOfflineQuestions', () => {
  it('returns the requested number of questions per difficulty', async () => {
    const distribution = { easy: 5, medium: 4, hard: 4 };
    const questions = await generateOfflineQuestions(
      ['react', 'javascript'],
      distribution
    );

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
    questions.forEach((question) => {
      expect(question.category).toBeTruthy();
      expect(question.tags?.length).toBeGreaterThan(0);
    });
  });

  it('falls back to behavioral questions for unknown skills', async () => {
    const distribution = { easy: 1, medium: 1, hard: 1 };
    const questions = await generateOfflineQuestions(['unknown skill'], distribution);

    expect(questions).toHaveLength(3);
    questions.forEach((question) => {
      expect(behavioralQuestionSet.has(question.text)).toBe(true);
    });
  });

  it('uses behavioral questions when no skills are provided', async () => {
    const distribution = { easy: 2, medium: 0, hard: 1 };
    const questions = await generateOfflineQuestions([], distribution);

    expect(questions).toHaveLength(3);
    questions.forEach((question) => {
      expect(behavioralQuestionSet.has(question.text)).toBe(true);
    });
  });

  it('fills requests larger than the available pool', async () => {
    const distribution = { easy: 10, medium: 0, hard: 0 };
    const questions = await generateOfflineQuestions(['react'], distribution);

    const reactCategory = questionBank.categories.find(
      (category) => category.category === 'react'
    );
    const reactEasyPool = reactCategory?.questions.Easy ?? [];
    const behavioralEasyPool = behavioralCategory?.questions.Easy ?? [];
    const pool = new Set([...reactEasyPool, ...behavioralEasyPool]);
    expect(questions).toHaveLength(Math.min(10, pool.size));
  });

  it('avoids duplicate questions when the pool is sufficient', async () => {
    const distribution = { easy: 2, medium: 1, hard: 1 };
    const questions = await generateOfflineQuestions(['react'], distribution);
    const questionTexts = questions.map((question) => question.text);

    expect(new Set(questionTexts).size).toBe(questionTexts.length);
  });
});
