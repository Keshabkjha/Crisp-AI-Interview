
import { Question, QuestionDifficulty } from '../types';

type Skill =
  | 'react'
  | 'node.js'
  | 'javascript'
  | 'typescript'
  | 'system design'
  | 'sql'
  | 'java'
  | 'python'
  | 'c++'
  | 'c'
  | 'machine learning'
  | 'data analysis'
  | 'artificial intelligence'
  | 'excel'
  | 'power bi'
  | 'tableau';

const questionBank: Record<
  Skill,
  Record<QuestionDifficulty, string[]>
> = {
  react: {
    Easy: [
      'What is JSX?',
      'What is the difference between a class component and a functional component?',
      'What are props in React?',
      'Why are keys important when rendering lists in React?',
    ],
    Medium: [
      'Explain the concept of the virtual DOM.',
      'What are React Hooks? Name a few and explain their purpose.',
      'How does state management work in React? Compare `useState` with `useReducer`.',
      'What is the purpose of the dependency array in `useEffect`?',
    ],
    Hard: [
      'Describe the reconciliation algorithm in React.',
      'How would you optimize the performance of a React application?',
      'Explain Higher-Order Components (HOCs) and Render Props, and when you would use each.',
      'What is concurrent rendering in React and when would you use it?',
    ],
  },
  'node.js': {
    Easy: [
      'What is Node.js?',
      'What is NPM?',
      'Explain the concept of non-blocking I/O in Node.js.',
      'What is the role of `package.json` in a Node.js project?',
    ],
    Medium: [
      'What is the event loop in Node.js?',
      'Differentiate between `require` and `import/export`.',
      'What are streams in Node.js and why are they useful?',
      'How do you handle errors in asynchronous Node.js code?',
    ],
    Hard: [
      'How does Node.js handle child processes?',
      'Explain middleware in the context of Express.js.',
      'What are some common security threats for a Node.js application and how would you mitigate them?',
      'What is Node.js clustering and when would you use it?',
    ],
  },
  javascript: {
    Easy: [
      'What is the difference between `==` and `===`?',
      'Explain the difference between `let`, `const`, and `var`.',
      'What is a callback function?',
      'What is hoisting in JavaScript?',
    ],
    Medium: [
      'What are closures in JavaScript?',
      'Explain event delegation.',
      'Describe `this` keyword and how its value is determined.',
      'Explain the event loop and the difference between microtasks and macrotasks.',
    ],
    Hard: [
      'What are Promises and how do they work? Explain `async/await`.',
      'Explain the prototype chain in JavaScript.',
      'What is memoization and how can it be implemented in JavaScript?',
      'What are generators and iterators in JavaScript?',
    ],
  },
  typescript: {
    Easy: [
      'What is TypeScript and how does it relate to JavaScript?',
      'What are some basic types in TypeScript?',
      'What is an interface in TypeScript?',
      'What is type inference in TypeScript?',
    ],
    Medium: [
      'Explain the difference between an interface and a type alias.',
      'What are generics in TypeScript and why are they useful?',
      'What does the `never` type represent?',
      'How do utility types like `Partial` and `Pick` help with typing?',
    ],
    Hard: [
      'Explain conditional types in TypeScript.',
      'What are mapped types?',
      'Describe how decorators work in TypeScript.',
      'What is declaration merging in TypeScript?',
    ],
  },
  'system design': {
    Easy: [
      'What is the difference between horizontal and vertical scaling?',
      'What is a load balancer?',
      'Explain the concept of caching.',
    ],
    Medium: [
      'How would you design a URL shortening service like TinyURL?',
      'Describe the trade-offs between SQL and NoSQL databases.',
      'What is a Content Delivery Network (CDN) and why is it used?',
    ],
    Hard: [
      'Design a system like Twitter, focusing on the news feed and scaling.',
      'Explain database sharding and its strategies.',
      'What is consistent hashing and where is it used?',
    ],
  },
   sql: {
    Easy: [
      "What is the difference between `DELETE`, `TRUNCATE`, and `DROP` commands?",
      "What is a primary key?",
      "What is the purpose of the `GROUP BY` clause?",
    ],
    Medium: [
      "Explain different types of SQL joins (INNER, LEFT, RIGHT, FULL).",
      "What are indexes and why are they important for database performance?",
      "What is a subquery and when would you use one?",
    ],
    Hard: [
      "What is database normalization? Explain 1NF, 2NF, and 3NF.",
      "Explain what a transaction is and the properties of ACID.",
      "How would you optimize a slow-running SQL query?",
    ],
  },
  java: {
    Easy: [
      "What is the difference between JDK, JRE, and JVM?",
      "Explain the concept of Object-Oriented Programming (OOP).",
      "What is the difference between `String`, `StringBuilder`, and `StringBuffer`?",
    ],
    Medium: [
      "Explain the `final` keyword in Java.",
      "What are the differences between an `interface` and an `abstract class`?",
      "How does exception handling work in Java?",
    ],
    Hard: [
      "Explain how the Garbage Collector works in Java.",
      "Describe the Java Memory Model.",
      "What is the difference between concurrency and parallelism? How does Java handle them?",
    ],
  },
  python: {
    Easy: [
      "What is the difference between a list and a tuple in Python?",
      "What are decorators in Python?",
      "What is the Global Interpreter Lock (GIL) in Python?",
    ],
    Medium: [
      "Explain list comprehensions and their benefits.",
      "What is the difference between a generator and a normal function?",
      "Describe how `*args` and `**kwargs` work.",
    ],
    Hard: [
      "How does memory management work in Python?",
      "What are metaclasses in Python?",
      "Explain how `asyncio` works in Python for asynchronous programming.",
    ],
  },
  'c++': {
    Easy: [
      "What is the difference between a pointer and a reference?",
      "What are the main principles of OOP in C++?",
      "What is a constructor and a destructor?",
    ],
    Medium: [
      "Explain virtual functions and polymorphism.",
      "What is the difference between `stack` and `heap` memory?",
      "Describe smart pointers (`unique_ptr`, `shared_ptr`, `weak_ptr`).",
    ],
    Hard: [
      "What is RAII (Resource Acquisition Is Initialization)?",
      "Explain move semantics and rvalue references.",
      "What is template metaprogramming?",
    ],
  },
  c: {
    Easy: [
      "What is the difference between `malloc` and `calloc`?",
      "What are static variables and functions in C?",
      "Explain the purpose of the `volatile` keyword.",
    ],
    Medium: [
      "What are function pointers and how are they used?",
      "Describe the difference between a `struct` and a `union`.",
      "How does the C preprocessor work?",
    ],
    Hard: [
      "Explain memory layout of a C program (stack, heap, data, bss, text).",
      "What is a dangling pointer and how can you avoid it?",
      "Describe how `setjmp` and `longjmp` work.",
    ],
  },
  'machine learning': {
    Easy: [
      "What is the difference between supervised and unsupervised learning?",
      "Explain overfitting and how to prevent it.",
      "What is a confusion matrix?",
    ],
    Medium: [
      "Describe the bias-variance tradeoff.",
      "Explain how a decision tree works.",
      "What is the difference between classification and regression?",
    ],
    Hard: [
      "Explain how Gradient Boosting works.",
      "Describe the architecture of a Convolutional Neural Network (CNN).",
      "What is regularization and why is it useful? Explain L1 and L2 regularization.",
    ],
  },
  'data analysis': {
    Easy: [
      "What is the difference between qualitative and quantitative data?",
      "What are mean, median, and mode?",
      "What is data cleaning?",
    ],
    Medium: [
      "Explain what A/B testing is and how it's used.",
      "What is a p-value?",
      "Describe the process of data analysis from start to finish.",
    ],
    Hard: [
      "What is survivorship bias? Give an example.",
      "Explain the difference between correlation and causation.",
      "How would you handle missing data in a dataset?",
    ],
  },
  'artificial intelligence': {
    Easy: [
      "What is the difference between narrow AI, general AI, and super AI?",
      "What is a neural network?",
      "What is Natural Language Processing (NLP)?",
    ],
    Medium: [
      "Explain the Turing Test.",
      "What is reinforcement learning?",
      "Describe the difference between a model's parameters and hyperparameters.",
    ],
    Hard: [
      "What are generative models, like GANs or Transformers?",
      "Explain the concept of 'explainable AI' (XAI).",
      "What are some of the ethical concerns in AI development?",
    ],
  },
  excel: {
    Easy: [
      "What is the difference between a formula and a function in Excel?",
      "How do you create a chart in Excel?",
      "What is the purpose of the VLOOKUP function?",
    ],
    Medium: [
      "What is a PivotTable and why is it useful?",
      "Explain the difference between relative, absolute, and mixed cell references.",
      "How can you use conditional formatting to highlight data?",
    ],
    Hard: [
      "Describe how to use the INDEX and MATCH functions together, and why it's often better than VLOOKUP.",
      "What is the Power Query editor and what can you do with it?",
      "How would you create a dynamic named range?",
    ],
  },
  'power bi': {
    Easy: [
      "What are the main components of Power BI (Desktop, Service, Mobile)?",
      "What is the difference between a measure and a calculated column in DAX?",
      "How do you create a relationship between two tables in Power BI?",
    ],
    Medium: [
      "What is the Power Query Editor in Power BI and what is it used for?",
      "Explain the concept of row-level security.",
      "What is the difference between `SUM` and `SUMX` in DAX?",
    ],
    Hard: [
      "Describe the concept of filter context and row context in DAX.",
      "What is a star schema and why is it important in Power BI data modeling?",
      "How would you optimize the performance of a slow Power BI report?",
    ],
  },
  tableau: {
    Easy: [
      "What is the difference between a dimension and a measure in Tableau?",
      "What is a dashboard in Tableau?",
      "Explain the difference between a live connection and an extract.",
    ],
    Medium: [
      "What are sets in Tableau and how can they be used?",
      "Explain the difference between discrete and continuous fields.",
      "What is a Level of Detail (LOD) expression? Give an example.",
    ],
    Hard: [
      "Describe how context filters work in Tableau and their order of operations.",
      "What is data blending and when would you use it instead of joining?",
      "How would you improve the performance of a slow Tableau dashboard?",
    ],
  },
};

const generalBehavioralQuestions: Record<QuestionDifficulty, string[]> = {
  Easy: [
    'Can you tell me a little about yourself?',
    'What are your biggest strengths?',
    'What are your biggest weaknesses?',
    'Why are you interested in this role?',
  ],
  Medium: [
    'Tell me about a time you had to work with a difficult coworker.',
    'Describe a situation where you had to learn a new technology quickly.',
    'How do you handle pressure or stressful situations?',
    'Describe a time you had to balance multiple priorities.',
  ],
  Hard: [
    'Tell me about a time you failed. What did you learn from the experience?',
    'Describe a time when you had to take initiative and lead a project without formal authority.',
    'How would you handle a situation where you made a mistake that impacted your team?',
    'Tell me about a time you had to make a difficult decision with limited information.',
  ],
};

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateOfflineQuestions(
  skills: string[],
  difficultyDistribution: { easy: number; medium: number; hard: number }
): Question[] {
  const selectedQuestions: Question[] = [];
  const lowercasedSkills = skills.map((s) => s.toLowerCase() as Skill);

  const availableSkills = lowercasedSkills.filter((s) => questionBank[s]);

  // If there are relevant skills, pull from them
  if (availableSkills.length > 0) {
    (['Easy', 'Medium', 'Hard'] as QuestionDifficulty[]).forEach(
      (difficulty) => {
        const count = difficultyDistribution[difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'];
        const candidates: string[] = [];
        availableSkills.forEach((skill) => {
          candidates.push(...(questionBank[skill]?.[difficulty] || []));
        });
        const shuffled = shuffleArray(candidates);
        for (let i = 0; i < count && i < shuffled.length; i++) {
          selectedQuestions.push({
            id: `offline-${difficulty}-${i}`,
            text: shuffled[i],
            difficulty: difficulty,
            isFollowUp: false,
          });
        }
      }
    );
  }

  // Fill any remaining slots with general behavioral questions
  const totalRequired =
    difficultyDistribution.easy +
    difficultyDistribution.medium +
    difficultyDistribution.hard;
  
  if (selectedQuestions.length < totalRequired) {
    (['Easy', 'Medium', 'Hard'] as QuestionDifficulty[]).forEach(
      (difficulty) => {
        const requiredCount = difficultyDistribution[difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'];
        const existingCount = selectedQuestions.filter(
          (q) => q.difficulty === difficulty
        ).length;
        const needed = requiredCount - existingCount;

        if (needed > 0) {
          const candidates = shuffleArray([
            ...generalBehavioralQuestions[difficulty],
          ]);
          if (candidates.length === 0) return;
          for (let i = 0; i < needed; i++) {
            selectedQuestions.push({
              id: `offline-general-${difficulty}-${existingCount + i}`,
              text: candidates[i % candidates.length],
              difficulty: difficulty,
              isFollowUp: false,
            });
          }
        }
      }
    );
  }
  
  return selectedQuestions;
}
