import React, { useState, useEffect } from 'react';
import { Users, Receipt, Dumbbell, Trash2, ShieldCheck, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { GymUser, Workout, Subscription } from '../types';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';

interface AdminDashboardProps {
  token: string | null;
}

export default function AdminDashboard({ token }: AdminDashboardProps) {
  const [usersList, setUsersList] = useState<GymUser[]>([]);
  const [subsHistory, setSubsHistory] = useState<any[]>([]);
  const [workoutLogsList, setWorkoutLogsList] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'workouts'>('users');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Fetch admin stats and listings
  const fetchAllData = async () => {
    if (!token) return;
    setLoading(true);
    setErrorText('');
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      if (statsRes.ok) setMetrics(statsData);

      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersRes.ok) setUsersList(usersData);

      // Fetch subscriptions
      const subsRes = await fetch('/api/admin/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const subsData = await subsRes.json();
      if (subsRes.ok) setSubsHistory(subsData);

      // Fetch workouts
      const workRes = await fetch('/api/admin/workouts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const workData = await workRes.json();
      if (workRes.ok) setWorkoutLogsList(workData);

    } catch (err: any) {
      setErrorText('Error loading administrative records. Please check API connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  // Handle user account deletion
  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user? This will erase their profile, subscription histories, and health logs permanently.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        // Refresh listings
        fetchAllData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to remove user account');
      }
    } catch {
      alert('Delete operation failed');
    }
  };

  // Process data for charts
  const planChartDataset = metrics?.planDistribution
    ? Object.keys(metrics.planDistribution).map(key => ({
        name: key === 'None' ? 'Unsubscribed' : key,
        value: metrics.planDistribution[key]
      }))
    : [];

  const INDIGO_COLORS = ['#312e81', '#4338ca', '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'];

  return (
    <div className="space-y-10 pb-16">
      {/* Title greet block */}
      <div className="md:flex justify-between items-center border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-white flex items-center gap-2">
            <ShieldCheck className="text-indigo-400" /> Administrative Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Realtime insights of gym active registrants, system audits, and cumulative financial metrics.
          </p>
        </div>
        <div>
          <button
            onClick={fetchAllData}
            disabled={loading}
            className="bg-white/5 hover:bg-white/10 text-white font-semibold font-display text-xs px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition disabled:opacity-50 border border-white/10"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Refreshing...' : 'Refresh Records'}
          </button>
        </div>
      </div>

      {errorText && (
        <div className="bg-red-500/10 border border-red-500/35 p-4 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle size={16} /> {errorText}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Members</p>
            <p className="text-2xl font-bold font-display text-white">{metrics?.totalUsers ?? '...'}</p>
          </div>
        </div>

        <div className="glass border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Memberships</p>
            <p className="text-2xl font-bold font-display text-white">{metrics?.activeMembers ?? '...'}</p>
          </div>
        </div>

        <div className="glass border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Receipt size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold font-display text-green-400 flex items-center gap-0.5">₹{metrics?.totalRevenue ?? '0'}</p>
          </div>
        </div>

        <div className="glass border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Dumbbell size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Workouts Logged</p>
            <p className="text-2xl font-bold font-display text-white">{metrics?.totalWorkoutLogs ?? '...'}</p>
          </div>
        </div>
      </div>

      {/* Analytical visualizations */}
      {planChartDataset.length > 0 && (
        <div className="glass border-white/10 p-6 rounded-3xl space-y-6 shadow-lg">
          <h3 className="text-xs font-bold font-display tracking-wider text-white uppercase flex items-center gap-1.5">
            <TrendingUp size={14} className="text-indigo-400" /> Active Membership Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planChartDataset} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="value" name="Subscribers Count">
                  {planChartDataset.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={INDIGO_COLORS[index % INDIGO_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Interactive Tabs Management */}
      <div className="space-y-6">
        <div className="flex border-b border-white/10 gap-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-xs font-bold font-display uppercase tracking-wider relative cursor-pointer ${
              activeTab === 'users' ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Registered Members ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-3 text-xs font-bold font-display uppercase tracking-wider relative cursor-pointer ${
              activeTab === 'subscriptions' ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Subscription History ({subsHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('workouts')}
            className={`pb-3 text-xs font-bold font-display uppercase tracking-wider relative cursor-pointer ${
              activeTab === 'workouts' ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            workouts logger feed ({workoutLogsList.length})
          </button>
        </div>

        {/* Tab A Content: Users list with search & delete */}
        {activeTab === 'users' && (
          <div className="glass border-white/10 p-6 rounded-3xl overflow-hidden shadow-lg">
            {usersList.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">No users registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-display uppercase tracking-wider text-[10px]">
                      <th className="py-3 pr-2">ID</th>
                      <th className="py-3">Name</th>
                      <th className="py-3">Email Address</th>
                      <th className="py-3">Phone</th>
                      <th className="py-3">Subscribed Plan</th>
                      <th className="py-3">Registered At</th>
                      <th className="py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-light">
                    {usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="py-3 pr-2 text-slate-500">#{user.id}</td>
                        <td className="py-3 font-semibold text-white">{user.name}</td>
                        <td className="py-3 text-slate-400">{user.email}</td>
                        <td className="py-3 text-slate-400">{user.phone || 'N/A'}</td>
                        <td className="py-3">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                            user.membershipType && user.membershipType !== 'None'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-white/5 text-slate-400 border border-white/5'
                          }`}>
                            {user.membershipType}
                          </span>
                        </td>
                        <td className="py-3 text-slate-500">
                          {new Date(user.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab B Content: Subscriptions Logs */}
        {activeTab === 'subscriptions' && (
          <div className="glass border-white/10 p-6 rounded-3xl overflow-hidden shadow-lg">
            {subsHistory.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">No subscription transactions recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-display uppercase tracking-wider text-[10px]">
                      <th className="py-3 pr-2">ID</th>
                      <th className="py-3">User Name</th>
                      <th className="py-3">purchased Plan</th>
                      <th className="py-3">Paid Price</th>
                      <th className="py-3">Active Duration</th>
                      <th className="py-3">Log Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-light">
                    {subsHistory.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/5">
                        <td className="py-3 pr-2 text-slate-500">#{sub.id}</td>
                        <td className="py-3">
                          <p className="font-semibold text-white">{sub.userName}</p>
                          <p className="text-[10px] text-slate-500">{sub.userEmail}</p>
                        </td>
                        <td className="py-3 text-indigo-400 font-medium">{sub.planName}</td>
                        <td className="py-3 font-semibold text-white">₹{sub.price}</td>
                        <td className="py-3 text-slate-400">{sub.startDate} to {sub.endDate}</td>
                        <td className="py-3 text-slate-500">
                          {new Date(sub.createdAt).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab C Content: Workout logger feeds */}
        {activeTab === 'workouts' && (
          <div className="glass border-white/10 p-6 rounded-3xl overflow-hidden shadow-lg">
            {workoutLogsList.length === 0 ? (
              <p className="text-center text-xs text-slate-500 py-6">No workouts tracked across the gym.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-display uppercase tracking-wider text-[10px]">
                      <th className="py-3 pr-2">Log ID</th>
                      <th className="py-3">Member Name</th>
                      <th className="py-3">Date</th>
                      <th className="py-3">Logged Workout</th>
                      <th className="py-3 text-center">Duration</th>
                      <th className="py-3 text-center">Calories</th>
                      <th className="py-3 text-center">Logged Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-light">
                    {workoutLogsList.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5">
                        <td className="py-3 pr-2 text-slate-500">#{log.id}</td>
                        <td className="py-3 font-semibold text-white">{log.userName}</td>
                        <td className="py-3 text-slate-400">{log.date}</td>
                        <td className="py-3 font-medium text-white">{log.exercise}</td>
                        <td className="py-3 text-center">{log.duration} mins</td>
                        <td className="py-3 text-center text-indigo-400 font-semibold">{log.calories} kcal</td>
                        <td className="py-3 text-center text-slate-350 text-slate-300">
                          {log.weight ? `${log.weight} kg` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
