import React from 'react';
import { ArrowRight, Flame, Dumbbell, Award, ShieldAlert, HeartPulse } from 'lucide-react';
import gymHeroImage from '../assets/images/gym_india_hero_1781722854049.jpg';

interface HomeViewProps {
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
  onNavigateToPlans: () => void;
  isLoggedIn: boolean;
  userName?: string;
}

export default function HomeView({ onOpenAuth, onNavigateToPlans, isLoggedIn, userName }: HomeViewProps) {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section with Glass Overlay */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl glass border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-indigo-950/40 to-transparent z-10" />
        <img
          src={gymHeroImage}
          alt="HealthFit Gym Interior"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-20 max-w-2xl px-8 py-20 md:py-32 md:px-12 space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-305 text-indigo-300 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase font-display">
            <Flame size={14} className="animate-pulse text-indigo-400" />
            Voted #1 Premium Fitness Club in Sirsa
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white font-display leading-[1.1]">
            Build Your Ultimate <span className="text-indigo-400">Strength & Health</span>
          </h1>
          <p className="text-sm md:text-md text-slate-300 leading-relaxed max-w-lg">
            HealthFit Gym combines cutting-edge biometrics tracking, world-class certified Indian coaches, and a state-of-the-art facility to power your fitness goals. Track every workout, analyze your trends, and unlock premium progress.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            {isLoggedIn ? (
              <button
                onClick={onNavigateToPlans}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-display px-6 py-3 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
              >
                Go to Subscription Plans <ArrowRight size={18} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-display px-6 py-3 rounded-xl transition duration-200 shadow-lg shadow-indigo-600/20 active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
                >
                  Join HealthFit Today <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold font-display px-6 py-3 rounded-xl transition duration-200 active:scale-[0.98] cursor-pointer"
                >
                  Member Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trust Badges - Styled as frosted pill layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 glass p-6 md:p-8 rounded-3xl border-white/10">
        <div className="text-center md:border-r border-white/10 last:border-0 last:pr-0 md:px-4 space-y-1">
          <div className="text-2xl md:text-3xl font-extrabold text-indigo-400 font-display">15,000+</div>
          <p className="text-xs text-slate-300 font-medium">Active Indian Members</p>
        </div>
        <div className="text-center md:border-r border-white/10 last:border-0 last:pr-0 md:px-4 space-y-1">
          <div className="text-2xl md:text-3xl font-extrabold text-white font-display">15+</div>
          <p className="text-xs text-slate-300 font-medium">Certified Master Trainers</p>
        </div>
        <div className="text-center md:border-r border-white/10 last:border-0 last:pr-0 md:px-4 space-y-1">
          <div className="text-2xl md:text-3xl font-extrabold text-white font-display">₹499/mo</div>
          <p className="text-xs text-slate-300 font-medium">Most Affordable Rates</p>
        </div>
        <div className="text-center last:border-0 last:pr-0 md:px-4 space-y-1">
          <div className="text-2xl md:text-3xl font-extrabold text-indigo-400 font-display">100%</div>
          <p className="text-xs text-slate-300 font-medium">Secure Data Progress</p>
        </div>
      </div>

      {/* Core Services Section */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-4xl font-bold font-display tracking-tight text-white">
            Why HealthFit Gym is Sirsa's Elite Choice
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto">
            We provide a holistic ecosystem focusing on high-quality training, integrated wellness metrics tracking, and budget-friendly memberships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-interactive p-6 rounded-2xl group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition duration-300 shadow-md">
              <Dumbbell size={24} />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Imported Core Gym Equipment</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped with elite commercial strength lines, heavy power cages, Olympic bar bundles, and dedicated crossfit tracks from USA & Italy.
            </p>
          </div>

          <div className="glass-interactive p-6 rounded-2xl group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition duration-300 shadow-md">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Interactive Workout Analytics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Say goodbye to written notebooks. Our integrated digital logger allows you to record sets, repetitions, weights, and daily calories visually in Realtime.
            </p>
          </div>

          <div className="glass-interactive p-6 rounded-2xl group space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition duration-300 shadow-md">
              <HeartPulse size={24} />
            </div>
            <h3 className="text-lg font-bold font-display text-white">Nutrition & Diet Consults</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get personalized macro calculations reflecting Indian dietary habits (high-protein vegetarian/non-vegetarian guidelines) designed specifically for you.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlight CTA Banner */}
      <div className="glass border-white/10 p-8 rounded-3xl md:flex md:items-center justify-between gap-8 space-y-6 md:space-y-0 shadow-xl shadow-indigo-950/10">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-xl md:text-2xl font-bold font-display text-white">Take First Step towards a Healthier Lifestyle</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gain full access to the interactive daily calorie analyzer, comprehensive workout trackers, and certified Indian instructors. Register today and customize your personalized subscription package instantly.
          </p>
        </div>
        <div>
          {isLoggedIn ? (
            <button
              onClick={onNavigateToPlans}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-display px-6 py-3 rounded-xl transition duration-150 active:scale-[0.98] inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              Get Membership Now <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold font-display px-6 py-3 rounded-xl transition duration-150 active:scale-[0.98] inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              Start Free Registration <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
