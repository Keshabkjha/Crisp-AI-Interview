
import { useMemo } from 'react';
import { useInterviewState } from '../hooks/useInterviewState';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function AnalyticsView() {
  const { state } = useInterviewState();
  const { candidates } = state;

  const completedCandidates = useMemo(
    () => candidates.filter((c) => c.interviewStatus === 'completed'),
    [candidates]
  );

  const scoreDistributionData = useMemo(() => {
    const bins = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };
    completedCandidates.forEach((c) => {
      const score = c.finalScore;
      if (score === null) return;
      if (score <= 20) bins['0-20']++;
      else if (score <= 40) bins['21-40']++;
      else if (score <= 60) bins['41-60']++;
      else if (score <= 80) bins['61-80']++;
      else bins['81-100']++;
    });
    return {
      labels: Object.keys(bins),
      datasets: [
        {
          label: '# of Candidates',
          data: Object.values(bins),
          backgroundColor: 'rgba(34, 211, 238, 0.6)',
          borderColor: 'rgba(34, 211, 238, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [completedCandidates]);

  const avgScoreByDifficultyData = useMemo(() => {
    const scores = { Easy: { total: 0, count: 0 }, Medium: { total: 0, count: 0 }, Hard: { total: 0, count: 0 } };
    completedCandidates.forEach(c => {
        c.answers.forEach(ans => {
            const question = c.questions.find(q => q.id === ans.questionId);
            if(question && ans.score !== undefined && !question.isFollowUp) {
                scores[question.difficulty].total += ans.score;
                scores[question.difficulty].count++;
            }
        });
    });

    const labels = ['Easy', 'Medium', 'Hard'];
    const data = labels.map(label => {
        const key = label as 'Easy' | 'Medium' | 'Hard';
        return scores[key].count > 0 ? (scores[key].total / scores[key].count) : 0;
    });

    return {
        labels,
        datasets: [{
            label: 'Average Score / 10',
            data,
            backgroundColor: ['rgba(74, 222, 128, 0.6)', 'rgba(251, 191, 36, 0.6)', 'rgba(239, 68, 68, 0.6)'],
            borderColor: ['rgba(74, 222, 128, 1)', 'rgba(251, 191, 36, 1)', 'rgba(239, 68, 68, 1)'],
            borderWidth: 1,
        }]
    };
  }, [completedCandidates]);
  
  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#cbd5e1' } } },
    scales: { 
        y: { 
            ticks: { color: '#94a3b8', beginAtZero: true }, 
            grid: { color: 'rgba(100, 116, 139, 0.2)' }
        }, 
        x: { 
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(100, 116, 139, 0.2)' }
        } 
    }
  };
   const pieChartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#cbd5e1' } } }
  };


  if (completedCandidates.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-4">Analytics</h1>
        <div className="bg-slate-800 p-8 rounded-lg">
          <p className="text-slate-400">
            No completed interviews yet. Once candidates complete their interviews, performance analytics will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
        <h1 className="text-3xl font-bold text-slate-100 mb-6">
          Performance Analytics
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-800 p-6 rounded-lg shadow-2xl">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Candidate Score Distribution</h2>
                <div className="h-80">
                   <Bar options={chartOptions} data={scoreDistributionData} />
                </div>
            </div>
             <div className="bg-slate-800 p-6 rounded-lg shadow-2xl">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Average Score by Difficulty</h2>
                 <div className="h-80">
                   <Pie options={pieChartOptions} data={avgScoreByDifficultyData} />
                </div>
            </div>
        </div>
    </div>
  );
}
