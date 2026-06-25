import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Flame, Clock, Scale, Dumbbell, Receipt, AlertCircle, TrendingUp } from 'lucide-react';
import { Workout, Subscription } from '../types';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface MemberDashboardProps {
  workouts: Workout[];
  subscriptions: Subscription[];
  onAddWorkout: (workout: Omit<Workout, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  onDeleteWorkout: (id: number) => Promise<void>;
  userProfile: any;
}

export default function MemberDashboard({ workouts, subscriptions, onAddWorkout, onDeleteWorkout, userProfile }: MemberDashboardProps) {
  // Local state for the logging form
  const [showLogForm, setShowLogForm] = useState(false);
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Built-in preset exercises for ease of use
  const PRESET_EXERCISES = [
    "Barbell Bench Press",
    "Conventional Deadlift",
    "Barbell Squats",
    "Treadmill Runs",
    "HIIT Kettlebell Circuit",
    "Indoor Spin/Cycling",
    "Bodyweight Push-Up Sets",
    "Core/Pilates Session"
  ];

  // Calculations for KPI metrics
  const totalWorkoutsCount = workouts.length;
  const totalMinutes = workouts.reduce((sum, item) => sum + (item.duration || 0), 0);
  const totalCaloriesKB = workouts.reduce((sum, item) => sum + (item.calories || 0), 0);
  
  // Latest weight logged
  const latestWeightItem = workouts.find(w => w.weight !== null && w.weight !== undefined);
  const currentWeightVal = latestWeightItem ? latestWeightItem.weight : 'N/A';

  // Format dataset chronologically for chart rendering
  const sortedChronologically = [...workouts].reverse();
  const chartData = sortedChronologically.map((item) => ({
    date: item.date.substring(5), // Show MM-DD format
    calories: item.calories,
    weight: item.weight || undefined,
    duration: item.duration,
    exercise: item.exercise
  }));

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!exercise || !duration || !calories) {
      setErrorMsg('Please enter Exercise Name, Duration, and Calories burned.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddWorkout({
        date,
        exercise,
        duration: Number(duration),
        calories: Number(calories),
        weight: weight ? Number(weight) : null
      });
      // Reset form fields
      setExercise('');
      setDuration('');
      setCalories('');
      setWeight('');
      setShowLogForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Title greeting row */}
      <div className="md:flex justify-between items-center space-y-4 md:space-y-0 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold font-display text-white">
            Hello, <span className="text-indigo-400">{userProfile?.name || 'Athlete'}</span>
          </h1>
          <p className="text-xs text-slate-400">
            Welcome to your HealthFit Workspace. Log workouts, measure progress & audit subscriptions below.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-display text-xs px-4 py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/25"
          >
            <Plus size={16} /> Log Today's Workout
          </button>
        </div>
      </div>

      {/* Logging form toggle card */}
      {showLogForm && (
        <div className="glass border-white/10 p-6 rounded-2xl animate-fadeIn space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold font-display text-white">Record Daily Health Stats</h3>
            <button
              onClick={() => setShowLogForm(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/35 p-3 rounded-xl text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-505 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-5 space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Exercise / Workout</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Legs Hypertrophy Day"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-505 outline-none focus:ring-1 focus:ring-indigo-500"
                  list="exercise-presets"
                />
                <datalist id="exercise-presets">
                  {PRESET_EXERCISES.map((p, idx) => (
                    <option key={idx} value={p} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="md:col-span-1.5 space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duration (Min)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-555 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-1.5 space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Burned (Kcal)</label>
              <input
                type="number"
                required
                min="0"
                placeholder="350"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-555 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-1.5 space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weight (Kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="72.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-indigo-555 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-12 pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold font-display text-xs px-5 py-2.5 rounded-xl cursor-pointer transition w-full shadow-lg shadow-indigo-600/10"
              >
                {isSubmitting ? 'Recording stats...' : 'Confirm Log Entry'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* State Indicators (KPI cards as frosted sub-elements) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Dumbbell size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-455 text-slate-400 tracking-wider font-display">Workouts Logged</p>
            <p className="text-xl font-bold font-display text-white">{totalWorkoutsCount}</p>
          </div>
        </div>

        <div className="glass border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-455 text-slate-400 tracking-wider font-display">Active Minutes</p>
            <p className="text-xl font-bold font-display text-white">{totalMinutes} mins</p>
          </div>
        </div>

        <div className="glass border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-455 text-slate-400 tracking-wider font-display">Energy Burned</p>
            <p className="text-xl font-bold font-display text-white">{totalCaloriesKB} kcal</p>
          </div>
        </div>

        <div className="glass border-white/10 p-5 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Scale size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-455 text-slate-400 tracking-wider font-display">Latest Weight</p>
            <p className="text-xl font-bold font-display text-white">
              {currentWeightVal !== 'N/A' ? `${currentWeightVal} kg` : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Charts (Recharts visualization) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart A: Weight progress line trend */}
        <div className="glass border-white/10 p-5 rounded-3xl space-y-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold font-display tracking-wider text-white uppercase flex items-center gap-1.5">
              <TrendingUp size={14} className="text-indigo-400" /> Bodyweight Log Trend (kg)
            </h3>
            {chartData.length > 0 && (
              <span className="text-[10px] text-slate-400">Total Entries: {chartData.filter(d => d.weight !== undefined).length}</span>
            )}
          </div>
          <div className="h-64">
            {chartData.filter(d => d.weight !== undefined).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.filter(d => d.weight !== undefined)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis type="number" domain={['dataMin - 2', 'dataMax + 2']} stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                  <Line type="monotone" dataKey="weight" name="Weight (kg)" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 text-xs">
                <AlertCircle size={24} className="text-slate-600" />
                <span>No Weight data available. Log weights with your workouts.</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart B: Calories expended bar/area chart */}
        <div className="glass border-white/10 p-5 rounded-3xl space-y-4 shadow-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold font-display tracking-wider text-white uppercase flex items-center gap-1.5">
              <Flame size={14} className="text-indigo-400" /> Energy Expenditures (Kcal)
            </h3>
          </div>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                  <Area type="monotone" dataKey="calories" name="Calories (Kcal)" stroke="#4f46e5" fillOpacity={1} fill="url(#colorCalories)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 text-xs">
                <AlertCircle size={24} className="text-slate-600" />
                <span>No workout data logs to display calorie expenditure chart.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 2 columns list of workouts vs plan history */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Workout Activity table column */}
        <div className="lg:col-span-8 glass border-white/10 p-6 rounded-3xl space-y-4 shadow-lg">
          <h3 className="text-sm font-bold font-display text-white border-b border-white/10 pb-3">Workout Logs Dashboard</h3>

          {workouts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-2">
              <Dumbbell className="mx-auto text-slate-600 mb-1" size={28} />
              <p>You haven't logged any workouts yet.</p>
              <p>Click "Log Today's Workout" at the top to record your first session!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 font-display">
                    <th className="py-3 pr-2 font-display uppercase tracking-wider font-bold text-[10px]">Date</th>
                    <th className="py-3 font-display uppercase tracking-wider font-bold text-[10px]">Exercise Name</th>
                    <th className="py-3 text-center font-display uppercase tracking-wider font-bold text-[10px]">Duration</th>
                    <th className="py-3 text-center font-display uppercase tracking-wider font-bold text-[10px]">Calories</th>
                    <th className="py-3 text-center font-display uppercase tracking-wider font-bold text-[10px]">Weight</th>
                    <th className="py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-light">
                  {workouts.map((work) => (
                    <tr key={work.id} className="hover:bg-white/5">
                      <td className="py-3 pr-2 whitespace-nowrap text-slate-400">{work.date}</td>
                      <td className="py-3 font-medium text-white">{work.exercise}</td>
                      <td className="py-3 text-center">{work.duration} min</td>
                      <td className="py-3 text-center text-indigo-350 text-indigo-400">{work.calories} kcal</td>
                      <td className="py-3 text-center">{work.weight ? `${work.weight} kg` : 'N/A'}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onDeleteWorkout(work.id)}
                          className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition cursor-pointer"
                          title="Delete Log"
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

        {/* Subscription pricing history column */}
        <div className="lg:col-span-4 glass border-white/10 p-6 rounded-3xl space-y-4 shadow-lg">
          <h3 className="text-sm font-bold font-display text-white border-b border-white/10 pb-3">Subscription Audits</h3>

          <div className="space-y-4">
            <div className="bg-black/20 p-4 border border-white/5 rounded-xl space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Membership Plan</p>
              <div className="flex justify-between items-center pt-1">
                <p className="text-sm font-bold font-display text-white">{userProfile?.membershipType || 'None'}</p>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                  userProfile?.membershipType && userProfile.membershipType !== 'None'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/25'
                }`}>
                  {userProfile?.membershipType && userProfile.membershipType !== 'None' ? 'Active' : 'Unsubscribed'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-455 text-slate-400 uppercase tracking-wider">Purchase Logs</p>

              {subscriptions.length === 0 ? (
                <div className="text-center p-6 text-slate-500 text-xs border border-dashed border-white/10 rounded-xl space-y-1">
                  <Receipt className="mx-auto text-slate-600 mb-1" size={18} />
                  <p>No transactions registered.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-black/10 p-3.5 border border-white/5 rounded-xl text-xs flex justify-between gap-3 items-center">
                      <div className="space-y-0.5">
                        <p className="font-bold text-white font-display text-xs">{sub.planName}</p>
                        <p className="text-[10px] text-slate-500">{sub.startDate} to {sub.endDate}</p>
                      </div>
                      <div className="text-right font-display font-semibold text-white">
                        ₹{sub.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
