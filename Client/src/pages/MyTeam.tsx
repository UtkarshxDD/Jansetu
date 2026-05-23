import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, TrendingUp, Award, Users, CheckCircle, Flag, Zap } from 'lucide-react';
import axios from 'axios';
import { ADMIN_API } from '../ApiUri';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  totalReported: number;
  totalResolved: number;
  totalVotes: number;
  avgRating: number;
  score: number;
}

const MEDAL_CONFIG: Record<number, { color: string; bg: string; icon: string; label: string }> = {
  1: { color: 'text-yellow-600', bg: 'from-yellow-50 to-amber-100 border-yellow-300', icon: '🥇', label: 'Gold' },
  2: { color: 'text-gray-500', bg: 'from-gray-50 to-slate-100 border-gray-300', icon: '🥈', label: 'Silver' },
  3: { color: 'text-amber-700', bg: 'from-orange-50 to-amber-50 border-amber-300', icon: '🥉', label: 'Bronze' },
};

const StatChip: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({
  icon, label, value, color
}) => (
  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${color}`}>
    {icon}
    <span>{label}: <strong>{value}</strong></span>
  </div>
);

const MyTeam: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${ADMIN_API}/leaderboard`);
        if (res.data.success) {
          setLeaderboard(res.data.leaderboard);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getScoreColor = (score: number, max: number) => {
    const pct = max > 0 ? score / max : 0;
    if (pct > 0.7) return 'bg-green-500';
    if (pct > 0.4) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const maxScore = leaderboard[0]?.score ?? 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-12 px-4">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-yellow-300 text-sm font-medium mb-6">
          <Trophy className="w-4 h-4" />
          Civic Champions Leaderboard
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Community Heroes 🏆
        </h1>
        <p className="text-blue-200 text-lg max-w-xl mx-auto">
          Citizens making a real difference — ranked by issues resolved, reports filed, and community impact score.
        </p>

        {/* Score legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-blue-300">
          <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-400" /> Resolved = 10 pts</div>
          <div className="flex items-center gap-1.5"><Flag className="w-4 h-4 text-blue-400" /> Reported = 2 pts</div>
          <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-yellow-400" /> Votes earned = 1 pt</div>
        </div>
      </motion.div>

      {/* Top 3 Podium */}
      {!loading && !error && leaderboard.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto flex items-end justify-center gap-4 mb-10"
        >
          {/* 2nd place */}
          <div className="flex-1 text-center">
            <div className="text-4xl mb-2">🥈</div>
            <div className="bg-slate-700/60 backdrop-blur border border-gray-600 rounded-2xl px-4 py-5 h-28 flex flex-col items-center justify-end">
              <p className="text-white font-bold truncate w-full text-center">{leaderboard[1]?.name}</p>
              <p className="text-blue-300 text-sm font-semibold">{leaderboard[1]?.score} pts</p>
            </div>
          </div>

          {/* 1st place */}
          <div className="flex-1 text-center">
            <div className="text-5xl mb-2">🥇</div>
            <div className="bg-gradient-to-b from-yellow-500/30 to-amber-500/20 backdrop-blur border border-yellow-500/50 rounded-2xl px-4 py-5 h-36 flex flex-col items-center justify-end shadow-lg shadow-yellow-900/30">
              <p className="text-white font-bold truncate w-full text-center">{leaderboard[0]?.name}</p>
              <p className="text-yellow-300 text-sm font-bold">{leaderboard[0]?.score} pts</p>
            </div>
          </div>

          {/* 3rd place */}
          <div className="flex-1 text-center">
            <div className="text-4xl mb-2">🥉</div>
            <div className="bg-slate-700/60 backdrop-blur border border-gray-600 rounded-2xl px-4 py-5 h-24 flex flex-col items-center justify-end">
              <p className="text-white font-bold truncate w-full text-center">{leaderboard[2]?.name}</p>
              <p className="text-amber-400 text-sm font-semibold">{leaderboard[2]?.score} pts</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full Leaderboard */}
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😔</div>
            <p className="text-gray-400 text-lg">Could not load leaderboard right now.</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No data yet</h3>
            <p className="text-gray-500">Be the first to report an issue and claim the top spot!</p>
          </div>
        ) : (
          <AnimatePresence>
            {leaderboard.map((entry, index) => {
              const medal = MEDAL_CONFIG[entry.rank];
              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  className={`mb-3 bg-gradient-to-r ${
                    medal ? medal.bg : 'from-slate-800/70 to-slate-700/70 border-slate-600'
                  } border rounded-2xl p-4 flex items-center gap-4 backdrop-blur`}
                >
                  {/* Rank */}
                  <div className="text-2xl w-10 text-center flex-shrink-0">
                    {medal ? medal.icon : <span className="text-gray-400 font-bold text-lg">#{entry.rank}</span>}
                  </div>

                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${
                    entry.rank === 1 ? 'bg-yellow-500 text-white' :
                    entry.rank === 2 ? 'bg-gray-400 text-white' :
                    entry.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-blue-700 text-white'
                  }`}>
                    {entry.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-900 truncate">{entry.name}</p>
                      {entry.rank <= 3 && (
                        <Award className={`w-4 h-4 flex-shrink-0 ${medal?.color}`} />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <StatChip
                        icon={<Flag className="w-3 h-3" />}
                        label="Reported"
                        value={entry.totalReported}
                        color="bg-blue-100 text-blue-700"
                      />
                      <StatChip
                        icon={<CheckCircle className="w-3 h-3" />}
                        label="Resolved"
                        value={entry.totalResolved}
                        color="bg-green-100 text-green-700"
                      />
                      {entry.avgRating > 0 && (
                        <StatChip
                          icon={<Star className="w-3 h-3" />}
                          label="Avg ⚠️"
                          value={`${entry.avgRating}/5`}
                          color="bg-yellow-100 text-yellow-700"
                        />
                      )}
                    </div>
                  </div>

                  {/* Score + Bar */}
                  <div className="text-right flex-shrink-0 min-w-[80px]">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-gray-900 text-lg">{entry.score}</span>
                      <span className="text-gray-400 text-xs">pts</span>
                    </div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden ml-auto">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getScoreColor(entry.score, maxScore)}`}
                        style={{ width: `${Math.max(8, (entry.score / maxScore) * 100)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MyTeam;
