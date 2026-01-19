import { Question, QuestionDifficulty } from '../types';

export interface OfflineQuestionFilters {
  categories?: string[];
  difficulties?: QuestionDifficulty[];
  tags?: string[];
}

type OfflineQuestion = {
  text: string;
  difficulty: QuestionDifficulty;
  category: string;
  tags: string[];
};

type OfflineQuestionBank = {
  categories: {
    category: string;
    tags: string[];
    questions: Record<QuestionDifficulty, string[]>;
  }[];
};

const offlineQuestionDifficulties: QuestionDifficulty[] = [
  'Easy',
  'Medium',
  'Hard',
];

let cachedOfflineQuestions: OfflineQuestion[] | null = null;
let offlineQuestionPromise: Promise<OfflineQuestion[]> | null = null;

function normalizeList(values?: string[]): string[] | undefined {
  if (!values || values.length === 0) return undefined;
  const normalized = values
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return normalized.length > 0 ? Array.from(new Set(normalized)) : undefined;
}

function questionKey(question: OfflineQuestion): string {
  return `${question.category}::${question.difficulty}::${question.text}`;
}

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function loadOfflineQuestions(): Promise<OfflineQuestion[]> {
  if (cachedOfflineQuestions) return cachedOfflineQuestions;
  if (!offlineQuestionPromise) {
    offlineQuestionPromise = import('../data/offlineQuestionBank.json')
      .then((module) => {
        const bank = module.default as OfflineQuestionBank;
        const flattened = bank.categories.flatMap((category) => {
          const normalizedCategory = category.category.trim().toLowerCase();
          const normalizedTags = category.tags.map((tag) => tag.toLowerCase());
          return offlineQuestionDifficulties.flatMap((difficulty) => {
            const questions = category.questions[difficulty] ?? [];
            return questions.map((text) => ({
              text,
              difficulty,
              category: normalizedCategory,
              tags: normalizedTags,
            }));
          });
        });
        cachedOfflineQuestions = flattened;
        return flattened;
      })
      .finally(() => {
        offlineQuestionPromise = null;
      });
  }
  return offlineQuestionPromise;
}

function matchesFilters(
  question: OfflineQuestion,
  filters: {
    categories?: string[];
    difficulties?: QuestionDifficulty[];
    tags?: string[];
  }
): boolean {
  if (filters.categories && !filters.categories.includes(question.category)) {
    return false;
  }
  if (filters.difficulties && !filters.difficulties.includes(question.difficulty)) {
    return false;
  }
  if (filters.tags && !question.tags.some((tag) => filters.tags?.includes(tag))) {
    return false;
  }
  return true;
}

function selectQuestions(
  pool: OfflineQuestion[],
  count: number,
  selectedKeys: Set<string>
): OfflineQuestion[] {
  if (count <= 0) return [];
  const available = pool.filter((question) => !selectedKeys.has(questionKey(question)));
  const shuffled = shuffleArray([...available]);
  const picked: OfflineQuestion[] = [];

  for (const question of shuffled) {
    if (picked.length >= count) break;
    const key = questionKey(question);
    if (selectedKeys.has(key)) continue;
    selectedKeys.add(key);
    picked.push(question);
  }

  return picked;
}

export async function generateOfflineQuestions(
  skills: string[],
  difficultyDistribution: { easy: number; medium: number; hard: number },
  filters: OfflineQuestionFilters = {}
): Promise<Question[]> {
  const selectedQuestions: OfflineQuestion[] = [];
  const selectedKeys = new Set<string>();
  const normalizedSkills = normalizeList(skills) ?? [];
  const normalizedFilters = {
    categories: normalizeList(filters.categories) ?? normalizedSkills,
    tags: normalizeList(filters.tags),
    difficulties: filters.difficulties,
  };

  const allQuestions = await loadOfflineQuestions();
  const behavioralQuestions = allQuestions.filter((question) => {
    if (question.category !== 'behavioral') return false;
    if (
      normalizedFilters.difficulties &&
      !normalizedFilters.difficulties.includes(question.difficulty)
    ) {
      return false;
    }
    return true;
  });
  const filteredQuestions = allQuestions.filter((question) =>
    question.category === 'behavioral'
      ? false
      : matchesFilters(question, normalizedFilters)
  );

  (['Easy', 'Medium', 'Hard'] as QuestionDifficulty[]).forEach((difficulty) => {
    const count =
      difficultyDistribution[difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'];
    const candidates = filteredQuestions.filter(
      (question) => question.difficulty === difficulty
    );
    const picked = selectQuestions(candidates, count, selectedKeys);
    selectedQuestions.push(...picked);

    const remaining = count - picked.length;
    if (remaining > 0) {
      const fallbackCandidates = behavioralQuestions.filter(
        (question) => question.difficulty === difficulty
      );
      const fallbackPicked = selectQuestions(
        fallbackCandidates,
        remaining,
        selectedKeys
      );
      selectedQuestions.push(...fallbackPicked);

    }
  });

  return selectedQuestions.map((question, index) => ({
    id: `offline-${question.category}-${question.difficulty}-${hashString(
      `${questionKey(question)}-${index}`
    )}`,
    text: question.text,
    difficulty: question.difficulty,
    isFollowUp: false,
    category: question.category,
    tags: question.tags,
  }));
}
