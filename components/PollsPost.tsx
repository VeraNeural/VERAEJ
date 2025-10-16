'use client';

import { useState, useEffect } from 'react';

interface PollOption {
  id: string;
  text: string;
}

interface PollPostProps {
  pollId: string;
  question: string;
  options: PollOption[];
  closesAt: string | null;
}

export default function PollPost({ pollId, question, options, closesAt }: PollPostProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState<string | null>(null);
  const [results, setResults] = useState<{ [key: string]: number }>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [isVoting, setIsVoting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPollResults();
  }, [pollId]);

  async function loadPollResults() {
    try {
      const res = await fetch(`/api/community/polls/results?pollId=${pollId}`);
      if (res.ok) {
        const data = await res.json();
        
        // Convert votes array to object
        const votesMap: { [key: string]: number } = {};
        data.votes.forEach((vote: { option_id: string; votes: string }) => {
          votesMap[vote.option_id] = parseInt(vote.votes);
        });
        
        setResults(votesMap);
        setTotalVotes(data.totalVotes);
        setUserVote(data.userVote);
        setHasVoted(!!data.userVote);
      }
    } catch (error) {
      console.error('Failed to load poll results:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVote(optionId: string) {
    if (hasVoted || isVoting) return;

    setIsVoting(true);
    try {
      const res = await fetch('/api/community/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId }),
      });

      if (res.ok) {
        setUserVote(optionId);
        setHasVoted(true);
        await loadPollResults();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  }

  function getPercentage(optionId: string): number {
    if (totalVotes === 0) return 0;
    const votes = results[optionId] || 0;
    return Math.round((votes / totalVotes) * 100);
  }

  function getVoteCount(optionId: string): number {
    return results[optionId] || 0;
  }

  const isClosed = closesAt ? new Date(closesAt) < new Date() : false;

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 md:p-6 border-2 border-purple-200">
        <p className="text-slate-600 text-center">Loading poll...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 md:p-6 border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📊</span>
        <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
          {isClosed ? 'Poll Closed' : 'Active Poll'}
        </span>
      </div>

      <h3 className="text-lg md:text-xl font-medium text-slate-900 mb-4">{question}</h3>

      <div className="space-y-3">
        {options.map((option) => {
          const percentage = getPercentage(option.id);
          const voteCount = getVoteCount(option.id);
          const isSelected = userVote === option.id;

          if (hasVoted || isClosed) {
            // Show results
            return (
              <div key={option.id} className="relative">
                <div
                  className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-white'
                      : 'border-purple-200 bg-white'
                  }`}
                >
                  {/* Progress bar background */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-100 to-blue-100'
                        : 'bg-slate-50'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />

                  {/* Content */}
                  <div className="relative px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSelected && <span className="text-purple-600">✓</span>}
                      <span className="font-medium text-slate-900">{option.text}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600">
                        {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                      </span>
                      <span className="text-lg font-bold text-purple-600 min-w-[3rem] text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else {
            // Show voting buttons
            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={isVoting}
                className="w-full px-4 py-3 bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 rounded-xl font-medium text-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                {option.text}
              </button>
            );
          }
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-purple-200 flex items-center justify-between text-sm text-slate-600">
        <span>{totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}</span>
        {closesAt && !isClosed && (
          <span>Closes {new Date(closesAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}
