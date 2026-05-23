import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Trophy, Medal, Award } from 'lucide-react';
import { API } from '../ApiUri';
import multiavatar from '@multiavatar/multiavatar';

interface LeaderboardUser {
  _id: string;
  name: string;
  points: number;
  level: string;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get(`${API}/leaderboard`);
        if (res.data.success) {
          setUsers(res.data.leaderboard);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Civic Heroes Leaderboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Recognizing the top contributors making our city a better place. Earn points by reporting verified issues and helping resolve campaigns!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-8">
            {users.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No users found on the leaderboard yet.</div>
            ) : (
              <ul className="space-y-4">
                {users.map((user, index) => (
                  <li 
                    key={user._id} 
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:shadow-md ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' :
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-slate-100 border border-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200' :
                      'bg-white border border-gray-100 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 text-center font-bold text-gray-400">
                        {index === 0 ? <Medal className="w-8 h-8 text-yellow-500 mx-auto" /> :
                         index === 1 ? <Medal className="w-8 h-8 text-gray-400 mx-auto" /> :
                         index === 2 ? <Medal className="w-8 h-8 text-orange-500 mx-auto" /> :
                         `#${index + 1}`}
                      </div>
                      <div className="flex-shrink-0">
                        <div 
                          className="h-12 w-12 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm bg-white"
                          dangerouslySetInnerHTML={{ __html: multiavatar(user._id) }}
                        />
                      </div>
                      <div>
                        <p className={`text-lg font-bold ${index === 0 ? 'text-yellow-700' : 'text-gray-900'}`}>
                          {user.name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Award className="w-4 h-4 mr-1 text-blue-500" />
                          {user.level}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        {user.points}
                      </div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Civic Pts
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
