import { describe, expect, it } from 'vitest';
import { generateOfflineQuestions } from '../services/offlineQuestions';
import { QuestionDifficulty } from '../types';
import questionBank from '../data/offlineQuestionBank.json';

let cachedBehavioralData:
  | {
      category: (typeof questionBank.categories)[number] | undefined;
      questions: string[];
      set: Set<string>;
    }
  | undefined;

const getBehavioralData = () => {
  if (!cachedBehavioralData) {
    const category = questionBank.categories.find(
      (entry) => entry.category === 'behavioral'
    );
    const questions = category
      ? [
          ...category.questions.Easy,
          ...category.questions.Medium,
          ...category.questions.Hard,
        ]
      : [];
    cachedBehavioralData = {
      category,
      questions,
      set: new Set(questions),
    };
  }
  return cachedBehavioralData;
};

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
    const { set: behavioralQuestionSet } = getBehavioralData();

    expect(questions).toHaveLength(3);
    questions.forEach((question) => {
      expect(behavioralQuestionSet.has(question.text)).toBe(true);
    });
  });

  it('uses behavioral questions when no skills are provided', async () => {
    const distribution = { easy: 2, medium: 0, hard: 1 };
    const questions = await generateOfflineQuestions([], distribution);
    const { set: behavioralQuestionSet } = getBehavioralData();

    expect(questions).toHaveLength(3);
    questions.forEach((question) => {
      expect(behavioralQuestionSet.has(question.text)).toBe(true);
    });
  });

  it('fills requests larger than the available pool', async () => {
    const distribution = { easy: 10, medium: 0, hard: 0 };
    const questions = await generateOfflineQuestions(['react'], distribution);
    const { category: behavioralCategory } = getBehavioralData();

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
