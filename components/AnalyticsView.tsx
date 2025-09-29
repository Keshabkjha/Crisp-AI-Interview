

import React from 'react';
import { useInterviewState } from '../hooks/useInterviewState';
import { InterviewStatus } from '../types';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { AnalyticsIcon } from './icons';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: '#94a3b8',
        font: {
          size: 14,
        }
      }
    },
    title: {
      display: true,
      color: '#e2e8f0',
      font: {
        size: 18,
      }
    },
    tooltip: {
        backgroundColor: '#1e293b',
        titleFont: {
            size: 14,
        },
        bodyFont: {
            size: 12,
        },
    }
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(100, 116, 139, 0.2)' }
    },
    y: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(100, 116, 139, 0.2)' }
    }
  }
};


export const AnalyticsView: React.FC = () => {
    const { candidates } = useInterviewState();
    const completedCandidates = candidates.filter(c => c.interviewStatus === InterviewStatus.Completed);
    const scoredCandidates = completedCandidates.filter(c => typeof c.finalScore === 'number');

    const scoreDistributionData = {
        labels: ['0-20', '21-40', '41-60', '61-80', '81-100'],
        datasets: [{
            label: 'Number of Candidates',
            data: [
                scoredCandidates.filter(c => c.finalScore! <= 20).length,
                scoredCandidates.filter(c => c.finalScore! > 20 && c.finalScore! <= 40).length,
                scoredCandidates.filter(c => c.finalScore! > 40 && c.finalScore! <= 60).length,
                scoredCandidates.filter(c => c.finalScore! > 60 && c.finalScore! <= 80).length,
                scoredCandidates.filter(c => c.finalScore! > 80).length,
            ],
            backgroundColor: 'rgba(34, 211, 238, 0.6)',
            borderColor: 'rgba(34, 211, 238, 1)',
            borderWidth: 1,
        }]
    };

    const difficultyPerformance = () => {
        const scores = { Easy: { total: 0, count: 0 }, Medium: { total: 0, count: 0 }, Hard: { total: 0, count: 0 } };
        completedCandidates.forEach(c => {
            c.answers.forEach(a => {
                if (!a) return; 
                const question = c.questions.find(q => q.id === a.questionId);
                // BUG FIX: Only include technical/follow-up questions in analytics, not intros.
                if (question && typeof a.score === 'number' && question.source !== 'intro' && question.source !== 'intro-followup') {
                    scores[question.difficulty].total += a.score;
                    scores[question.difficulty].count += 1;
                }
            });
        });
        
        return {
            labels: ['Easy', 'Medium', 'Hard'],
            datasets: [{
                label: 'Average Score (/10)',
                data: [
                    scores.Easy.count > 0 ? scores.Easy.total / scores.Easy.count : 0,
                    scores.Medium.count > 0 ? scores.Medium.total / scores.Medium.count : 0,
                    scores.Hard.count > 0 ? scores.Hard.total / scores.Hard.count : 0,
                ],
                backgroundColor: ['rgba(74, 222, 128, 0.6)', 'rgba(250, 204, 21, 0.6)', 'rgba(248, 113, 113, 0.6)'],
                borderColor: ['rgba(74, 222, 128, 1)', 'rgba(250, 204, 21, 1)', 'rgba(248, 113, 113, 1)'],
                borderWidth: 1,
            }]
        };
    };


    if(completedCandidates.length === 0) {
        return (
            <div>
                 <h2 className="text-2xl font-bold text-slate-100 mb-6">Analytics Dashboard</h2>
                <div className="text-center p-12 bg-slate-800/40 rounded-lg border border-slate-700/50">
                    <AnalyticsIcon className="w-16 h-16 text-slate-500 mx-auto mb-4"/>
                    <h3 className="text-xl font-semibold text-slate-200 mb-2">No Data Available</h3>
                    <p className="text-slate-400">Complete an interview to see performance analytics here.</p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-800/40 p-6 rounded-lg h-[400px] border border-slate-700/50">
                     <Bar options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Candidate Score Distribution' } } }} data={scoreDistributionData} />
                </div>
                <div className="bg-slate-800/40 p-6 rounded-lg h-[400px] border border-slate-700/50">
                    <Bar options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Average Score by Question Difficulty' } } }} data={difficultyPerformance()} />
                </div>
            </div>
        </div>
    );
};
