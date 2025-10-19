// OfficialsDashboard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../ApiUri';
import toast from 'react-hot-toast';

interface ProblemItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending'|'under_review'|'assigned'|'resolved';
  createdAt: string;
  address?: string;
}

const DashboardOfficer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [updatingId, setUpdatingId] = useState<string|null>(null);

  const fetchAssigned = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/getProblemOfficial`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) setProblems(res.data.problems);
    } catch (e) {
      toast.error('Failed to load assigned complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssigned(); }, []);

  const updateStatus = async (problemId: string, status: ProblemItem['status']) => {
    try {
      setUpdatingId(problemId);
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API}/problems/${problemId}/official/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success('Status updated');
        fetchAssigned();
      }
    } catch (e:any) {
      toast.error(e.response?.data?.message || 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBadge = (s: ProblemItem['status']) => {
    const map: Record<ProblemItem['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      assigned: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs ${map[s]}`}>{s.replace('_',' ')}</span>;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Assigned Complaints</h1>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {problems.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{p.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-md">{p.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.category}</td>
                  <td className="px-6 py-4">{statusBadge(p.status)}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => updateStatus(p._id,'under_review')} disabled={updatingId===p._id} className="px-3 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50">Under Review</button>
                    <button onClick={() => updateStatus(p._id,'assigned')} disabled={updatingId===p._id} className="px-3 py-1 bg-purple-600 text-white rounded text-xs disabled:opacity-50">In Progress</button>
                    <button onClick={() => updateStatus(p._id,'resolved')} disabled={updatingId===p._id} className="px-3 py-1 bg-green-600 text-white rounded text-xs disabled:opacity-50">Resolve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {problems.length === 0 && (
            <div className="p-6 text-center text-gray-500">No assigned complaints.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOfficer;
