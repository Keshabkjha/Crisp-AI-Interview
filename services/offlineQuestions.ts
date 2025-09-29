import { CandidateProfile, InterviewSettings, QuestionDifficulty } from '../types';

// More comprehensive question bank
const offlineQuestionBank: Record<string, Partial<Record<QuestionDifficulty, string[]>>> = {
    // Technical Skills
    'javascript': {
        [QuestionDifficulty.Easy]: [
            "What is the difference between `let`, `const`, and `var` in JavaScript?",
            "Explain the difference between `==` and `===` in JavaScript.",
            "What are arrow functions?"
        ],
        [QuestionDifficulty.Medium]: [
            "Describe the event loop in JavaScript.",
            "What are closures in JavaScript and provide a practical use case.",
            "Explain the concept of 'hoisting' in JavaScript."
        ],
        [QuestionDifficulty.Hard]: [
            "Explain prototypal inheritance in JavaScript.",
            "What is a Promise? Explain how `.then()`, `.catch()`, and `.finally()` work.",
            "Describe how `async/await` simplifies asynchronous code."
        ]
    },
    'react': {
        [QuestionDifficulty.Easy]: [
            "Explain the concept of 'state' in React.",
            "What is the purpose of a `key` prop in React lists?",
            "What is JSX?"
        ],
        [QuestionDifficulty.Medium]: [
            "What are React Hooks? Give an example of `useEffect` and explain its dependency array.",
            "Explain the difference between a controlled and uncontrolled component.",
            "What is the React Context API and when would you use it?"
        ],
        [QuestionDifficulty.Hard]: [
            "Describe how you would implement server-side rendering (SSR) for a React application and its benefits.",
            "Discuss different strategies for state management in a large-scale React application (e.g., Redux, Context API, Zustand).",
            "Explain the reconciliation process in React (the 'diffing' algorithm)."
        ]
    },
    'node.js': {
        [QuestionDifficulty.Easy]: [
            "What is Node.js and what is it used for?",
            "What is npm?",
            "How do you import modules in Node.js?"
        ],
        [QuestionDifficulty.Medium]: [
            "What is the difference between `require` and `import` in Node.js?",
            "Explain the concept of middleware in Express.js.",
            "How does Node.js handle asynchronous operations?"
        ],
        [QuestionDifficulty.Hard]: [
            "What are some common security vulnerabilities in a Node.js application and how would you mitigate them?",
            "Explain what streams are in Node.js and why they are useful.",
            "Describe the difference between clustering and forking in Node.js for performance scaling."
        ]
    },
    'css': {
        [QuestionDifficulty.Easy]: [
            "What does the `box-sizing: border-box;` CSS property do?",
            "How do you center a `div` element horizontally and vertically?",
            "What is the difference between `margin` and `padding`?"
        ],
        [QuestionDifficulty.Medium]: [
            "Explain what CSS specificity is and how it works.",
            "What are pseudo-classes and pseudo-elements? Give an example of each.",
            "Describe Flexbox and some of its key properties."
        ],
        [QuestionDifficulty.Hard]: [
            "Explain the concept of the CSS Grid layout.",
            "What are some techniques for writing scalable and maintainable CSS?",
            "How would you approach creating a responsive design without using a framework like Bootstrap?"
        ]
    },
    'sql': {
        [QuestionDifficulty.Easy]: [
            "What is the difference between a primary key and a foreign key?",
            "What is the purpose of the `GROUP BY` clause in a SQL query?",
            "Explain the difference between `DELETE`, `TRUNCATE`, and `DROP` commands."
        ],
        [QuestionDifficulty.Medium]: [
            "What are the different types of JOINs in SQL (e.g., INNER, LEFT, RIGHT, FULL)?",
            "What is an index in a database? Why are they important for performance?",
            "Explain what a subquery is and provide an example."
        ],
        [QuestionDifficulty.Hard]: [
            "What are transactions and what are the ACID properties?",
            "Explain different transaction isolation levels and the problems they prevent (e.g., dirty reads).",
            "What is a stored procedure and what are its advantages?"
        ]
    },
    'java': {
        [QuestionDifficulty.Easy]: [
            "What is the difference between JDK, JRE, and JVM?",
            "Explain the main concepts of Object-Oriented Programming (OOP).",
            "What is the difference between an abstract class and an interface?"
        ],
        [QuestionDifficulty.Medium]: [
            "Explain the difference between `==` and the `.equals()` method when comparing objects.",
            "What is the purpose of the `static` keyword in Java?",
            "Describe exception handling in Java using `try`, `catch`, `finally`."
        ],
        [QuestionDifficulty.Hard]: [
            "Describe the Java Memory Model, specifically the heap and stack.",
            "What is dependency injection and how does it improve code quality?",
            "Explain multithreading in Java. What is the difference between `extends Thread` and `implements Runnable`?"
        ]
    },
    'python': {
        [QuestionDifficulty.Easy]: [
            "What is the difference between a list and a tuple in Python?",
            "What are dictionaries in Python and how do they work?",
            "How do you handle exceptions in Python?"
        ],
        [QuestionDifficulty.Medium]: [
            "Explain what a decorator is in Python with a simple example.",
            "What is the Global Interpreter Lock (GIL) and how does it affect multi-threaded Python programs?",
            "What is the difference between a list comprehension and a generator expression?"
        ],
        [QuestionDifficulty.Hard]: [
            "Describe how memory management works in Python.",
            "Explain the MRO (Method Resolution Order) in Python's inheritance.",
            "What are metaclasses in Python and what are they used for?"
        ]
    },
    'c++': {
        [QuestionDifficulty.Easy]: [
            "What is the difference between a class and a struct in C++?",
            "What is a pointer? How is it different from a reference?",
            "What is the purpose of the `new` and `delete` operators?"
        ],
        [QuestionDifficulty.Medium]: [
            "Explain the concept of RAII (Resource Acquisition Is Initialization).",
            "What is the difference between stack and heap memory allocation?",
            "What are virtual functions and how do they enable polymorphism?"
        ],
        [QuestionDifficulty.Hard]: [
            "Describe move semantics and std::move. What problem do they solve?",
            "What is template metaprogramming in C++?",
            "Explain the Rule of Five (or Three/Zero) and why it's important for resource management."
        ]
    },
    'c': {
        [QuestionDifficulty.Easy]: [
            "What are `malloc` and `free` used for in C?",
            "What is the difference between `*ptr` and `&ptr` for a pointer variable `ptr`?",
            "Explain the `struct` keyword and its usage."
        ],
        [QuestionDifficulty.Medium]: [
            "What is the difference between a pointer to an array and an array of pointers?",
            "What are function pointers and what is a practical use case for them?",
            "Explain the purpose of the `volatile` keyword."
        ],
        [QuestionDifficulty.Hard]: [
            "Describe the compilation process of a C program (preprocessing, compilation, assembly, linking).",
            "What is a memory leak? How can you detect and prevent it in C?",
            "Explain what undefined behavior is and give an example."
        ]
    },
    'machine learning': {
        [QuestionDifficulty.Easy]: [
            "What is the difference between supervised and unsupervised learning?",
            "What is overfitting, and how can you prevent it?",
            "Explain what a training set and a testing set are."
        ],
        [QuestionDifficulty.Medium]: [
            "Describe the bias-variance tradeoff.",
            "Explain how a decision tree works for classification.",
            "What is feature engineering and why is it important?"
        ],
        [QuestionDifficulty.Hard]: [
            "Explain the mathematical concept behind gradient descent.",
            "What are Support Vector Machines (SVMs) and how do they work?",
            "Describe the difference between a generative and a discriminative model."
        ]
    },
    'data analysis': {
        [QuestionDifficulty.Easy]: [
            "What is the difference between quantitative and qualitative data?",
            "Define mean, median, and mode.",
            "What is data visualization and why is it important?"
        ],
        [QuestionDifficulty.Medium]: [
            "What is data cleaning and why is it a crucial step in data analysis?",
            "Explain what a p-value represents in the context of hypothesis testing.",
            "What is a correlation, and how is it different from causation?"
        ],
        [QuestionDifficulty.Hard]: [
            "Describe the process and principles of A/B testing.",
            "What are some common statistical biases you might encounter in a dataset?",
            "Explain the ETL (Extract, Transform, Load) process."
        ]
    },
    'artificial intelligence': {
        [QuestionDifficulty.Easy]: [
            "How would you explain the difference between AI, Machine Learning, and Deep Learning?",
            "What is a neural network at a high level?",
            "What is Natural Language Processing (NLP)?"
        ],
        [QuestionDifficulty.Medium]: [
            "Explain what a search algorithm like A* (A-star) does.",
            "What is reinforcement learning?",
            "What is a confusion matrix and what does it tell you?"
        ],
        [QuestionDifficulty.Hard]: [
            "Describe the architecture of a Transformer model and why it's effective for NLP tasks.",
            "What are generative adversarial networks (GANs)?",
            "Discuss the ethical considerations that are important in developing AI systems."
        ]
    },
    'excel': {
        [QuestionDifficulty.Easy]: [
            "What is a PivotTable and what is its primary purpose?",
            "Explain the difference between using the SUM function and the + operator.",
            "How do you use the VLOOKUP function?"
        ],
        [QuestionDifficulty.Medium]: [
            "What is conditional formatting and can you give a practical example?",
            "Explain the difference between an absolute and a relative cell reference.",
            "What are some ways to clean and prepare data in Excel before analysis?"
        ],
        [QuestionDifficulty.Hard]: [
            "Describe how you would use Power Query to import and transform data from multiple sources.",
            "Explain how to create a macro to automate a repetitive task.",
            "What is the 'Goal Seek' feature and in what scenario would it be useful?"
        ]
    },
    'powerbi': {
        [QuestionDifficulty.Easy]: [
            "What are the main building blocks of a Power BI report (e.g., visuals, datasets, reports, dashboards)?",
            "What is DAX (Data Analysis Expressions)?",
            "What is the difference between a report and a dashboard in Power BI?"
        ],
        [QuestionDifficulty.Medium]: [
            "Explain the difference between a measure and a calculated column.",
            "What is data modeling in Power BI and why is it important?",
            "Describe the purpose of the Power Query Editor."
        ],
        [QuestionDifficulty.Hard]: [
            "What is row-level security (RLS) and how would you implement it?",
            "Explain the concept of query folding in Power Query and its benefits.",
            "What is the CALCULATE function in DAX and why is it so powerful?"
        ]
    },
    'tableau': {
        [QuestionDifficulty.Easy]: [
            "What is the difference between a dimension and a measure in Tableau?",
            "What is a dashboard?",
            "Explain the difference between a worksheet, a dashboard, and a story."
        ],
        [QuestionDifficulty.Medium]: [
            "What is the difference between a live connection and a data extract?",
            "What are calculated fields and when would you use them?",
            "Explain what a group and a set are in Tableau."
        ],
        [QuestionDifficulty.Hard]: [
            "Describe what a Level of Detail (LOD) expression is and provide a use case.",
            "How can you improve the performance of a slow Tableau dashboard?",
            "What are context filters and why would you use them?"
        ]
    },
    // Behavioral / General
    'general': {
        [QuestionDifficulty.Easy]: [
            "Tell me about a project you are proud of.",
            "What are your strengths and weaknesses as a developer?",
            "How do you stay up-to-date with new technologies?"
        ],
        [QuestionDifficulty.Medium]: [
            "Describe a challenging technical problem you faced and how you solved it.",
            "Tell me about a time you had a disagreement with a team member. How did you handle it?",
            "How do you approach debugging a complex issue?"
        ],
        [QuestionDifficulty.Hard]: [
            "Describe a time you had to make a major technical decision for a project. What was your process and what was the outcome?",
            "Tell me about a project that failed. What did you learn from it?",
            "How would you design a system for a simple blog application from scratch?"
        ]
    }
};

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const generateOfflineQuestions = (
  profile: CandidateProfile,
  settings: InterviewSettings
): Array<{ text: string; difficulty: QuestionDifficulty }> => {
  
  const counts = {
    [QuestionDifficulty.Easy]: settings.difficultyDistribution.Easy,
    [QuestionDifficulty.Medium]: settings.difficultyDistribution.Medium,
    [QuestionDifficulty.Hard]: settings.difficultyDistribution.Hard,
  };

  const candidateSkills = profile.skills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  const relevantCategories = Object.keys(offlineQuestionBank).filter(category => 
    category !== 'general' && candidateSkills.some(skill => category.includes(skill) || skill.includes(category))
  );

  const sourceCategories = relevantCategories.length > 0 ? relevantCategories : ['general'];
  
  const pickedQuestions: string[] = [];
  const finalQuestions: Array<{ text: string; difficulty: QuestionDifficulty }> = [];

  const pickQuestion = (difficulty: QuestionDifficulty): string | null => {
      let potentialQuestions: string[] = [];
      for (const category of sourceCategories) {
          if (offlineQuestionBank[category]?.[difficulty]) {
              potentialQuestions.push(...offlineQuestionBank[category][difficulty]!);
          }
      }
      // If no skill-based questions found, use general
      if (potentialQuestions.length === 0 && offlineQuestionBank['general']?.[difficulty]) {
          potentialQuestions.push(...offlineQuestionBank['general'][difficulty]!);
      }
      
      potentialQuestions = shuffleArray(potentialQuestions);

      for (const q of potentialQuestions) {
          if (!pickedQuestions.includes(q)) {
              pickedQuestions.push(q);
              return q;
          }
      }
      // If all unique questions are used, allow repeats as a fallback
      return potentialQuestions[0] || null;
  };
  
  (Object.keys(counts) as QuestionDifficulty[]).forEach(difficulty => {
      for (let i = 0; i < counts[difficulty]; i++) {
          const text = pickQuestion(difficulty);
          if (text) {
              finalQuestions.push({ text, difficulty });
          }
      }
  });

  // --- BUG FIX: Do not shuffle the final question list. This maintains the Easy -> Medium -> Hard order. ---
  return finalQuestions;
};